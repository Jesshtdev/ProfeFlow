'use strict';
const PF_AREAS=[
 {id:'home',name:'Inicio',views:[['home','Resumen']]},
 {id:'review',name:'Revisión',views:[['review','Revisar actividades'],['emailQueue','Entregas por correo']]},
 {id:'grades',name:'Calificaciones',views:[['grades','Libro y parciales'],['physicalExams','Exámenes físicos'],['semesterConcentrate','Concentrado semestral'],['examGroups','Exámenes por turnos']]},
 {id:'attendance',name:'Asistencia y justificantes',views:[['attendance','Asistencia'],['justifications','Justificantes'],['eligibility','Derecho a examen'],['participation','Faltas consecutivas'],['activityAttendance','Cruzar con actividades']]},
 {id:'planning',name:'Horario y calendario',views:[['planning','Horario personal']]},
 {id:'admin',name:'Administración',views:[['admin','Accesos'],['manage','Semestres, materias y grupos'],['students','Alumnos'],['imports','Importaciones'],['courses','Cursos y talleres'],['activities','Actividades y plantillas'],['data','Datos y respaldos']]}
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
 const sectionIcons={home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',review:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9Z m-1 10 3 3 5-6"/>',grades:'<path d="m2 8 10-5 10 5-10 5Z m4 2v7q6 5 12 0v-7 M22 8v8"/>',attendance:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5"/>',planning:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',admin:'<path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z"/><circle cx="12" cy="12" r="3"/>'};
 const sectionIcon=id=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+sectionIcons[id]+'</svg>';
 $('sidebarNav').innerHTML=PF_AREAS.map(a=>{const open=pfFolderOpen===a.id,title=a.id==='home'?'Accesos':a.name;return '<section class="nav-folder '+(a.id===activeArea?'has-active':'')+'"><button type="button" class="folder-toggle" data-folder="'+a.id+'" aria-expanded="'+open+'" aria-controls="folder-'+a.id+'" title="'+esc(title)+'"><span class="folder-icon">'+sectionIcon(a.id)+'</span><span class="nav-label folder-title">'+esc(title)+'</span><svg class="folder-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 5 7 7-7 7"/></svg></button><div class="folder-items" id="folder-'+a.id+'" '+(open?'':'hidden')+'>'+a.views.map(([id,label])=>'<button type="button" class="folder-link '+(id===view?'active':'')+'" data-view="'+id+'" '+(id===view?'aria-current="page"':'')+'>'+esc(a.id==='home'?'Inicio':label)+'</button>').join('')+'</div></section>'}).join('');
 $('sidebarNav').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>{const wasCollapsed=document.body.classList.contains('sidebar-collapsed');if(wasCollapsed)$('sidebarToggle').click();pfFolderOpen=wasCollapsed?b.dataset.folder:pfFolderOpen===b.dataset.folder?'':b.dataset.folder;rememberFolder();updateFolderDisclosures()});
 $('sidebarNav').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
}

function updateFolderDisclosures(){$('sidebarNav').querySelectorAll('[data-folder]').forEach(b=>{const open=pfFolderOpen===b.dataset.folder;b.setAttribute('aria-expanded',String(open));$('folder-'+b.dataset.folder).hidden=!open})}
