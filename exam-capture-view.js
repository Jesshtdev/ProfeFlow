/* Capture presentation only. Instrument drafts use the existing evaluations shape;
   the official scorer and group save remain in exam-components.js. */
function examCapturePointText(value){return typeof value==='number'?String(Number(value.toPrecision(15))):value}
function examCaptureRowState(r){return JSON.stringify([r.values,r.componentNotes,r.notes,r.projectDeliveredAt,r.evaluations,!!r.np,r.npPreviousCapture||{},!!r.npRestore])}
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
 root.querySelectorAll('[data-exam-instrument]').forEach(button=>{
  const scope=button.dataset.sectionScope,key=button.dataset.examInstrument,section=config.criteria.find(c=>c.key===key),field=[...root.querySelectorAll('[data-exam-instrument-draft]')].find(el=>el.dataset.sectionScope===scope&&el.dataset.examInstrumentDraft===key),points=[...root.querySelectorAll('[data-section-points]')].find(el=>el.dataset.sectionScope===scope&&el.dataset.sectionPoints===key);
  points.readOnly=true;points.setAttribute('readonly','');
  button.onclick=()=>{
   const person=typeof db!=='undefined'?db.students.find(s=>s.id===scope):null;
   dialog('Calificar · '+section.name,'<div class="exam-instrument-dialog"><p class="exam-instrument-context">'+esc(person?.name||'')+' · Máximo '+esc(section.max)+' puntos</p><p class="muted">Los cambios se conservan en el borrador. Utiliza «Guardar examen del grupo» para guardarlos.</p>'+examSectionControls(section,scope,JSON.parse(field.value||'{}'))+'<div class="exam-instrument-total">Puntos obtenidos <input readonly data-section-points="'+esc(key)+'" data-section-scope="'+esc(scope)+'" aria-label="Puntos del instrumento"><span>/ '+esc(section.max)+'</span></div></div>',()=>true,'Listo');
   $('modal').classList.toggle('exam-instrument-modal',true);const cancelLabel=$('cancel').textContent;$('cancel').textContent='Cerrar';modalCleanup=()=>{$('modal').classList.toggle('exam-instrument-modal',false);$('cancel').textContent=cancelLabel};
   const panel=$('modalContent');panel.querySelectorAll('details').forEach(el=>el.open=true);
   bindExamSectionControls(panel,{criteria:[section]},()=>{
    const selected=readExamSectionSelections(panel,scope)[key]||{};
    field.value=JSON.stringify(selected);const score=examSectionScore(section,selected);points.value=score===null?'':examCapturePointText(score);
    button.textContent=Object.keys(selected).length?'Editar':'Calificar';onChange(scope);
   });
  };
 });
}
function examCaptureProjection(components,result,audit,unsaved){
 const applicable=components.filter(c=>c.applicable),pending=applicable.filter(c=>c.obtained===null),obtained=applicable.reduce((sum,c)=>sum+(c.obtained===null?0:Number(c.obtained)),0);
 const flag=unsaved?'<small class="exam-unsaved">Sin guardar</small>':'';
 if(applicable.length&&applicable.every(c=>c.notPresented))return '<div class="exam-grade-preview"><strong>NP · No presentó</strong><span class="exam-grade-state definitive">0.0 / 10 · Definitiva</span><small>0/'+esc(result.maximum)+' puntos · No presentó examen</small>'+flag+'</div>';
 if(applicable.every(c=>c.obtained===null&&!Object.keys(c.sectionEvaluation?.selections||{}).length))return '<div class="exam-grade-preview"><strong>Sin capturar</strong><span>— / 10</span><small>Pendiente: '+esc(pending.map(c=>c.name).join(', '))+'</small>'+flag+'</div>';
 // This projection is never passed to the saver. Incomplete official results stay null.
 const grade=result.pending?(result.maximum?Aula.round(obtained*10/result.maximum,1).toFixed(1):'—'):(audit.final/10).toFixed(1);
 return '<div class="exam-grade-preview"><strong>'+esc(examCapturePointText(obtained))+'/'+esc(result.maximum)+' · '+grade+' / 10</strong><span class="exam-grade-state '+(result.pending?'provisional':'definitive')+'">'+(result.pending?'Provisional':'Definitiva')+'</span>'+(unsaved?'<small class="exam-unsaved">Sin guardar</small>':'')+(pending.length?'<small>Pendiente: '+esc(pending.map(c=>c.name).join(', '))+'</small>':'<small>Base '+(audit.original/10).toFixed(1)+' / 10 · Ajustes '+esc(Aula.round((audit.bonuses+audit.penalties)*10/audit.scale,1))+'</small>')+'</div>';
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
function bindExamCaptureDivisionFilter(people,onSave,onDiscard){
 const context=examCaptureDivisionContext(group,people),{plans,plan,state}=context,holder=$('physicalDivisionFilter');holder.hidden=!plans.length;
 holder.innerHTML=plan?'<label>Distribución<select id="physicalPlanChoice">'+options(plans.map(p=>({id:p.id,name:p.title+(p.archivedAt?' · Archivada':'')})),state.planId)+'</select></label><label>División<select id="physicalDivisionChoice">'+options([{id:'all',name:'Todos los alumnos'},...plan.slots.map(s=>({id:s.id,name:s.name})),{id:'unassigned',name:'Sin asignar'}],state.slotId)+'</select></label><span id="physicalDivisionCount" role="status"></span>':'';
 function apply(){
  const current=examCaptureDivisionContext(group,people),ids=current.visibleIds;
  $('physicalTable').querySelectorAll('[data-exam-student-row]').forEach(row=>row.hidden=!ids.has(row.dataset.examStudentRow));
  $('examAssessmentTools').querySelectorAll('[data-exam-team-grade]').forEach(button=>{const card=button.closest('.team-card'),members=[...card.querySelectorAll('[data-exam-team-student]')];members.forEach(el=>el.hidden=!ids.has(el.dataset.examTeamStudent));card.hidden=members.length>0&&!members.some(el=>!el.hidden)});
  if($('physicalDivisionCount'))$('physicalDivisionCount').textContent=ids.size+' de '+people.length+' alumnos';
  if($('physicalPlanChoice')){$('physicalPlanChoice').value=state.planId;$('physicalDivisionChoice').innerHTML=options([{id:'all',name:'Todos los alumnos'},...(current.plan?.slots||[]).map(s=>({id:s.id,name:s.name})),{id:'unassigned',name:'Sin asignar'}],state.slotId);$('physicalDivisionChoice').value=state.slotId}
 }
 function change(next){
  const commit=()=>{Object.assign(state,next);apply()};
  if($('savePhysicalExams').disabled||$('saveStatus').textContent==='Guardando…'){apply();return}
  if(!physicalExamDirty()){commit();return}
  apply();dialog('Captura sin guardar','<p>Guarda o descarta la captura pendiente antes de cambiar de división o distribución.</p><button type="button" id="physicalDivisionDiscard">Descartar y cambiar</button>',async()=>{await onSave();if(physicalExamDirty()){$('modalError').textContent='No se cambió el filtro. Corrige o reintenta el guardado.';$('modalError').hidden=false;return false}commit();return true},'Guardar y cambiar');
  $('physicalDivisionDiscard').onclick=()=>{onDiscard();commit();closeModal()};
 }
 if(plan){$('physicalPlanChoice').onchange=()=>change({planId:$('physicalPlanChoice').value,slotId:'all'});$('physicalDivisionChoice').onchange=()=>change({slotId:$('physicalDivisionChoice').value})}
 apply();return apply;
}
