'use strict';
const PF_AREAS=[
 {id:'home',name:'Inicio',views:[['home','Resumen']]},
 {id:'review',name:'Revisión',views:[['review','Revisar actividades'],['emailQueue','Entregas por correo']]},
 {id:'grades',name:'Calificaciones',views:[['grades','Libro y parciales'],['physicalExams','Exámenes físicos'],['semesterConcentrate','Concentrado semestral'],['examGroups','Exámenes por turnos']]},
 {id:'attendance',name:'Asistencia y justificantes',views:[['attendance','Asistencia'],['justifications','Justificantes'],['eligibility','Derecho a examen'],['participation','Faltas consecutivas'],['activityAttendance','Cruzar con actividades']]},
 {id:'planning',name:'Horario y calendario',views:[['planning','Horario personal']]},
 {id:'admin',name:'Administración',views:[['admin','Accesos'],['manage','Semestres, materias y grupos'],['students','Alumnos'],['activities','Actividades y plantillas'],['data','Datos y respaldos']]}
];
function renderSectionNavigation(){const area=PF_AREAS.find(a=>a.views.some(([id])=>id===view));if(!area)return;if(['review','grades'].includes(view)){const host=document.createElement('div');host.className='toolbar';host.innerHTML='<button id="safeMoodleOpen">Exportar selección a Moodle</button>';$('content').prepend(host);$('safeMoodleOpen').onclick=()=>safeMoodleExportForm();if(view==='review'){const pending=(db.emailDeliveries||[]).find(e=>e.status==='pending'&&e.studentId===student&&e.activityId===activity);if(pending){const hint=document.createElement('div');hint.className='warning';hint.innerHTML='Entrega por correo · Pendiente de validar <button id="reviewEmailPending">Validar entrega</button>';$('content').prepend(hint);$('reviewEmailPending').onclick=()=>{if(leave())emailDecisionForm(pending.id)}}}}renderFolderNavigation(area.id);$('sectionNav').innerHTML='';bindAll('[data-section-view]',b=>navigate(b.dataset.sectionView))}
function renderAdmin(){$('content').innerHTML='<div class="card compact"><h2>Administración</h2><p>Catálogos, configuración e importaciones en sus módulos habituales.</p><div class="admin-access">'+PF_AREAS.find(a=>a.id==='admin').views.filter(([id])=>id!=='admin').map(([id,name])=>`<button data-section-view="${id}">${esc(name)}</button>`).join('')+'</div><div class="toolbar">'+button('Importar alumnos','roster')+button('Importar calificaciones','gradesImport')+button('Opciones generales','settings')+button('Evaluación de la materia','evaluation')+'</div></div>';bindAll('[data-section-view]',b=>navigate(b.dataset.sectionView))}

const PF_FOLDER_KEY='profeflow-open-folder';
let pfFolderOpen=null,pfFolderView=null;
function rememberFolder(){try{localStorage.setItem(PF_FOLDER_KEY,pfFolderOpen||'none')}catch{}}
function renderFolderNavigation(activeArea){
 if(pfFolderOpen===null){let saved='';try{saved=localStorage.getItem(PF_FOLDER_KEY)||''}catch{}pfFolderOpen=saved==='none'?'':PF_AREAS.some(a=>a.id===saved)?saved:activeArea}
 else if(pfFolderView!==view){pfFolderOpen=activeArea;rememberFolder()}
 pfFolderView=view;
 const folderIcon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>';
 $('sidebarNav').innerHTML=PF_AREAS.map(a=>{const open=pfFolderOpen===a.id,title=a.id==='home'?'Accesos':a.name;return '<section class="nav-folder '+(a.id===activeArea?'has-active':'')+'"><button type="button" class="folder-toggle" data-folder="'+a.id+'" aria-expanded="'+open+'" aria-controls="folder-'+a.id+'" title="'+esc(title)+'"><span class="folder-icon">'+folderIcon+'</span><span class="nav-label folder-title">'+esc(title)+'</span><svg class="folder-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 5 7 7-7 7"/></svg></button><div class="folder-items" id="folder-'+a.id+'" '+(open?'':'hidden')+'>'+a.views.map(([id,label])=>'<button type="button" class="folder-link '+(id===view?'active':'')+'" data-view="'+id+'" '+(id===view?'aria-current="page"':'')+'>'+esc(a.id==='home'?'Inicio':label)+'</button>').join('')+'</div></section>'}).join('');
 $('sidebarNav').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>{const wasCollapsed=document.body.classList.contains('sidebar-collapsed');if(wasCollapsed)$('sidebarToggle').click();pfFolderOpen=wasCollapsed?b.dataset.folder:pfFolderOpen===b.dataset.folder?'':b.dataset.folder;rememberFolder();updateFolderDisclosures()});
 $('sidebarNav').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
}

function updateFolderDisclosures(){$('sidebarNav').querySelectorAll('[data-folder]').forEach(b=>{const open=pfFolderOpen===b.dataset.folder;b.setAttribute('aria-expanded',String(open));$('folder-'+b.dataset.folder).hidden=!open})}
