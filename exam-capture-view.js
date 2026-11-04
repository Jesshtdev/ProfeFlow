/* Capture presentation only. Instrument drafts use the existing evaluations shape;
   the official scorer and group save remain in exam-components.js. */
function examCapturePointText(value){return typeof value==='number'?String(Number(value.toPrecision(15))):value}
function examCaptureRowState(r){return JSON.stringify([r.values,r.componentNotes,r.notes,r.projectDeliveredAt,r.evaluations,!!r.np,r.npPreviousCapture||{},!!r.npRestore,r.examVersion||'',r.extra??'',r.extraReason||''])}
function examCaptureGradeState(r){return JSON.stringify(JSON.parse(examCaptureRowState(r)).slice(0,8))}
function examCaptureVersionHTML(sid,draft,version){const selected=draft?.examVersion??version??'';return '<div class="exam-version-control" role="group" aria-label="Versión del examen"><span>Versión</span>'+[['A','A'],['B','B'],['','—']].map(([value,label])=>'<button type="button" data-exam-version-choice="'+value+'" data-version-student="'+esc(sid)+'" aria-label="'+(value?'Versión '+value:'Sin versión')+'" aria-pressed="'+(selected===value)+'">'+label+'</button>').join('')+'<button type="button" data-exam-version-key="'+esc(sid)+'" aria-label="Consultar clave de la versión">Clave</button><input type="hidden" data-exam-version="'+esc(sid)+'" value="'+esc(selected)+'"></div>'}
function bindExamCaptureVersions(root,onChange){root.querySelectorAll('[data-exam-version-key]').forEach(b=>b.onclick=()=>openExamKeys(group,period,$('physicalCategory').value,root.querySelector('[data-exam-version="'+b.dataset.examVersionKey+'"]').value));root.querySelectorAll('[data-exam-version-choice]').forEach(button=>button.onclick=()=>{const sid=button.dataset.versionStudent;root.querySelector('[data-exam-version="'+sid+'"]').value=button.dataset.examVersionChoice;root.querySelectorAll('[data-version-student="'+sid+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));onChange()})}
function examCaptureNPHTML(sid,draft,prior){const np=draft?.np??prior?.examStatus==='np';return '<div class="exam-np-control"><button type="button" data-exam-np-toggle="'+esc(sid)+'" aria-label="No presentó examen" aria-pressed="'+np+'" title="Marcar o desmarcar No presentó">NP</button><input type="hidden" data-exam-np="'+esc(sid)+'" value="'+np+'"><input type="hidden" data-exam-np-previous="'+esc(sid)+'" value="'+esc(JSON.stringify(draft?.npPreviousCapture||prior?.npPreviousCapture||{}))+'"><input type="hidden" data-exam-np-restore="'+esc(sid)+'" value="'+!!draft?.npRestore+'"></div>'}
function examCaptureNPState(sid){return {np:document.querySelector('[data-exam-np="'+sid+'"]').value==='true',npPreviousCapture:JSON.parse(document.querySelector('[data-exam-np-previous="'+sid+'"]').value||'{}'),npRestore:document.querySelector('[data-exam-np-restore="'+sid+'"]').value==='true'}}
function examCaptureClearNPRecovery(sid){const el=document.querySelector('[data-exam-np-restore="'+sid+'"]');if(el)el.value='false'}
function examCaptureNPLock(root){root.querySelectorAll('[data-exam-np]').forEach(marker=>{const sid=marker.dataset.examNp,np=marker.value==='true';root.querySelectorAll('[data-exam-component]').forEach(el=>{if(el.dataset.forStudent===sid&&np){el.disabled=true;el.value=el.hidden?'':'0'}});root.querySelectorAll('[data-exam-instrument]').forEach(el=>{if(el.dataset.sectionScope===sid){el.disabled=np;const saved=root.querySelector('[data-exam-instrument-draft="'+el.dataset.examInstrument+'"][data-section-scope="'+sid+'"]');el.textContent=Object.keys(JSON.parse(saved?.value||'{}')).length?'Editar':'Calificar'}});root.querySelector('[data-exam-np-toggle="'+sid+'"]').setAttribute('aria-pressed',String(np))})}
function bindExamCaptureNP(root,config,rows,priorFor,canReuseRecord,onChange){root.querySelectorAll('[data-exam-np-toggle]').forEach(button=>button.onclick=()=>{
 const sid=button.dataset.examNpToggle,row=rows().find(r=>r.studentId===sid),prior=priorFor(sid),marker=root.querySelector('[data-exam-np="'+sid+'"]'),previous=root.querySelector('[data-exam-np-previous="'+sid+'"]'),restore=root.querySelector('[data-exam-np-restore="'+sid+'"]');
 let capture=row.npPreviousCapture;
 if(!row.np){const hasCapture=prior?.score!=null||Object.values(row.values).some(v=>v!=='')||Object.values(row.evaluations).some(v=>Object.keys(v).length);if(hasCapture&&!confirm('¿Sustituir la captura de este alumno por NP (No presentó), con 0.0/10? La captura previa se conserva para recuperarla.'))return;
  if(!row.npRestore)capture={config:Aula.clone(config),values:Aula.clone(row.values),componentNotes:Aula.clone(row.componentNotes),evaluations:Aula.clone(row.evaluations),notes:row.notes,projectDeliveredAt:row.projectDeliveredAt,savedRecordId:prior?.examStatus!=='np'&&prior&&canReuseRecord(row)?prior.id:''};previous.value=JSON.stringify(capture);marker.value='true';restore.value='false';
 }else{marker.value='false';restore.value=String(prior?.examStatus==='np')}
 root.querySelectorAll('[data-exam-component]').forEach(el=>{if(el.dataset.forStudent===sid){const c=examConfiguredComponents(config,{}).find(c=>c.key===el.dataset.examComponent);el.value=row.np?(capture.values?.[el.dataset.examComponent]??''):c?.applicable?'0':''}});
 root.querySelectorAll('[data-exam-instrument-draft]').forEach(el=>{if(el.dataset.sectionScope===sid)el.value=JSON.stringify(row.np?capture.evaluations?.[el.dataset.examInstrumentDraft]||{}:{})});
 if(row.np){if(prior?.examStatus!=='np')previous.value='{}';root.querySelectorAll('[data-component-note]').forEach(el=>{if(el.dataset.forStudent===sid)el.value=capture.componentNotes?.[el.dataset.componentNote]||''});root.querySelector('[data-exam-note="'+sid+'"]').value=capture.notes||'';const date=root.querySelector('[data-exam-project-date="'+sid+'"]');if(date)date.value=capture.projectDeliveredAt||''}
 onChange();
})}
function examCaptureSelections(root,scope){return Object.fromEntries([...root.querySelectorAll('[data-exam-instrument-draft]')].filter(el=>el.dataset.sectionScope===scope).map(el=>[el.dataset.examInstrumentDraft,JSON.parse(el.value||'{}')]))}
function examCaptureInstrument(section,scope,selections){
 if(examSectionMethod(section)==='points'||section.applicable===false)return '';
 return '<input type="hidden" data-exam-instrument-draft="'+esc(section.key)+'" data-section-scope="'+esc(scope)+'" value="'+esc(JSON.stringify(selections))+'"><button type="button" class="exam-instrument-action" data-exam-instrument="'+esc(section.key)+'" data-section-scope="'+esc(scope)+'">'+(Object.keys(selections).length?'Editar':'Calificar')+'</button>';
}
function bindExamCaptureInstruments(root,config,onChange){
 bindExamDecimalInputs(root);
 root.querySelectorAll('[data-exam-instrument]').forEach(button=>{
  const scope=button.dataset.sectionScope,key=button.dataset.examInstrument,section=config.criteria.find(c=>c.key===key),field=[...root.querySelectorAll('[data-exam-instrument-draft]')].find(el=>el.dataset.sectionScope===scope&&el.dataset.examInstrumentDraft===key),points=[...root.querySelectorAll('[data-section-points]')].find(el=>el.dataset.sectionScope===scope&&el.dataset.sectionPoints===key);
  points.readOnly=false;points.title='Captura directa de puntos; utiliza Calificar / Editar para evaluar por criterios.';
  points.oninput=()=>{
   const previous=JSON.parse(field.value||'{}');
   if(!examSectionDirect(previous)&&Object.keys(previous).length){
    const oldScore=examSectionScore(section,previous);
    if(points.value===(oldScore===null?'':examCapturePointText(oldScore)))return;
    if(!confirm('¿Sustituir la evaluación por criterios de esta sección por una captura directa? La evaluación guardada se conserva en el historial.')){points.value=oldScore===null?'':examCapturePointText(oldScore);return}
   }
   field.value=JSON.stringify({$capture:'direct',$points:points.value});button.textContent='Editar';onChange(scope);
  };
  button.onclick=()=>{
   const person=typeof db!=='undefined'?db.students.find(s=>s.id===scope):null;
   dialog('Calificar · '+section.name,'<div class="exam-instrument-dialog"><p class="exam-instrument-context">'+esc(person?.name||'')+' · Máximo '+esc(section.max)+' puntos</p><p class="muted">Los cambios se conservan en el borrador. Utiliza «Guardar examen del grupo» para guardarlos.</p>'+examSectionControls(section,scope,JSON.parse(field.value||'{}'))+'<div class="exam-instrument-total">Puntos obtenidos: <input readonly data-section-points="'+esc(key)+'" data-section-scope="'+esc(scope)+'" aria-label="Puntos del instrumento"><span>/ '+esc(section.max)+'</span>'+(examChecklistManual(section)?'<small data-section-progress="'+esc(key)+'" data-section-scope="'+esc(scope)+'"></small>':'')+'</div></div>',()=>true,'Listo');
   $('modal').classList.toggle('exam-instrument-modal',true);const cancelLabel=$('cancel').textContent;$('cancel').textContent='Cerrar';modalCleanup=()=>{$('modal').classList.toggle('exam-instrument-modal',false);$('cancel').textContent=cancelLabel};
   const panel=$('modalContent');panel.querySelectorAll('details').forEach(el=>el.open=true);
   bindExamSectionControls(panel,{criteria:[section]},()=>{
    const selected=readExamSectionSelections(panel,scope)[key]||{};
    field.value=JSON.stringify(selected);try{const score=examSectionScore(section,selected);points.value=score===null?'':examCapturePointText(score);clearError()}catch(e){points.value='';modalError(e.message)}
    button.textContent=Object.keys(selected).length?'Editar':'Calificar';onChange(scope);
   });
  };
 });
}
function examCaptureProjection(components,result,audit,unsaved){
 const applicable=components.filter(c=>c.applicable),pending=applicable.filter(c=>c.obtained===null),obtained=applicable.reduce((sum,c)=>sum+(c.obtained===null?(c.sectionEvaluation?.checklistMode==='points'?examChecklistPoints({...c,criteria:c.sectionEvaluation.criteria},c.sectionEvaluation.selections):0):Number(c.obtained)),0);
 const flag=unsaved?'<small class="exam-unsaved">Sin guardar</small>':'';
 if(applicable.length&&applicable.every(c=>c.notPresented))return '<div class="exam-grade-preview"><strong>NP · No presentó</strong><span class="exam-grade-state definitive">0.0 / 10 · Definitiva</span><small>0/'+esc(result.maximum)+' puntos · No presentó examen</small>'+flag+'</div>';
 if(applicable.every(c=>c.obtained===null&&!Object.keys(c.sectionEvaluation?.selections||{}).length))return '<div class="exam-grade-preview"><strong>Sin capturar</strong><span>— / 10</span><small>Pendiente: '+esc(pending.map(c=>c.name).join(', '))+'</small>'+flag+'</div>';
 // This projection is never passed to the saver. Incomplete official results stay null.
 const grade=result.pending?(audit.previewFinal!==undefined?(audit.previewFinal/10).toFixed(1):result.maximum?Aula.round(obtained*10/result.maximum,1).toFixed(1):'—'):(audit.final/10).toFixed(1);
 const tone=Number.isFinite(Number(grade))?(Number(grade)>=6?'pass':Number(grade)>=5.5?'warning':'fail'):'';
 return '<div class="exam-grade-preview'+(tone?' exam-grade-'+tone:'')+'"><strong class="exam-grade-value">'+grade+' / 10</strong><span class="exam-grade-points">'+esc(examCapturePointText(obtained))+' / '+esc(result.maximum)+' puntos</span><span class="exam-grade-state '+(result.pending?'provisional':'definitive')+'">'+(result.pending?'Provisional':'Definitiva')+'</span>'+(unsaved?'<small class="exam-unsaved">Sin guardar</small>':'')+(pending.length?'<small>Extra +'+esc(Aula.round(audit.bonuses*10/audit.scale,1))+(audit.penalties?' · Penalizaciones '+esc(Aula.round(audit.penalties*10/audit.scale,1)):'')+'</small><small>Pendiente: '+esc(pending.map(c=>c.name).join(', '))+'</small>':'<small>Base '+(audit.original/10).toFixed(1)+' / 10'+(audit.rounded!==undefined&&audit.rounded!==Aula.round(audit.original/10,1)*10?' · Redondeada '+(audit.rounded/10).toFixed(1)+' / 10':'')+' · Extra +'+esc(Aula.round(audit.bonuses*10/audit.scale,1))+(audit.penalties?' · Penalizaciones '+esc(Aula.round(audit.penalties*10/audit.scale,1)):'')+'</small>')+'</div>';
}

// Screen-only selection: the official roster, plans and grades are never rewritten.
const examCaptureDivisionStates=new Map();
function examCaptureDivisionContext(gid,people=roster(gid)){
 const plans=(db.examPlans||[]).filter(p=>p.groupId===gid&&!p.trashId).slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
 if(!examCaptureDivisionStates.has(gid))examCaptureDivisionStates.set(gid,{planId:'',slotId:'all'});
 const state=examCaptureDivisionStates.get(gid),plan=plans.find(p=>p.id===state.planId)||plans[0];state.planId=plan?.id||'';
 if(!plan||!['all','unassigned',...plan.slots.map(s=>s.id)].includes(state.slotId))state.slotId='all';
 const assigned=new Set(plan?.slots.flatMap(s=>s.members.map(m=>m.studentId))||[]),selected=new Set(plan?.slots.find(s=>s.id===state.slotId)?.members.map(m=>m.studentId)||[]);
 const visibleIds=new Set(people.filter(s=>state.slotId==='all'||state.slotId==='unassigned'&&!assigned.has(s.id)||selected.has(s.id)).map(s=>s.id));
 return {plans,plan,state,visibleIds};
}
// Use structured names only; a full-name fallback is never split heuristically.
function examCaptureCompareStudents(a,b,order){
 const collator=new Intl.Collator('es-MX',{sensitivity:'base',numeric:true}),parts=s=>{const p=studentNameParts(s);return {given:s.givenName||s.firstName||p.given,family:s.paternalSurname||p.family,maternal:s.maternalSurname||''}};
 const x=parts(a),y=parts(b),keys=order==='number'?[[a.number,b.number]]:order==='surname'?[[x.family||a.name,y.family||b.name],[x.maternal,y.maternal],[x.given,y.given]]:[[x.given,y.given]];
 for(const [left,right] of [...keys,[a.name,b.name],[a.number,b.number],[a.id,b.id]]){const n=collator.compare(String(left||''),String(right||''));if(n)return n}return 0;
}
function bindExamCaptureDivisionFilter(people,onSave,onDiscard){
 const context=examCaptureDivisionContext(group,people),{plans,plan,state}=context,holder=$('physicalDivisionFilter');holder.hidden=false;
 holder.innerHTML=plan?'<label>Distribución<select id="physicalPlanChoice">'+options(plans.map(p=>({id:p.id,name:p.title+(p.archivedAt?' · Archivada':'')})),state.planId)+'</select></label><label>División<select id="physicalDivisionChoice">'+options([{id:'all',name:'Todos los alumnos'},...plan.slots.map(s=>({id:s.id,name:s.name})),{id:'unassigned',name:'Sin asignar'}],state.slotId)+'</select></label><span id="physicalDivisionCount" role="status"></span>':'';state.version??='all';state.order??='name';state.grouping??=state.order==='version'?'version':'none';state.collapsed??=new Set();holder.innerHTML+='<label>Versión<select id="physicalVersionChoice">'+options([{id:'all',name:'Todos'},{id:'A',name:'Versión A'},{id:'B',name:'Versión B'},{id:'none',name:'Sin versión'}],state.version)+'</select></label><label>Orden<select id="physicalVersionOrder">'+options([{id:'surname',name:'Por apellido (A–Z)'},{id:'name',name:'Por nombre (A–Z)'},{id:'number',name:'Por matrícula'},{id:'version',name:'Agrupar por versión'}],state.order)+'</select></label>'+'<label>Agrupación<select id="physicalGrouping">'+options([{id:'none',name:'Sin agrupar'},...(plan?[{id:'division',name:'Por división'}]:[]),{id:'version',name:'Por versión'}],state.grouping)+'</select></label><span id="physicalGroupActions" class="exam-group-actions"><button type="button" id="physicalExpandAll">Expandir todos</button><button type="button" id="physicalCollapseAll">Minimizar todos</button></span>'+(!plan?'<span id="physicalDivisionCount" role="status"></span>':'');
 function apply(){
  $('physicalVersionChoice').value=state.version;$('physicalVersionOrder').value=state.order;
  const current=examCaptureDivisionContext(group,people),ids=new Set([...current.visibleIds].filter(sid=>{const v=document.querySelector('[data-exam-version="'+sid+'"]')?.value||'';return state.version==='all'||(state.version==='none'?!v:v===state.version)}));
  $('physicalGrouping').value=state.grouping;
  const table=$('physicalTable'),students=new Map(people.map(s=>[s.id,s])),version=sid=>document.querySelector('[data-exam-version="'+sid+'"]')?.value||'Z';
  const slots=current.plan?.slots||[],slotFor=sid=>slots.find(s=>s.members.some(m=>m.studentId===sid)),grouped=state.grouping!=='none';
  const groupFor=sid=>state.grouping==='version'?version(sid):slotFor(sid)?.id||'unassigned';
  const groupKeys=state.grouping==='version'?['A','B','Z']:[...slots.map(s=>s.id),'unassigned'];
  const groupName=key=>state.grouping==='version'?(key==='Z'?'Sin versión':'Versión '+key):(slots.find(s=>s.id===key)?.name||'Sin asignar');
  const collapseKey=key=>state.grouping+':'+(state.grouping==='division'?state.planId+':':'')+key;
  const order=[...table.querySelectorAll('[data-exam-student-row]')];
  order.sort((a,b)=>(grouped?groupKeys.indexOf(groupFor(a.dataset.examStudentRow))-groupKeys.indexOf(groupFor(b.dataset.examStudentRow)):0)||examCaptureCompareStudents(students.get(a.dataset.examStudentRow),students.get(b.dataset.examStudentRow),state.order));
  const counts=new Map();for(const sid of ids){const key=groupFor(sid);counts.set(key,(counts.get(key)||0)+1)}
  let last=null;const desired=[];for(const row of order){const sid=row.dataset.examStudentRow,key=groupFor(sid);if(grouped&&ids.has(sid)&&key!==last){desired.push('heading:'+key);last=key}desired.push(sid)}
  const actual=[...table.querySelectorAll('[data-exam-student-row], [data-exam-group-heading]')].map(row=>row.dataset.examStudentRow||'heading:'+row.dataset.examGroupHeading);
  if(JSON.stringify(actual)!==JSON.stringify(desired)){
   table.querySelectorAll('[data-exam-group-heading]').forEach(e=>e.remove());last=null;
   for(const row of order){const parent=row.parentElement,sid=row.dataset.examStudentRow,key=groupFor(sid);if(grouped&&ids.has(sid)&&key!==last){const heading=document.createElement('tr');heading.dataset.examGroupHeading=key;if(state.grouping==='version')heading.dataset.versionHeading=key;heading.innerHTML='<td colspan="'+row.children.length+'"><button type="button" class="exam-group-toggle"></button></td>';parent.appendChild(heading);last=key}parent.appendChild(row)}
  }
  table.querySelectorAll('[data-exam-group-heading]').forEach(heading=>{const key=heading.dataset.examGroupHeading,button=heading.querySelector('button'),closed=state.collapsed.has(collapseKey(key));button.textContent=(closed?'▸ ':'▾ ')+groupName(key)+' · '+counts.get(key)+' alumnos';button.setAttribute('aria-expanded',String(!closed));button.onclick=()=>{const k=collapseKey(key);if(state.collapsed.has(k))state.collapsed.delete(k);else state.collapsed.add(k);apply()}});
  table.querySelectorAll('[data-exam-student-row]').forEach(row=>row.hidden=!ids.has(row.dataset.examStudentRow)||grouped&&state.collapsed.has(collapseKey(groupFor(row.dataset.examStudentRow))));
  table.querySelectorAll('[data-exam-student-row]').forEach(row=>{const panel=table.querySelector('[data-exam-comments-row="'+row.dataset.examStudentRow+'"]');if(panel){if(row.nextElementSibling!==panel)row.after(panel);panel.hidden=row.hidden||row.querySelector('[data-exam-comments-toggle]')?.getAttribute('aria-expanded')!=='true'}});
  $('physicalGroupActions').hidden=!grouped;
  $('physicalExpandAll').onclick=()=>{for(const key of counts.keys())state.collapsed.delete(collapseKey(key));apply()};
  $('physicalCollapseAll').onclick=()=>{for(const key of counts.keys())state.collapsed.add(collapseKey(key));apply()};
  $('examAssessmentTools').querySelectorAll('[data-exam-team-grade]').forEach(button=>{const card=button.closest('.team-card'),members=[...card.querySelectorAll('[data-exam-team-student]')];members.forEach(el=>el.hidden=!ids.has(el.dataset.examTeamStudent));card.hidden=members.length>0&&!members.some(el=>!el.hidden)});
  if($('physicalDivisionCount'))$('physicalDivisionCount').textContent=ids.size+' de '+people.length+' alumnos';
  if($('physicalPlanChoice')){$('physicalPlanChoice').value=state.planId;$('physicalDivisionChoice').innerHTML=options([{id:'all',name:'Todos los alumnos'},...(current.plan?.slots||[]).map(s=>({id:s.id,name:s.name})),{id:'unassigned',name:'Sin asignar'}],state.slotId);$('physicalDivisionChoice').value=state.slotId}
 }
 $('physicalVersionChoice').value=state.version;$('physicalVersionOrder').value=state.order;
 function change(next){
  const commit=()=>{Object.assign(state,next);apply()};
  if($('savePhysicalExams').disabled||$('saveStatus').textContent==='Guardando…'){apply();return}
  if(!physicalExamDirty()){commit();return}
  apply();dialog('Captura sin guardar','<p>Guarda o descarta la captura pendiente antes de cambiar de filtro.</p><button type="button" id="physicalDivisionDiscard">Descartar y cambiar</button>',async()=>{await onSave();if(physicalExamDirty()){$('modalError').textContent='No se cambió el filtro. Corrige o reintenta el guardado.';$('modalError').hidden=false;return false}commit();return true},'Guardar y cambiar');
  $('physicalDivisionDiscard').onclick=()=>{onDiscard();commit();closeModal()};
 }
 $('physicalVersionChoice').onchange=()=>change({version:$('physicalVersionChoice').value});$('physicalVersionOrder').onchange=()=>{state.order=$('physicalVersionOrder').value;if(state.order==='version')state.grouping='version';apply()};
 $('physicalGrouping').onchange=()=>{state.grouping=$('physicalGrouping').value;if(state.order==='version'&&state.grouping!=='version')state.order='name';apply()};
 if(plan){$('physicalPlanChoice').onchange=()=>change({planId:$('physicalPlanChoice').value,slotId:'all'});$('physicalDivisionChoice').onchange=()=>change({slotId:$('physicalDivisionChoice').value})}
 apply();return apply;
}
