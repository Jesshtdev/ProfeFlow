/* Capture presentation only. Instrument drafts use the existing evaluations shape;
   the official scorer and group save remain in exam-components.js. */
function examCapturePointText(value){return typeof value==='number'?String(Number(value.toPrecision(15))):value}
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
    button.textContent=Object.keys(selected).length?'Editar':'Calificar';onChange();
   });
  };
 });
}
function examCaptureProjection(components,result,audit,unsaved){
 const applicable=components.filter(c=>c.applicable),pending=applicable.filter(c=>c.obtained===null),obtained=applicable.reduce((sum,c)=>sum+(c.obtained===null?0:Number(c.obtained)),0);
 // This projection is never passed to the saver. Incomplete official results stay null.
 const grade=result.pending?(result.maximum?Aula.round(obtained*10/result.maximum,1).toFixed(1):'—'):(audit.final/10).toFixed(1);
 return '<div class="exam-grade-preview"><strong>'+esc(examCapturePointText(obtained))+'/'+esc(result.maximum)+' · '+grade+' / 10</strong><span class="exam-grade-state '+(result.pending?'provisional':'definitive')+'">'+(result.pending?'Provisional':'Definitiva')+'</span>'+(unsaved?'<small class="exam-unsaved">Sin guardar</small>':'')+(pending.length?'<small>Pendiente: '+esc(pending.map(c=>c.name).join(', '))+'</small>':'<small>Base '+(audit.original/10).toFixed(1)+' / 10 · Ajustes '+esc(Aula.round((audit.bonuses+audit.penalties)*10/audit.scale,1))+'</small>')+'</div>';
}
