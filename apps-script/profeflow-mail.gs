/**
 * PROFEFLOW — REGISTRO MANUAL DE ENTREGAS POR CORREO
 * Apps Script vinculado a un Google Sheets (un solo archivo .gs).
 * Versión: 2026-11-03, SOLO correos sin leer y exportación con asunto identificable; excepciones docentes expresas; sin disparadores.
 *
 * Los catálogos Alumnos y Tareas proceden de:
 * ProfeFlow > Entregas por correo > Exportar catálogo de Apps Script.
 * Convierte el XLSX a Google Sheets y utiliza el menú para importarlo por URL.
 * No necesita DatosAlumnos.gs ni MATERIAS_POR_GRUPO.
 * El registro técnico está oculto. No altera leído/no leído en Gmail.
 */

const PF = Object.freeze({
  alumnos: 'Alumnos',
  tareas: 'Tareas',
  revision: 'RevisionEntregas',
  registro: '_RegistroCorreos', // Datos técnicos ocultos; no editar directamente.
  sinAsunto: 'SinAsunto',
  excepciones: '_ExcepcionesDocentes', // Historial de autorizaciones manuales, nunca automático.
  ignorados: '_Ignorados', // IDs para no volver a examinar remitentes personales.
  otros: 'Otros',
  exportacion: 'ProfeFlow_Importar',
  config: 'Configuracion',
  consultaBase: 'in:inbox is:unread', // Solo hilos con mensajes sin leer. La exportación aplica, además, un filtro por asunto.
  tamanoPagina: 100,
  paginasPorEjecucion: 4,
  zona: 'America/Mexico_City',
  nombrePropOffset: 'PF_CORREOS_OFFSET',
  nombrePropQuery: 'PF_CORREOS_QUERY',
  hdrAlumnos: ['SemestreID','AlumnoID','Matricula','Correo','Nombre','GrupoID','Grupo','MateriaID','Materia'],
  hdrTareas: ['SemestreID','ActividadID','Codigo','Actividad','GrupoID','Grupo','MateriaID','Materia','ParcialID','FechaLimite'],
  hdrRevision: ['ID mensaje','Fecha correo','Alumno registrado','Grupos registrados',
    'Grupo indicado en correo','Grupo identificado','Nombre','ID alumno',
    'Correo','Asunto','Tarea identificada','Materia','Fecha límite',
    'Días de retraso','Porcentaje máximo','Formato','Adjunto','Estado',
    'Observaciones','SemestreID','ActividadID','AlumnoID'],
  hdrVista: ['Fecha correo','Alumno','Matrícula','Grupo identificado','Correo','Asunto',
    'Actividad','Materia','Fecha límite','Días de retraso','Porcentaje máximo',
    'Adjunto','Estado','Observaciones','ID interno'],
  hdrSinAsunto: ['Fecha correo','Alumno','Matrícula','Grupo identificado','Correo','Adjunto','Observaciones','ID interno'],
  hdrIgnorados: ['ID mensaje','Fecha correo','Motivo'],
  hdrExcepciones: ['ID mensaje','SemestreID','ActividadID','AlumnoID','Correo','Acción','Fecha','Docente','Justificación'],
  hdrExportacion: ['ID del mensaje','Fecha','Correo','Matrícula','Grupo','Tarea','Adjunto','Estado','Observaciones','Asunto','No leído','Dirección','Enlaces','ID del hilo','Motivo filtro','Fecha exportación'],
  hdrOtros: ['ID mensaje','Fecha correo','Nombre','Correo','Asunto','Adjunto','Observaciones']
});

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Control de entregas')
    .addItem('Configurar hojas (sin borrar registros)', 'configurarSistema')
    .addItem('Importar catálogo desde ProfeFlow', 'importarCatalogoDesdeURL')
    .addSeparator()
    .addItem('Procesar correos ahora', 'procesarCorreosPorGrupos')
    .addItem('Reanalizar entregas ya registradas', 'reanalizarEntregasRegistradas')
    .addItem('Actualizar vistas de revisión', 'actualizarVistasRevision')
    .addItem('Aprobar correo sin asunto seleccionado', 'aprobarSinAsuntoSeleccionado')
    .addItem('Aprobar enlace Drive seleccionado', 'aprobarEnlaceDriveSeleccionado')
    .addItem('Revocar excepción seleccionada', 'revocarExcepcionSeleccionada')
    .addItem('Preparar hoja para ProfeFlow', 'prepararExportacionProfeFlow')
    .addItem('Abrir hoja de exportación', 'abrirHojaExportacion')
    .addItem('Vincular registros anteriores del semestre', 'vincularRegistrosLegados')
    .addSeparator()
    .addItem('Eliminar activadores antiguos de correos', 'eliminarDisparadoresAntiguos')
    .addToUi();
}

function configurarSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Nunca reiniciar RevisionEntregas al cambiar de semestre.
  asegurarHoja_(ss, PF.alumnos, PF.hdrAlumnos);
  asegurarHoja_(ss, PF.tareas, PF.hdrTareas);
  prepararEstructuraRevision_(ss); // Migra el registro anterior con respaldo.
  asegurarHoja_(ss, PF.otros, PF.hdrOtros);
  asegurarHoja_(ss, PF.exportacion, PF.hdrExportacion);
  const parametros = asegurarHoja_(ss, PF.config, ['Parametro','Valor','Descripción']);
  if (parametros.getLastRow() < 2) {
    const desde = new Date(); desde.setDate(desde.getDate() - 150);
    parametros.getRange(2,2,1,1).setNumberFormat('@');
    parametros.getRange(2,1,3,3).setValues([
      ['FechaDesde', Utilities.formatDate(desde, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd'),
        'Inicio de la búsqueda. Ajustar al comienzo del semestre (AAAA-MM-DD).'],
      ['SoloConAdjuntos','NO','NO permite revisar mensajes sospechosos sin adjuntos.'],
      ['EtiquetarGmail','SI','Agrega etiquetas por grupo, sin cambiar leído/no leído.']
    ]);
  }
  actualizarVistasRevision_(ss);
  if(ss.getSheetByName(PF.alumnos).getLastRow()>1)
    prepararExportacionProfeFlow_(false);
  ss.toast('Lista la exportación por asunto; correos ambiguos quedan para revisión.', 'Control de entregas', 5);
}

function asegurarHoja_(ss, nombre, encabezados) {
  let sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);
  const ultima = sh.getLastRow();
  if (!ultima) sh.getRange(1,1,1,encabezados.length).setValues([encabezados]);
  else if (nombre === PF.registro) {
    // Migración aditiva: las 19 columnas anteriores no se modifican.
    const actuales = sh.getRange(1,1,1,Math.min(sh.getLastColumn(),encabezados.length)).getDisplayValues()[0];
    if (actuales[0] !== 'ID mensaje') throw new Error('RevisionEntregas tiene otro formato: no se modifica.');
    for (let i=19; i<encabezados.length; i++) {
      const celda=sh.getRange(1,i+1);
      if (!String(celda.getDisplayValue()).trim()) celda.setValue(encabezados[i]);
    }
  } else {
    const actuales = sh.getRange(1,1,1,Math.min(sh.getLastColumn(),encabezados.length)).getDisplayValues()[0];
    if (nombre !== PF.alumnos && nombre !== PF.tareas && actuales[0] !== encabezados[0])
      throw new Error(nombre + ' tiene encabezados incompatibles; revísalos antes de continuar.');
    // Las dos hojas de catálogo pueden contener el esquema viejo hasta que se importe el nuevo.
  }
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,encabezados.length).setFontWeight('bold');
  return sh;
}

/** Importa exactamente las dos pestañas que ProfeFlow genera en su XLSX. */
function importarCatalogoDesdeURL() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt('Importar catálogo de ProfeFlow',
    '1. Descarga el XLSX desde ProfeFlow.\n2. Súbelo a Drive y conviértelo a Google Sheets.\n3. Pega aquí la URL del Google Sheets convertido.\n\nSolo se reemplazan las hojas Alumnos y Tareas.', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const id = extraerIdDeURL_(resp.getResponseText());
  const origen = SpreadsheetApp.openById(id);
  const origenAlumnos = origen.getSheetByName(PF.alumnos);
  const origenTareas = origen.getSheetByName(PF.tareas);
  if (!origenAlumnos || !origenTareas) throw new Error('El archivo debe tener las pestañas Alumnos y Tareas.');
  const alumnos = leerFilasCatalogo_(origenAlumnos, PF.hdrAlumnos);
  const tareas = leerFilasCatalogo_(origenTareas, PF.hdrTareas);
  if (!alumnos.length) throw new Error('El catálogo no contiene alumnos; no se reemplazará el existente.');
  const semestres = new Set(alumnos.map(x=>x.SemestreID).concat(tareas.map(x=>x.SemestreID)).filter(Boolean));
  if (semestres.size !== 1 || alumnos.some(x=>!x.SemestreID) || tareas.some(x=>!x.SemestreID))
    throw new Error('El archivo contiene varios semestres o carece de SemestreID. Exporta el semestre activo desde ProfeFlow.');
  const matriculas = new Set();
  alumnos.forEach(a=>{
    if (!a.AlumnoID || !a.Matricula || !a.Grupo || !a.GrupoID)
      throw new Error('Alumno con ID, matrícula o grupo incompleto. Corrige el catálogo de ProfeFlow.');
    const llave=a.AlumnoID+'|'+a.GrupoID;
    if (matriculas.has(llave)) throw new Error('Alumno duplicado en el mismo grupo: '+a.Matricula);
    matriculas.add(llave);
  });
  const llaveTareas = new Set();
  tareas.forEach(t=>{
    if (!t.ActividadID || !t.Actividad || !t.Grupo || !t.GrupoID)
      throw new Error('Actividad con ID, nombre o grupo incompleto.');
    const llave=t.ActividadID+'|'+t.GrupoID;
    if (llaveTareas.has(llave)) throw new Error('Actividad duplicada: '+t.Actividad);
    llaveTareas.add(llave);
  });
  const confirmacion = ui.alert('Confirmar actualización',
    'Semestre: '+[...semestres][0]+'\nAlumnos/grupo: '+alumnos.length+ '\nActividades: '+tareas.length+
    '\n\nSe reemplazarán SOLO Alumnos y Tareas. RevisionEntregas y otros historiales permanecerán intactos. ¿Continuar?',
    ui.ButtonSet.YES_NO);
  if (confirmacion !== ui.Button.YES) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Crear primero copia de respaldo de los catálogos previos si existen.
  const shA = ss.getSheetByName(PF.alumnos);
  const shT = ss.getSheetByName(PF.tareas);
  if (shA && shA.getLastRow()>1) guardarRespaldoCatalogo_(shA);
  if (shT && shT.getLastRow()>1) guardarRespaldoCatalogo_(shT);
  reemplazarCatalogo_(ss, PF.alumnos, PF.hdrAlumnos, alumnos);
  reemplazarCatalogo_(ss, PF.tareas, PF.hdrTareas, tareas);
  PropertiesService.getDocumentProperties().deleteProperty(PF.nombrePropOffset);
  PropertiesService.getDocumentProperties().deleteProperty(PF.nombrePropQuery);
  ui.alert('Catálogo actualizado. Revisa Configuracion → FechaDesde y luego procesa los correos manualmente.');
}

function extraerIdDeURL_(input) {
  const valor=String(input||'').trim();
  const m=valor.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[\w-]{30,}$/.test(valor)) return valor;
  throw new Error('Pega la URL de un Google Sheets convertido, no de un XLSX sin convertir.');
}

function leerFilasCatalogo_(sh, hdr) {
  const rango=sh.getDataRange(), visibles=rango.getDisplayValues(), valores=rango.getValues();
  if (!visibles.length || hdr.some((h,i)=>String(visibles[0][i]||'').trim()!==h))
    throw new Error('Encabezados incorrectos en '+sh.getName()+'. Descarga el catálogo que genera ProfeFlow.');
  const fechaIndex=hdr.indexOf('FechaLimite');
  const zone=sh.getParent().getSpreadsheetTimeZone();
  return visibles.slice(1).filter(f=>f.some(v=>String(v).trim())).map((f,indice)=> {
    const datos=Object.fromEntries(hdr.map((h,i)=>[h,String(f[i]||'').trim()]));
    // Si Drive interpretó FechaLimite como fecha, recuperar la fecha real, no el formato local MM/DD/DD/MM.
    if(fechaIndex>=0) {
      const raw=valores[indice+1][fechaIndex];
      if(raw instanceof Date && !isNaN(raw.getTime()))
        datos.FechaLimite=Utilities.formatDate(raw,zone,'yyyy-MM-dd');
    }
    return datos;
  });
}

function guardarRespaldoCatalogo_(sh) {
  const stamp=Utilities.formatDate(new Date(), 'GMT', 'MMdd-HHmmss');
  const nombre=('Backup_'+sh.getName()+'_'+stamp).slice(0,95);
  if (!sh.getParent().getSheetByName(nombre)) sh.copyTo(sh.getParent()).setName(nombre).hideSheet();
}

function reemplazarCatalogo_(ss,nombre,hdr,filas) {
  const sh=ss.getSheetByName(nombre)||ss.insertSheet(nombre);
  sh.clearContents();
  sh.getRange(1,1,1,hdr.length).setValues([hdr]).setFontWeight('bold');
  if (filas.length) {
    sh.getRange(2,1,filas.length,hdr.length).setNumberFormat('@');
    sh.getRange(2,1,filas.length,hdr.length).setValues(filas.map(f=>hdr.map(h=>f[h])));
  }
  sh.setFrozenRows(1);
}

/**
 * La pestaña antigua RevisionEntregas conserva datos técnicos y referencias que
 * ProfeFlow necesita. Se migra sin perderlos a _RegistroCorreos (oculto), con
 * copia de seguridad oculta. La nueva RevisionEntregas es una vista simplificada.
 */
function prepararEstructuraRevision_(ss) {
  let tecnico=ss.getSheetByName(PF.registro);
  const anterior=ss.getSheetByName(PF.revision);
  if(!tecnico && anterior && anterior.getLastRow()>0) {
    const primero=String(anterior.getRange(1,1).getDisplayValue()||'').trim();
    if(primero!=='ID mensaje')
      throw new Error('RevisionEntregas no tiene el encabezado anterior esperado; no se migra automáticamente.');
    // La copia se mantiene oculta para recuperación; el registro original
    // conserva todos sus IDs y filas, únicamente cambia su nombre de pestaña.
    guardarRespaldoCatalogo_(anterior);
    const otrosViejos=ss.getSheetByName(PF.otros);
    if(otrosViejos&&otrosViejos.getLastRow()>1)guardarRespaldoCatalogo_(otrosViejos);
    anterior.setName(PF.registro);
    tecnico=anterior;
  }
  if(!tecnico && anterior && anterior.getLastRow()===0){
    anterior.setName(PF.registro);tecnico=anterior;
  }
  tecnico=asegurarHoja_(ss,PF.registro,PF.hdrRevision);
  const actual=ss.getSheetByName(PF.revision);
  if(actual && String(actual.getRange(1,1).getDisplayValue()||'').trim()!=='Fecha correo')
    throw new Error('La vista RevisionEntregas fue modificada. No se reemplazará.');
  asegurarHoja_(ss,PF.revision,PF.hdrVista);
  asegurarHoja_(ss,PF.sinAsunto,PF.hdrSinAsunto);
  asegurarHoja_(ss,PF.ignorados,PF.hdrIgnorados);
  const aprobaciones=asegurarHoja_(ss,PF.excepciones,PF.hdrExcepciones);
  if(!aprobaciones.isSheetHidden())aprobaciones.hideSheet();
  if(!tecnico.isSheetHidden())tecnico.hideSheet();
  const descartes=ss.getSheetByName(PF.ignorados);
  if(!descartes.isSheetHidden())descartes.hideSheet();
}
function exigirEstructuraRevision_(ss){
  if(!ss.getSheetByName(PF.registro) || !ss.getSheetByName(PF.revision))
    throw new Error('Ejecuta primero Control de entregas → Configurar hojas (sin borrar registros).');
}
function esInstitucional_(correo) {
  return /^[a-z0-9._%+\-]+@upotosina\.edu\.mx$/i.test(normalizarCorreo_(correo));
}
/** Sin asunto real o solo prefijos de respuesta, independientemente del contenido o adjuntos. */
function esSinAsunto_(asunto) {
  const limpio=normalizar_(limpiarAsunto_(asunto)).replace(/[()]/g,'').trim();
  return !limpio||['no subject','sin asunto','sin titulo','no asunto'].includes(limpio);
}
/** Los documentos sirven para detectar la actividad, pero no se muestran sus nombres. */
function estadoAdjunto_(valor){
  const s=normalizar_(valor);
  return !s||['no','sin adjunto','false','0'].includes(s)?'NO':'SÍ';
}
function notaAprobacion_(aprobacion) {
  return 'Excepción aprobada por docente ('+aprobacion.motivo+'); confirmar al importar';
}
function resumenVisible_(r,aprobacion){
  const notas=String(r[18]||'').split(' | ').filter(Boolean);
  if(aprobacion)notas.push(notaAprobacion_(aprobacion));
  return [r[1],r[6],r[7],r[5],r[8],r[9],r[10],r[11],r[12],r[13],r[14],
    aprobacion?'SÍ':estadoAdjunto_(r[16]),aprobacion?'REVISAR':r[17],notas.join(' | '),r[0]];
}
function resumenSinAsunto_(r){
  const notas=String(r[18]||'').split(' | ').filter(Boolean);
  if(!notas.some(x=>/sin asunto/i.test(x)))notas.push('Sin asunto: solicitar reenvío');
  return [r[1],r[6],r[7],r[5],r[8],estadoAdjunto_(r[16]),notas.join(' | '),r[0]];
}
function reemplazarVista_(ss,nombre,encabezados,filas) {
  const sh=asegurarHoja_(ss,nombre,encabezados);
  sh.clearContents();
  sh.getRange(1,1,1,encabezados.length).setValues([encabezados]).setFontWeight('bold');
  if(filas.length){
    const matriculaCol=nombre===PF.sinAsunto?3:nombre===PF.revision?3:0;
    if(matriculaCol)sh.getRange(2,matriculaCol,filas.length,1).setNumberFormat('@');
    sh.getRange(2,1,filas.length,encabezados.length).setValues(filas);
    sh.getRange(2,1,filas.length,1).setNumberFormat('yyyy-mm-dd hh:mm');
  }
  sh.setFrozenRows(1);
  // ID técnico para seleccionar filas desde el menú, sin añadir ruido visible.
  if(nombre===PF.revision||nombre===PF.sinAsunto) {
    const col=encabezados.length;
    if(!sh.isColumnHiddenByUser(col))sh.hideColumns(col);
  }
  // Las vistas son consultas generadas; los cambios se hacen en ProfeFlow.
  return sh;
}
/**
 * Reconstruye SOLO vistas legibles usando el registro técnico. Ninguna vista
 * genera nuevas entregas; las categorías son excluyentes.
 */
function actualizarVistasRevision_(ss) {
  exigirEstructuraRevision_(ss);
  const reg=ss.getSheetByName(PF.registro);
  const valores=reg.getLastRow()>1?
    reg.getRange(2,1,reg.getLastRow()-1,PF.hdrRevision.length).getValues():[];
  const vista=[],sinAsunto=[],otros=[];
  const excepciones=leerExcepciones_(ss);
  for(const r of valores){
    if(!String(r[0]||'').trim() || !esInstitucional_(r[8]))continue;
    const aprobacion=aprobacionParaRegistro_(r,excepciones);
    if(esSinAsunto_(r[9])&&!aprobacion){
      sinAsunto.push(resumenSinAsunto_(r));continue;
    }
    vista.push(resumenVisible_(r,aprobacion));
    if(String(r[2]||'').trim()==='NO')
      otros.push([r[0],r[1],r[6],r[8],r[9],estadoAdjunto_(r[16]),r[18]]);
  }
  reemplazarVista_(ss,PF.revision,PF.hdrVista,vista);
  reemplazarVista_(ss,PF.sinAsunto,PF.hdrSinAsunto,sinAsunto);
  reemplazarVista_(ss,PF.otros,PF.hdrOtros,otros);
  // Las pestañas de grupo que dejó el sistema anterior no se borran.
  // Se ocultan para evitar vistas duplicadas; el respaldo conserva todo.
  const grupos=new Set();
  const alumnos=ss.getSheetByName(PF.alumnos);
  if(alumnos&&alumnos.getLastRow()>1){
    const v=alumnos.getRange(2,7,alumnos.getLastRow()-1,1).getDisplayValues();
    v.forEach(x=>{if(x[0])grupos.add(String(x[0]).trim())});
  }
  ss.getSheets().forEach(sh=>{
    if((grupos.has(sh.getName())||/^[A-Z]{3,5}-\d[A-Z]$/i.test(sh.getName()))&&
      sh.getName()!==PF.revision&&!sh.isSheetHidden())sh.hideSheet();
  });
}
function actualizarVistasRevision(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  exigirEstructuraRevision_(ss);
  actualizarVistasRevision_(ss);
  prepararExportacionProfeFlow_(false);
  ss.toast('Revisión actualizada; solo asuntos claros se exportan a ProfeFlow.',
    'Control de entregas',6);
}

/** Historial inmutable de decisiones, una fila por acción. La última prevalece. */
function leerExcepciones_(ss) {
  const sh=ss.getSheetByName(PF.excepciones);
  const result=new Map();
  if(!sh||sh.getLastRow()<2)return result;
  sh.getRange(2,1,sh.getLastRow()-1,PF.hdrExcepciones.length).getValues()
    .forEach(r=>{
      const id=String(r[0]||'').trim();if(!id)return;
      result.set(id,{semestre:String(r[1]||'').trim(),actividadId:String(r[2]||'').trim(),
        alumnoId:String(r[3]||'').trim(),correo:normalizarCorreo_(r[4]),
        estado:String(r[5]||'').trim(),motivo:String(r[8]||'').trim()});
    });
  return result;
}
function aprobacionParaRegistro_(r,excepciones) {
  const a=excepciones.get(String(r[0]||'').trim());
  if(!a||a.estado!=='APROBADA')return null;
  // Evita reutilizar una autorización en otra materia, alumno o semestre.
  return a.semestre===String(r[19]||'').trim() &&
    a.actividadId===String(r[20]||'').trim() &&
    a.alumnoId===String(r[21]||'').trim() &&
    a.correo===normalizarCorreo_(r[8])?a:null;
}
function registrarExcepcion_(ss,r,accion,motivo) {
  const sh=asegurarHoja_(ss,PF.excepciones,PF.hdrExcepciones);
  const fila=sh.getLastRow()+1;
  const correoDocente=Session.getActiveUser().getEmail()||'(cuenta no disponible)';
  const row=[String(r[0]),String(r[19]),String(r[20]),String(r[21]),
    normalizarCorreo_(r[8]),accion,new Date(),correoDocente,motivo];
  sh.getRange(fila,1,1,4).setNumberFormat('@');
  sh.getRange(fila,1,1,PF.hdrExcepciones.length).setValues([row]);
  if(!sh.isSheetHidden())sh.hideSheet();
}
function registroSeleccionado_(ss,nombre) {
  const ui=SpreadsheetApp.getUi();
  const activa=ss.getActiveSheet(),fila=activa.getActiveRange()?.getRow();
  if(activa.getName()!==nombre||!fila||fila<2){
    ui.alert('Selecciona primero una celda de una fila en la pestaña '+nombre+'.');
    return null;
  }
  const col=nombre===PF.sinAsunto?PF.hdrSinAsunto.length:PF.hdrVista.length;
  const id=String(activa.getRange(fila,col).getDisplayValue()||'').trim();
  if(!id){ui.alert('No se encontró el identificador de este correo. Actualiza las vistas.');return null;}
  const sh=ss.getSheetByName(PF.registro);
  if(sh.getLastRow()<2)return null;
  const datos=sh.getRange(2,1,sh.getLastRow()-1,PF.hdrRevision.length).getValues();
  const registro=datos.find(r=>String(r[0]||'').trim()===id);
  if(!registro)ui.alert('No se encontró la entrega original en el registro técnico.');
  return registro||null;
}
/** Aprobación exclusivamente humana; nunca cambia leído/no leído ni califica. */
function aprobarSinAsuntoSeleccionado() { aprobarExcepcionSeleccionada_(PF.sinAsunto); }
function aprobarEnlaceDriveSeleccionado() { aprobarExcepcionSeleccionada_(PF.revision); }
function aprobarExcepcionSeleccionada_(pestana) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),ui=SpreadsheetApp.getUi();
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  if(!lock.tryLock(10000))throw new Error('Ya se está actualizando la hoja.');
  try {
    exigirEstructuraRevision_(ss);
    const r=registroSeleccionado_(ss,pestana);if(!r)return;
    if(pestana===PF.sinAsunto&&!esSinAsunto_(r[9])){ui.alert('Este correo ya tiene asunto.');return;}
    if(pestana===PF.revision&&(esSinAsunto_(r[9])||estadoAdjunto_(r[16])==='SÍ')){
      ui.alert('Esta opción es solo para correos con asunto que incluyan enlace Drive sin adjunto físico.');return;
    }
    const cat=leerCatalogos_(),ex=leerExcepciones_(ss);
    if(aprobacionParaRegistro_(r,ex)){ui.alert('Esta excepción ya está aprobada.');return;}
    if(String(r[19]||'').trim()!==cat.semestre || !esInstitucional_(r[8]) || !r[20] || !r[21]){
      ui.alert('No se puede aprobar: falta una coincidencia única de alumno, actividad o semestre. Corrige el catálogo o reanaliza el correo.');return;
    }
    const alumno=cat.alumnos.filter(a=>String(a.AlumnoID)===String(r[21])&&
      a.Grupo===r[5]&&normalizarCorreo_(a.Correo)===normalizarCorreo_(r[8]));
    const tarea=cat.tareas.filter(t=>String(t.ActividadID)===String(r[20])&&t.Grupo===r[5]);
    if(alumno.length!==1||tarea.length!==1){
      ui.alert('La coincidencia ya no es única en el catálogo actual. Actualiza o reanaliza antes de aprobar.');return;
    }
    const notas=normalizar_(r[18]);
    if(/actividades distintas|ambiguas|matricula del cuerpo no coincide|alumno\/grupo sin coincidencia unica/.test(notas)){
      ui.alert('La entrega presenta datos contradictorios. No se puede aprobar automáticamente la excepción de asunto.');return;
    }
    let enlaceDrive=false;
    if(estadoAdjunto_(r[16])==='NO'){
      let mensaje;
      try{mensaje=GmailApp.getMessageById(String(r[0]))}catch(e){/* sin acceso: no aprobar */}
      enlaceDrive=!!mensaje&&/https?:\/\/(?:drive|docs)\.google\.com\//i.test((mensaje.getPlainBody()||'')+' '+(mensaje.getBody()||''));
      if(!enlaceDrive){ui.alert('No se detectó archivo adjunto ni enlace de Google Drive. Solicita el archivo antes de aprobar.');return;}
    }
    const detalle=alumno[0].Nombre+' / '+alumno[0].Matricula+'\n'+
      tarea[0].Actividad+' / '+tarea[0].Grupo+'\n'+
      (enlaceDrive?'ATENCIÓN: El archivo está en Google Drive. Confirma que lo abriste y pudiste descargarlo.':'Archivo adjunto al correo.')+'\n\n'+
      'Se autorizará SOLAMENTE la excepción al asunto o al adjunto físico. La entrega se exportará como REVISAR y ProfeFlow tendrá que validarla antes de calificar.\n\n¿Aprobar?';
    if(ui.alert('Autorizar excepción sin asunto',detalle,ui.ButtonSet.YES_NO)!==ui.Button.YES)return;
    registrarExcepcion_(ss,r,'APROBADA',enlaceDrive?'Enlace Drive comprobado por docente':
      'Actividad identificada por su archivo o cuerpo; falta de asunto autorizada');
    actualizarVistasRevision_(ss);
    prepararExportacionProfeFlow_(false);
    ui.alert('Excepción registrada. La entrega está en RevisionEntregas y se incluyó en ProfeFlow_Importar como REVISAR. No se modificó Gmail.');
  } finally {lock.releaseLock()}
}
function revocarExcepcionSeleccionada() {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),ui=SpreadsheetApp.getUi();
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  if(!lock.tryLock(10000))throw new Error('Ya se está actualizando la hoja.');
  try {
    exigirEstructuraRevision_(ss);
    const r=registroSeleccionado_(ss,PF.revision);if(!r)return;
    const ex=leerExcepciones_(ss);
    if(!aprobacionParaRegistro_(r,ex)){ui.alert('La fila no tiene una excepción de asunto aprobada.');return;}
    if(ui.alert('Revocar excepción','Se restablecerá la clasificación original (si no tiene asunto, regresará a SinAsunto). Una revocación no elimina importaciones anteriores en ProfeFlow. ¿Continuar?',ui.ButtonSet.YES_NO)!==ui.Button.YES)return;
    registrarExcepcion_(ss,r,'REVOCADA','Revocada manualmente');
    actualizarVistasRevision_(ss);
    prepararExportacionProfeFlow_(false);
    ui.alert('Excepción revocada. Revisa el siguiente CSV antes de importarlo.');
  } finally {lock.releaseLock()}
}

function leerCatalogos_() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const a=ss.getSheetByName(PF.alumnos),t=ss.getSheetByName(PF.tareas);
  if(!a||!t)throw new Error('Importa primero el catálogo de ProfeFlow.');
  const alumnos=leerFilasCatalogo_(a,PF.hdrAlumnos);
  const tareas=leerFilasCatalogo_(t,PF.hdrTareas);
  if(!alumnos.length)throw new Error('No hay alumnos. Importa el catálogo de ProfeFlow.');
  const semestre=alumnos[0].SemestreID;
  if(!semestre || alumnos.some(x=>x.SemestreID!==semestre) || tareas.some(x=>x.SemestreID!==semestre))
    throw new Error('Hay más de un semestre en el catálogo.');
  const porCorreo=new Map();
  alumnos.forEach(s=>{
    const key=normalizarCorreo_(s.Correo);
    if(key){
      if(!porCorreo.has(key))porCorreo.set(key,[]);
      porCorreo.get(key).push(s);
    }
  });
  return {alumnos,tareas,semestre,porCorreo};
}

function configuracion_() {
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PF.config);
  if(!sh)throw new Error('Ejecuta Configurar hojas.');
  const pares=sh.getDataRange().getDisplayValues().slice(1);
  const obj=Object.fromEntries(pares.filter(f=>f[0]).map(f=>[String(f[0]).trim(),String(f[1]).trim()]));
  const fecha=normalizarFecha_(obj.FechaDesde);
  if(!fecha)throw new Error('Configura FechaDesde como AAAA-MM-DD en la pestaña Configuracion.');
  return {fechaDesde:fecha,soloAdjuntos:normalizar_(obj.SoloConAdjuntos)==='si',
    etiquetar:normalizar_(obj.EtiquetarGmail)==='si'};
}

function normalizarFecha_(dato) {
  const texto=String(dato||'').trim();
  let m=texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m)return validarDiaISO_(m[1]+'-'+m[2]+'-'+m[3]);
  m=texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m?validarDiaISO_(m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')):'';
}
function validarDiaISO_(dia){
  const x=new Date(dia+'T12:00:00Z');
  return !isNaN(x.getTime())&&x.toISOString().slice(0,10)===dia?dia:'';
}
function normalizar_(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ')}
function normalizarCorreo_(x){return String(x||'').trim().toLowerCase()}
function idSimple_(x){return String(x||'').replace(/^0+(?=\d)/,'').trim()}
function diaLocal_(fecha,zona){return Utilities.formatDate(fecha,zona,'yyyy-MM-dd')}
function diferenciaDias_(fecha,limite,zona){
  const a=diaLocal_(fecha,zona),b=normalizarFecha_(limite);
  if(!b)return null;
  return Math.max(0,(Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000);
}
function porcentaje_(dias){return dias==null?null:dias<=2?100:dias<=6?100-(dias-2)*10:0}
function extraerCorreo_(from){const x=String(from||'').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);return x?x[0].toLowerCase():''}
function limpiarAsunto_(x){return String(x||'').replace(/^(?:(?:re|rv|fw|fwd)\s*:\s*)+/ig,'').trim()}
function extraerCampos_(cuerpo){
  const out={};
  String(cuerpo||'').split(/\r?\n/).forEach(line=>{
    const pos=line.indexOf(':');if(pos<0)return;
    const key=normalizar_(line.slice(0,pos)).replace(/\s*\/\s*/g,'/');
    const value=line.slice(pos+1).trim();if(!value)return;
    if(['nombre','id','id alumno','matricula','carrera','grado y grupo','grado/grupo',
      'grupo','carrera/grado','carrera y grado','materia','modalidad','tarea','actividad','practica',
      'nombre de actividad','nombre de tarea','asunto','motivo de retardo',
      'motivo','razon del retraso','razon de retardo'].includes(key))out[key]=value;
  });
  return {nombre:out.nombre||'',matricula:out['id alumno']||out.matricula||out.id||'',
    grupo:out['grado y grupo']||out['grado/grupo']||out.grupo||out['carrera/grado']||out['carrera y grado']||'',
    motivo:out['motivo de retardo']||out.motivo||out['razon del retraso']||out['razon de retardo']||'',
    modalidad:out.modalidad||'',materia:out.materia||'',
    textoActividad:[out.tarea,out.actividad,out.practica,out['nombre de actividad'],out['nombre de tarea'],out.asunto].filter(Boolean)};
}
function formato_(f){
  // Un nombre como «Práctica 10» no identifica al alumno: frecuente error de formato.
  const nombre=normalizar_(f.nombre).replace(/[._–—-]+/g,' ');
  const pareceActividad=/^(?:practica|actividad|tarea|ejercicio|p\s*\d+)\b/.test(nombre);
  return f.nombre&&!pareceActividad&&f.matricula&&f.grupo&&f.motivo?'COMPLETO':'INCOMPLETO';
}
function aliasActividad_(x){
  const norm=normalizar_(x).replace(/[_–—-]+/g,' ').replace(/\s+/g,' ').trim();
  const m=norm.match(/\b(practica|actividad|tarea|ejercicio)\s*0*(\d+)\b/);
  if(m)return (m[1]==='practica'?'p':m[1]==='tarea'?'t':m[1]==='actividad'?'a':'e')+Number(m[2]);
  const c=norm.match(/^(p|t|a|e)\s*0*(\d+)\b/);
  if(c)return c[1]+Number(c[2]);
  return norm;
}
function reconocerGrupo_(cuerpo,filas) {
  const txt=normalizar_(cuerpo).toUpperCase(),grupos=[...new Set(filas.map(x=>x.Grupo))];
  if(!txt)return '';
  const alias=x=>x.replace(/\b(?:IDVA|IADV)-1A\b/g,'IADV-1A');const canonico=grupos.filter(g=>alias(g)===alias(txt));if(canonico.length===1)return canonico[0];
  const exactos=grupos.filter(g=>new RegExp('(?:^|[^A-Z0-9])'+g.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|[^A-Z0-9])').test(txt));
  if(exactos.length===1)return exactos[0];
  if(exactos.length>1)return '';
  const porSufijo=grupos.filter(g=>{
    const suf=g.split('-').pop();return new RegExp('(?:^|[^A-Z0-9])'+suf+'(?:$|[^A-Z0-9])').test(txt);
  });
  return porSufijo.length===1?porSufijo[0]:'';
}
/** Normaliza los títulos de tareas conservando los números como tokens completos. */
function tituloActividad_(texto) {
  return normalizar_(texto).replace(/\.[a-z0-9]{2,6}$/,'')
    .replace(/[_–—.\\/:()\[\],;#-]+/g,' ').replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ').trim();
}
function textoSinCodigo_(texto) {
  return tituloActividad_(texto).replace(/^(?:practica|actividad|tarea|ejercicio)\s*0*\d+\b\s*/,'')
    .replace(/^(?:p|t|a|e)\s*0*\d+\b\s*/,'').replace(/^(?:de|del|la|el)\s+/,'').trim();
}
function codigoActividad_(texto) {
  const t=tituloActividad_(texto);
  const m=t.match(/\b(practica|actividad|tarea|ejercicio)\s*0*(\d+)\b/) ||
    t.match(/\b(p|t|a|e)\s*0*(\d+)\b/);
  if(!m)return '';
  const tipo={practica:'p',actividad:'a',tarea:'t',ejercicio:'e'}[m[1]]||m[1];
  return tipo+Number(m[2]);
}
function candidatosActividadTexto_(texto,elegibles) {
  const limpio=tituloActividad_(texto);
  if(!limpio)return [];
  const codigo=codigoActividad_(texto);
  const sinCodigo=textoSinCodigo_(texto);
  // Nombre exacto o subtítulo exacto («Formas normales»), solo si es suficientemente específico.
  const porTitulo=elegibles.filter(t=>{
    const full=tituloActividad_(t.Actividad);
    const tail=textoSinCodigo_(t.Actividad);
    return limpio===full || sinCodigo.length>=8 && sinCodigo===tail ||
      limpio.length>=8 && limpio===tail || tituloActividad_(t.Codigo)===limpio;
  });
  if(porTitulo.length)return porTitulo;
  if(!codigo)return [];
  let conCodigo=elegibles.filter(t=>codigoActividad_(t.Codigo)===codigo||codigoActividad_(t.Actividad)===codigo);
  // Con varios grupos con P10, el descriptor puede desambiguar, pero nunca el número aislado.
  if(conCodigo.length>1 && sinCodigo.length>=8){
    const conTitulo=conCodigo.filter(t=>{
      const tail=textoSinCodigo_(t.Actividad);
      return sinCodigo===tail || sinCodigo.includes(tail) || tail.includes(sinCodigo);
    });
    if(conTitulo.length)conCodigo=conTitulo;
  }
  return conCodigo;
}
function fuentesActividad_(asunto,cuerpo,nombresAdjuntos,campos) {
  const fuentes=[];
  const add=(origen,valor)=>{
    const texto=String(valor||'').trim();
    if(texto && texto.length<=500 && !fuentes.some(f=>f.origen===origen&&f.texto===texto))
      fuentes.push({origen,texto});
  };
  const asuntoLimpio=limpiarAsunto_(asunto);
  if(!/^(?:\(no subject\)|sin asunto)$/i.test(asuntoLimpio))add('asunto',asuntoLimpio);
  (campos.textoActividad||[]).forEach(t=>add('campo del mensaje',t));
  // Algunos alumnos colocan «Práctica 10» en «Nombre:», en lugar de su nombre.
  if(codigoActividad_(campos.nombre)||/^\s*(?:practica|actividad|tarea|ejercicio)\b/i.test(campos.nombre))
    add('campo Nombre (revisar)',campos.nombre);
  (nombresAdjuntos||[]).forEach(nombre=>{
    const limpio=String(nombre||'').replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ');
    add('nombre del archivo',limpio);
  });
  // Examinar líneas individuales, nunca el texto completo como un título.
  String(cuerpo||'').slice(0,12000).split(/\r?\n/).slice(0,100).forEach(linea=>{
    const texto=linea.trim();
    if(!texto || texto.length>220) return;
    // Una línea aislada como «Formas normales» también puede ser el título.
    // La coincidencia posterior exige igualdad con una actividad del catálogo.
    if(/^(?:nombre|id|matricula|correo|carrera|grupo|grado|materia|modalidad|motivo)\s*:/i.test(normalizar_(texto)))return;
    if(codigoActividad_(texto) || (texto.length>=8 && texto.length<=100))
      add('cuerpo del mensaje',texto);
  });
  return fuentes;
}
/**
 * El asunto es la FUENTE AUTORIZADA para reconocer una actividad al exportar.
 * «Práctica 12 terminada» y «Formas normales» son válidos SI corresponden a
 * una única actividad del grupo en el catálogo. "Entrega de tarea" no lo es.
 * Las numeraciones de archivos P17/P18 de Programación NO cambian la práctica del asunto.
 */
function asuntoConMultiplesActividades_(asunto) {
  const original=normalizar_(limpiarAsunto_(asunto));
  const s=tituloActividad_(limpiarAsunto_(asunto));
  // «Prácticas 10 y 11», «Prácticas 10/11», «P10/P11», «T2 + T3», etc.
  if(/\b(?:practicas?|tareas?|actividades?)\s*0*\d+\s*(?:y|e|,|\/|\+|-)\s*0*\d+\b/.test(original))return true;
  const claves=[...s.matchAll(/\b(practica|tarea|actividad|p|t|a)\s*0*(\d+)\b/g)]
    .map(m=>({tipo:({practica:'p',tarea:'t',actividad:'a'})[m[1]]||m[1],numero:Number(m[2])}));
  return new Set(claves.map(c=>c.tipo+c.numero)).size>1;
}
function identificarPorAsunto_(asunto,estudiantes,tareas,grupoExplicito='') {
  if(esSinAsunto_(asunto))return {tarea:null,ambigua:false,origen:'sin asunto'};
  if(asuntoConMultiplesActividades_(asunto))
    return {tarea:null,ambigua:true,origen:'varias actividades en el asunto'};
  const grupos=new Set(estudiantes.map(s=>s.Grupo));
  const elegibles=tareas.filter(t=>grupos.has(t.Grupo)&&(!grupoExplicito||t.Grupo===grupoExplicito));
  const candidatas=candidatosActividadTexto_(limpiarAsunto_(asunto),elegibles);
  return {tarea:candidatas.length===1?candidatas[0]:null,
    ambigua:candidatas.length>1,origen:candidatas.length===1?'asunto':'asunto insuficiente'};
}
/**
 * Para REVISIÓN se permite localizar una posible actividad en cuerpo/archivos.
 * Para la EXPORTACIÓN solo cuenta identificarPorAsunto_; nunca estas pistas.
 */
function reconocerActividad_(asunto,estudiantes,tareas,grupoExplicito,cuerpo='',nombresAdjuntos=[],campos={}) {
  const porAsunto=identificarPorAsunto_(asunto,estudiantes,tareas,grupoExplicito);
  if(porAsunto.tarea||porAsunto.ambigua)return porAsunto;
  const grupos=new Set(estudiantes.map(s=>s.Grupo));
  const elegibles=tareas.filter(t=>grupos.has(t.Grupo)&&(!grupoExplicito||t.Grupo===grupoExplicito));
  const fuentes=fuentesActividad_(asunto,cuerpo,nombresAdjuntos,campos)
    .filter(f=>f.origen!=='asunto');
  let elegido=null,origen='',ambiguo=false;
  for(const fuente of fuentes){
    const candidatos=candidatosActividadTexto_(fuente.texto,elegibles);
    if(!candidatos.length)continue;
    if(candidatos.length>1){ambiguo=true;continue;}
    if(!elegido){elegido=candidatos[0];origen=fuente.origen;}
    else if(elegido.ActividadID!==candidatos[0].ActividadID)ambiguo=true;
  }
  return {tarea:ambiguo?null:elegido,ambigua:ambiguo,origen:ambiguo?'conflicto':origen};
}
function cuentaAdjuntos_(mensaje){
  return mensaje.getAttachments({includeInlineImages:false,includeAttachments:true})
    .map(a=>a.getName()).filter(Boolean);
}
/** Genera el registro central, igual para correos nuevos y su reanálisis. */
function analizarMensaje_(m,catalogo,config,ss) {
  const id=m.getId(),fecha=m.getDate(),sender=extraerCorreo_(m.getFrom());
  const asunto=m.getSubject()||'',cuerpo=m.getPlainBody()||'';
  const alumnos=catalogo.porCorreo.get(sender)||[];
  const campos=extraerCampos_(cuerpo),adjuntos=cuentaAdjuntos_(m);
  const grupoIndicado=reconocerGrupo_(campos.grupo,alumnos);
  const asuntoIdentificado=identificarPorAsunto_(asunto,alumnos,catalogo.tareas,grupoIndicado);
  const identificacion=reconocerActividad_(asunto,alumnos,catalogo.tareas,grupoIndicado,cuerpo,adjuntos,campos);
  const tarea=identificacion.tarea;
  const candidatos=tarea?alumnos.filter(s=>s.Grupo===tarea.Grupo):
    grupoIndicado?alumnos.filter(s=>s.Grupo===grupoIndicado):alumnos;
  const alumno=candidatos.length===1?candidatos[0]:null;
  const grupo=tarea?.Grupo||grupoIndicado||(alumnos.length===1?alumnos[0].Grupo:'');
  const mismatch=alumno&&campos.matricula&&idSimple_(campos.matricula)!==idSimple_(alumno.Matricula);
  const nombreCampo=normalizar_(campos.nombre).replace(/[._–—-]+/g,' ');
  const nombreEsActividad=/^(?:practica|actividad|tarea|ejercicio|p\s*\d+)\b/.test(nombreCampo);
  const notas=[];
  if(!alumnos.length)notas.push('Correo no registrado en el catálogo actual');
  if(!grupo)notas.push('Grupo ambiguo o no indicado');
  if(identificacion.ambigua)notas.push('Actividades distintas o ambiguas en asunto, cuerpo o adjuntos');
  if(!tarea)notas.push('Actividad no identificada en este catálogo');
  else if(identificacion.origen!=='asunto')notas.push('Actividad reconocida por '+identificacion.origen+'; verificar');
  if(nombreEsActividad)notas.push('El campo Nombre contiene una actividad, no el nombre del alumno');
  if(!alumno)notas.push('Alumno/grupo sin coincidencia única');
  if(mismatch)notas.push('La matrícula del cuerpo no coincide con el catálogo');
  if(formato_(campos)==='INCOMPLETO')notas.push('Datos del formato de entrega incompletos');
  if(!adjuntos.length)notas.push('Sin archivo adjunto');
  if(esSinAsunto_(asunto))notas.push('Sin asunto: solicitar nuevo correo con asunto correcto');
  else if(!asuntoIdentificado.tarea)
    notas.push(asuntoIdentificado.ambigua?'Asunto ambiguo o con varias actividades; no exportar':
      'Asunto no identifica una actividad única del catálogo; no exportar');
  const dias=tarea?diferenciaDias_(fecha,tarea.FechaLimite,ss.getSpreadsheetTimeZone()):null;
  if(tarea&&dias===null)notas.push('Actividad sin fecha límite válida');
  if(dias!==null&&dias>=7)notas.push('Entrega fuera del plazo (7 días o más)');
  // Solo informativo; ProfeFlow siempre requiere validación y calificación manuales.
  const estado=esSinAsunto_(asunto)?'SIN ASUNTO':
    !asuntoIdentificado.tarea?'ASUNTO POR CORREGIR':
    !alumnos.length||!adjuntos.length||dias!==null&&dias>=7?'NO VÁLIDA':
    notas.length?'REVISAR':'VÁLIDA';
  return [id,fecha,alumnos.length?'SÍ':'NO',[...new Set(alumnos.map(a=>a.Grupo))].join(', '),
    campos.grupo||'',grupo,alumno?.Nombre||(!nombreEsActividad?campos.nombre:''),
    alumno?.Matricula||campos.matricula||'',sender,asunto,tarea?.Actividad||'',
    tarea?.Materia||alumno?.Materia||'',tarea?.FechaLimite||'',
    dias===null?'':dias,porcentaje_(dias)===null?'':porcentaje_(dias),
    formato_(campos),adjuntos.length?'SÍ':'NO',estado,notas.join(' | '),
    catalogo.semestre,tarea?.ActividadID||'',alumno?.AlumnoID||''];
}

/** Solo ejecución manual. No marca mensajes como leídos ni instala triggers. */
function procesarCorreosPorGrupos() {
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  if(!lock.tryLock(10000))throw new Error('Ya hay una importación en curso.');
  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const catalogo=leerCatalogos_(),config=configuracion_();
    exigirEstructuraRevision_(ss);
    const rev=asegurarHoja_(ss,PF.registro,PF.hdrRevision);
    const ignorados=asegurarHoja_(ss,PF.ignorados,PF.hdrIgnorados);
    const idsIgnorados=new Set(ignorados.getLastRow()>1?ignorados.getRange(2,1,ignorados.getLastRow()-1,1).getDisplayValues().map(x=>x[0]).filter(Boolean):[]);
    const ids=new Set(rev.getLastRow()>1?rev.getRange(2,1,rev.getLastRow()-1,1).getDisplayValues().map(x=>x[0]).filter(Boolean):[]);
    const consulta=PF.consultaBase+' after:'+config.fechaDesde.replace(/-/g,'/')+(config.soloAdjuntos?' has:attachment':'');
    const props=PropertiesService.getDocumentProperties();
    let offset=props.getProperty(PF.nombrePropQuery)===consulta+'|'+catalogo.semestre?
      Number(props.getProperty(PF.nombrePropOffset)||'0'):0;
    let examinados=0,ingresados=0;
    const registros=[], porEtiquetar=[], ignorarNuevos=[];
    for(let pagina=0;pagina<PF.paginasPorEjecucion;pagina++){
      const hilos=GmailApp.search(consulta,offset,PF.tamanoPagina);
      if(!hilos.length){offset=0;break;}
      const lotes=GmailApp.getMessagesForThreads(hilos);
      for(const mensajes of lotes){
        for(const m of mensajes){
          // GmailApp.search devuelve HILOS: pueden contener mensajes ya leídos.
          // Revisar cada mensaje evita importar correos antiguos del mismo hilo.
          if(!mensajeEntrantePendiente_(m)||asuntoAjenoEntrega_(m.getSubject()||''))continue;
          examinados++;
          const id=m.getId();if(ids.has(id)||idsIgnorados.has(id))continue;
          if(diaLocal_(m.getDate(),ss.getSpreadsheetTimeZone())<config.fechaDesde)continue;
          const sender=extraerCorreo_(m.getFrom()),subject=m.getSubject()||'';
          // Solo el correo institucional se considera para entregas.
          // Guardar únicamente el ID de los descartados evita revisarlos de nuevo.
          if(!esInstitucional_(sender)){
            // No recopilar información de correos particulares ajenos a clases.
            if(/\b(practica|actividad|tarea|ejercicio|entrega)\b/i.test(normalizar_(subject))){
              ignorarNuevos.push([id,m.getDate(),'Remitente no institucional']);
              idsIgnorados.add(id);
            }
            continue;
          }
          const alumnos=catalogo.porCorreo.get(sender)||[];
          // Otros mensajes institucionales sin referencia a prácticas no son entregas.
          // Sin asunto = revisión manual. Solo una aprobación docente explícita permite exportar.
          if(!alumnos.length && !esSinAsunto_(subject) &&
            !/\b(practica|actividad|tarea|ejercicio)\s*\d+\b/i.test(normalizar_(subject)))continue;
          const registro=analizarMensaje_(m,catalogo,config,ss);
          const grupo=registro[5];
          registros.push(registro);
          ids.add(id);ingresados++;
          if(config.etiquetar)porEtiquetar.push({mensaje:m,etiqueta:esSinAsunto_(subject)?'SinAsunto':grupo||'Revisar'});
        }
      }
      offset+=hilos.length;
      if(hilos.length<PF.tamanoPagina){offset=0;break;}
    }
    if(ignorarNuevos.length){
      const p=ignorados.getLastRow()+1;
      ignorados.getRange(p,1,ignorarNuevos.length,1).setNumberFormat('@');
      ignorados.getRange(p,1,ignorarNuevos.length,3).setValues(ignorarNuevos);
    }
    if(registros.length) {
      const destino=rev.getLastRow()+1;
      rev.getRange(destino,1,registros.length,1).setNumberFormat('@');
      rev.getRange(destino,8,registros.length,1).setNumberFormat('@');
      rev.getRange(destino,1,registros.length,PF.hdrRevision.length).setValues(registros);
      rev.getRange(2,2,Math.max(1,rev.getLastRow()-1),1).setNumberFormat('yyyy-mm-dd hh:mm');
    }
    const hayMas=offset>0 && GmailApp.search(consulta,offset,1).length>0;
    if(hayMas){props.setProperty(PF.nombrePropOffset,String(offset));props.setProperty(PF.nombrePropQuery,consulta+'|'+catalogo.semestre);}
    else {props.deleteProperty(PF.nombrePropOffset);props.deleteProperty(PF.nombrePropQuery);}
    actualizarVistasRevision_(ss);
    if(config.etiquetar)etiquetarMensajes_(porEtiquetar);
    prepararExportacionProfeFlow_(false);
    SpreadsheetApp.getUi().alert('Mensajes examinados: '+examinados+'\nEntregas nuevas: '+ingresados+
      '\nCorreos personales descartados: '+ignorarNuevos.length+
      '\n'+(hayMas?'Quedan más hilos. Vuelve a pulsar «Procesar correos ahora».':'Se completó la búsqueda configurada.')+
      '\n\nLa hoja ProfeFlow_Importar está actualizada.');
  } finally {lock.releaseLock();}
}

/**
 * Revisa únicamente filas del semestre activo que no tienen ActividadID.
 * Nunca añade filas ni altera mensajes ya identificados; confirma antes de escribir.
 */
function reanalizarEntregasRegistradas() {
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  if(!lock.tryLock(10000))throw new Error('Ya hay un proceso en curso.');
  try {
    const ui=SpreadsheetApp.getUi(),ss=SpreadsheetApp.getActiveSpreadsheet();
    const cat=leerCatalogos_(),conf=configuracion_();
    const sh=asegurarHoja_(ss,PF.registro,PF.hdrRevision);
    if(sh.getLastRow()<2){ui.alert('No hay entregas registradas.');return;}
    const datos=sh.getRange(2,1,sh.getLastRow()-1,PF.hdrRevision.length).getValues();
    const cambios=[];let noEncontrados=0,noCoinciden=0;
    for(let i=0;i<datos.length;i++){
      const r=datos[i],semestre=String(r[19]||'').trim();
      if(semestre!==cat.semestre || String(r[20]||'').trim())continue;
      const id=String(r[0]||'').trim();if(!id)continue;
      let msg;
      try{msg=GmailApp.getMessageById(id)}catch(e){noEncontrados++;continue}
      if(!msg){noEncontrados++;continue}
      const nueva=analizarMensaje_(msg,cat,conf,ss);
      if(!nueva[20] || !nueva[21] || (r[7]&&idSimple_(r[7])!==idSimple_(nueva[7]))){noCoinciden++;continue}
      // Se mantienen ID, fecha, correo y cualquier anotación ajena al reconocimiento automático.
      const reparada=r.slice();
      for(const idx of [4,5,6,7,10,11,12,13,14,15,16,17,20,21])reparada[idx]=nueva[idx];
      const viejaNota=String(r[18]||'');
      const previas=viejaNota.split(' | ').map(s=>s.trim()).filter(s=>s &&
        !/^(actividad no identificada|varias actividades coinciden|actividades distintas o ambiguas|grupo ambiguo o no indicado|alumno\/grupo sin coincidencia unica)/i.test(normalizar_(s)));
      reparada[18]=[...new Set([...previas,...String(nueva[18]||'').split(' | ').filter(Boolean),
        'Reanalizada: coincidencia propuesta para validar en ProfeFlow'])].join(' | ');
      cambios.push({fila:i+2,antes:r,despues:reparada});
    }
    if(!cambios.length){ui.alert('No se encontraron nuevas coincidencias únicas.\nMensajes inexistentes en Gmail: '+noEncontrados+'\nSin correspondencia segura: '+noCoinciden);return;}
    if(ui.alert('Reanalizar entregas registradas',
      'Se encontraron '+cambios.length+' actividades identificables sin ambigüedad entre los correos ya guardados.\n'+
      'No se crearán filas nuevas ni se modificarán calificaciones.\n'+
      'Se conservarán las observaciones anteriores y quedarán pendientes de validar en ProfeFlow.\n\n¿Actualizar?',
      ui.ButtonSet.YES_NO)!==ui.Button.YES)return;
    for(const cambio of cambios){
      sh.getRange(cambio.fila,1,1,PF.hdrRevision.length).setValues([cambio.despues]);
    }
    actualizarVistasRevision_(ss);
    prepararExportacionProfeFlow_(false);
    ui.alert('Reanalizadas: '+cambios.length+' entregas.\nSin coincidencia segura: '+noCoinciden+
      '.\nRevisa RevisionEntregas y ProfeFlow_Importar antes de importar a ProfeFlow.');
  } finally {lock.releaseLock()}
}
/**
 * Obtiene los IDs realmente sin leer; Gmail.search devuelve hilos que pueden
 * contener también mensajes ya leídos. Nunca cambia el estado de Gmail.
 * Fallar explícitamente ante límites es preferible a exportar registros antiguos.
 */
let pfOwnEmailsCache;
function mensajeEntrantePendiente_(m){
  const own=pfOwnEmailsCache??= [Session.getActiveUser().getEmail(),...GmailApp.getAliases()].map(normalizarCorreo_);
  return m.isUnread()&&m.isInInbox()&&!m.isDraft()&&!own.includes(extraerCorreo_(m.getFrom()));
}
function asuntoAjenoEntrega_(subject){return /^(?:(?:re|rv|fw|fwd)\s*:\s*)*(?:consulta|duda|justificante|justificacion|solicitud de permiso|aviso de ausencia)\b/.test(normalizar_(subject))}
function evidenciaEnlaces_(m){return [...new Set(((m.getPlainBody()||'')+' '+(m.getBody()||'')).match(/https?:\/\/(?:www\.)?(?:canva\.com|drive\.google\.com|docs\.google\.com)\/[^\s<>"']+/gi)||[])].join(' ')}
function idsActualesSinLeer_() {
  const result=new Set(),tam=100,maxHilos=5000;
  for(let offset=0;offset<maxHilos;offset+=tam){
    const hilos=GmailApp.search(PF.consultaBase,offset,tam);
    if(!hilos.length)return result;
    GmailApp.getMessagesForThreads(hilos).forEach(mensajes=>mensajes.forEach(m=>{
      if(mensajeEntrantePendiente_(m))result.add(m.getId());
    }));
    if(hilos.length<tam)return result;
  }
  throw new Error('Más de 5000 conversaciones sin leer. Ajusta FechaDesde o revisa en Gmail antes de exportar.');
}
/**
 * Exporta solo mensajes SIN LEER del semestre actual y con una actividad ÚNICA
 * reconocida desde el ASUNTO. Cuerpo/archivos son pistas solo para revisión.
 * Excepción: aprobación EXPRESA de docente para correo sin asunto ya identificado.
 */
function prepararExportacionProfeFlow() {prepararExportacionProfeFlow_(true)}
function prepararExportacionProfeFlow_(avisar) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),catalogo=leerCatalogos_();
  const rev=asegurarHoja_(ss,PF.registro,PF.hdrRevision);
  const salida=asegurarHoja_(ss,PF.exportacion,PF.hdrExportacion);
  const values=rev.getLastRow()>1?rev.getRange(2,1,rev.getLastRow()-1,PF.hdrRevision.length).getValues():[];
  const unico=new Map(),excepciones=leerExcepciones_(ss);
  const idsSinLeer=idsActualesSinLeer_();
  let omitidosAsunto=0,omitidosIdentidad=0,autorizados=0,omitidosLeidos=0;
  for(const r of values){
    const id=String(r[0]||'').trim();
    if(!id||String(r[19]||'').trim()!==catalogo.semestre||!esInstitucional_(r[8]))continue;
    if(!idsSinLeer.has(id)){omitidosLeidos++;continue;}
    const actual=GmailApp.getMessageById(id);if(!actual||!mensajeEntrantePendiente_(actual)||asuntoAjenoEntrega_(actual.getSubject()||'')){omitidosAsunto++;continue;}const asuntoOriginal=actual.getSubject()||'',enlaces=evidenciaEnlaces_(actual);if(esSinAsunto_(asuntoOriginal)){omitidosAsunto++;continue;}const aprobacion=aprobacionParaRegistro_(r,excepciones);
    const alumnos=catalogo.porCorreo.get(normalizarCorreo_(r[8]))||[];
    const grupoIndicado=reconocerGrupo_(r[4],alumnos);
    const porAsunto=identificarPorAsunto_(asuntoOriginal,alumnos,catalogo.tareas,grupoIndicado);
    if(!porAsunto.tarea&&!/\b(?:practica|actividad|tarea|proyecto|entrega|envio)\b/.test(normalizar_(asuntoOriginal))){omitidosAsunto++;continue;}
    // La coincidencia debe ser única también para el alumno. No se inventa grupo.
    const tarea=aprobacion?catalogo.tareas.find(t=>t.ActividadID===String(r[20])):porAsunto.tarea;
    const candidatos=alumnos.filter(a=>tarea&&a.Grupo===tarea.Grupo&&
      (!r[7]||idSimple_(r[7])===idSimple_(a.Matricula)));
    const alumno=candidatos.length===1?candidatos[0]:null;
    if(aprobacion&&(!alumno||alumno.AlumnoID!==String(r[21])||tarea?.ActividadID!==String(r[20]))){
      omitidosIdentidad++;continue;
    }
    const fecha=actual.getDate().toISOString();
    const adj=aprobacion?'SÍ':estadoAdjunto_(r[16]);
    const estado=aprobacion?'REVISAR':
      String(r[17]||'').trim()==='ASUNTO POR CORREGIR'?'REVISAR':
      String(r[17]||'REVISAR').trim();
    let obs=String(r[18]||'').trim();
    if(porAsunto.tarea && !aprobacion){
      // Los registros antiguos pueden traer advertencias de detección por archivo.
      // Se corrige la conclusión para el CSV sin alterar el registro técnico.
      obs=obs.split(' | ').filter(n=>!
        /^(actividad no identificada|actividad reconocida por|asunto no identifica|asunto ambiguo)/i.test(normalizar_(n))).join(' | ');
    }
    if(aprobacion){obs=[obs,notaAprobacion_(aprobacion)].filter(Boolean).join(' | ');autorizados++;}
    // Google Sheets quotes CSV cells; preserve original subjects and Moodle titles.
    const seguro=x=>String(x==null?'':x);
    const pendiente=!tarea||!alumno||porAsunto.ambigua||enlaces||estadoAdjunto_(r[16])!=='SÍ'||estado==='NO VÁLIDA';
    const motivo=porAsunto.ambigua?'Varias actividades: requiere aclaración':!tarea?'Actividad pendiente de identificar':!alumno?'Alumno/grupo pendiente de confirmar':enlaces?'Enlace como evidencia potencial; confirmar acceso':'Entrega identificada; validación docente pendiente';
    unico.set(id,[id,fecha,normalizarCorreo_(extraerCorreo_(actual.getFrom())),alumno?.Matricula||String(r[7]||''),tarea?.Grupo||grupoIndicado||String(r[5]||''),
      tarea?.Actividad||'',adj,pendiente?'REVISAR':estado||'REVISAR',obs||'Sin observaciones',asuntoOriginal,'SÍ','Entrante',enlaces,actual.getThread().getId(),motivo,new Date().toISOString()].map(seguro));
  }
  // No destruir la tabla vigente hasta disponer de todos los datos en memoria.
  salida.clearContents();
  salida.getRange(1,1,1,PF.hdrExportacion.length).setValues([PF.hdrExportacion]).setFontWeight('bold');
  const filas=[...unico.values()];
  if(filas.length){
    salida.getRange(2,1,filas.length,PF.hdrExportacion.length).setNumberFormat('@');
    salida.getRange(2,1,filas.length,PF.hdrExportacion.length).setValues(filas);
  }
  salida.setFrozenRows(1);
  if(avisar)SpreadsheetApp.getUi().alert('Listo: '+filas.length+' mensajes exportables.\n'+
    'Excluidos porque ya están leídos: '+omitidosLeidos+'.\n'+
    'Excluidos por asunto ausente/ambiguo/no identificable: '+omitidosAsunto+'.\n'+
    'Excluidos por alumno o grupo sin coincidencia única: '+omitidosIdentidad+'.\n'+
    'Excepciones docentes expresamente autorizadas: '+autorizados+'.\n\n'+
    'Abre ProfeFlow_Importar y descarga SOLO esa hoja como CSV.');
}
function abrirHojaExportacion(){
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(PF.exportacion);
  if(!sh)throw new Error('Ejecuta Configurar hojas.');
  ss.setActiveSheet(sh);
}

/** Elimina solo los activadores automáticos antiguos de procesamiento. */
function eliminarDisparadoresAntiguos() {
  const ui=SpreadsheetApp.getUi();
  if(ui.alert('Eliminar activadores de revisión automática',
    'Se eliminarán únicamente los activadores cuyo manejador sea procesarCorreosPorGrupos. No elimina correos, registros ni otros activadores.',ui.ButtonSet.YES_NO)!==ui.Button.YES)return;
  let borrados=0;
  ScriptApp.getProjectTriggers().forEach(t=>{
    if(t.getHandlerFunction()==='procesarCorreosPorGrupos'){
      ScriptApp.deleteTrigger(t);borrados++;
    }
  });
  ui.alert('Activadores eliminados: '+borrados+'. Ahora el procesamiento se realiza solo desde el menú.');
}


/**
 * Rescata registros de la hoja RevisionEntregas generados por el script antiguo
 * (columnas 1–19, sin SemestreID). Solo vincula coincidencias verificables.
 * Mantiene los datos históricos: únicamente completa columnas 20–22.
 */
function vincularRegistrosLegados() {
  const ui=SpreadsheetApp.getUi();
  const ss=SpreadsheetApp.getActiveSpreadsheet(),cat=leerCatalogos_(),conf=configuracion_();
  const sh=asegurarHoja_(ss,PF.registro,PF.hdrRevision);
  if(sh.getLastRow()<2){ui.alert('No hay registros históricos.');return;}
  const datos=sh.getRange(2,1,sh.getLastRow()-1,PF.hdrRevision.length).getValues();
  const candidatos=[];let ambiguos=0;
  datos.forEach((r,i)=>{
    if(String(r[19]||'').trim()||esSinAsunto_(r[9])||!esInstitucional_(r[8]))return;
    const fecha=r[1] instanceof Date?r[1]:new Date(String(r[1]||''));
    if(isNaN(fecha.getTime())||diaLocal_(fecha,ss.getSpreadsheetTimeZone())<conf.fechaDesde)return;
    const email=normalizarCorreo_(r[8]);
    const alumnos=cat.porCorreo.get(email)||[];
    const grupo=String(r[5]||'').trim();
    const encontrados=alumnos.filter(a=>a.Grupo===grupo &&
      (!r[7]||idSimple_(r[7])===idSimple_(a.Matricula)));
    if(encontrados.length!==1){ambiguos++;return;}
    const a=encontrados[0];
    const tarea=cat.tareas.filter(t=>t.Grupo===grupo && normalizar_(t.Actividad)===normalizar_(r[10]));
    if(tarea.length!==1){ambiguos++;return;}
    candidatos.push({fila:i+2,semestre:cat.semestre,actividad:tarea[0].ActividadID,alumno:a.AlumnoID});
  });
  if(!candidatos.length){ui.alert('No hay registros antiguos con coincidencia única en este semestre. No se modificó nada.');return;}
  if(ui.alert('Vincular registros antiguos',
    'Se encontraron '+candidatos.length+' correos anteriores con coincidencias exactas de correo, grupo, matrícula y actividad, y fecha posterior a '+conf.fechaDesde+'.\n'+
    'Sin coincidencia verificable: '+ambiguos+'.\nSolo se completarán SemestreID, ActividadID y AlumnoID.\n¿Continuar?',ui.ButtonSet.YES_NO)!==ui.Button.YES)return;
  candidatos.forEach(c=>sh.getRange(c.fila,20,1,3).setValues([[c.semestre,c.actividad,c.alumno]]));
  prepararExportacionProfeFlow_(false);
  ui.alert('Vinculados: '+candidatos.length+'. Los demás permanecen sin modificar para revisión manual.');
}

function agregarSinDuplicados_(hoja,filas) {
  if(!filas.length)return;
  const vistos=new Set(hoja.getLastRow()>1?hoja.getRange(2,1,hoja.getLastRow()-1,1).getDisplayValues().map(f=>f[0]):[]);
  const nuevas=filas.filter(f=>{const id=String(f[0]||'').trim();if(!id||vistos.has(id))return false;vistos.add(id);return true});
  if(nuevas.length)hoja.getRange(hoja.getLastRow()+1,1,nuevas.length,nuevas[0].length).setValues(nuevas);
}
function etiquetarMensajes_(pendientes) {
  const cache=new Map();
  pendientes.forEach(({mensaje,etiqueta})=>{
    try{
      if(!cache.has(etiqueta)){
        let label=GmailApp.getUserLabelByName(etiqueta);
        if(!label)label=GmailApp.createLabel(etiqueta);
        cache.set(etiqueta,label);
      }
      mensaje.getThread().addLabel(cache.get(etiqueta));
    }catch(e){console.warn('No se pudo etiquetar un mensaje: '+e.message)}
  });
}
