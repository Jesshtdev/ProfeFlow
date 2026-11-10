const {run,assert,$,context,memory}=require('./helper.cjs');
(async()=>{
 await run('boot()');run(`db.settings.reviewStudentsCollapsed=true;openReview('a1','u0')`);
 assert($('reviewRosterPanel').hidden);assert.equal($('toggleStudentList').textContent,'Mostrar alumnos');
 $('toggleStudentList').click();assert.equal(memory.get('profeflow-review-students-collapsed'),'false');
 run('draft=null;renderReview()');assert(!$('reviewRosterPanel').hidden); // local false overrides legacy true
 run(`draft.values[act().criteria[0].id]=.5;draft.manualScore=85.25;draft.notes='Comentario conservado';updateReview();var captureBefore=JSON.stringify(draft),dbBefore=JSON.stringify(db),contextBefore=JSON.stringify([student,activity,reviewFilter,reviewSearchQuery]);var originalRender=render,originalMutate=mutate,originalWrite=AulaStorage.write;render=()=>{throw Error('Unexpected render')};mutate=()=>{throw Error('Unexpected mutation')};AulaStorage.write=()=>{throw Error('Unexpected write')};var ProfeCloud={hasPending:()=>true};`);
 const input=$('manualValue'),panel=$('reviewRosterPanel');$('saveStatus').textContent='Hay un guardado sin confirmar';$('reviewSaveStatus').textContent='No guardado · Conservamos tu captura';
 context.window.scrollX=0;context.window.scrollY=180;context.window.scrollTo=(x,y)=>{assert.equal(x,0);assert.equal(y,180)};
 for(let i=0;i<40;i++){$('toggleStudentList').click();assert.equal(panel.hidden,i%2===0);assert.equal($('toggleStudentList').getAttribute('aria-expanded'),String(!panel.hidden));assert.equal(panel.closest('.review-layout').classList.contains('students-collapsed'),panel.hidden)}
 assert.strictEqual($('manualValue'),input);assert.equal(run('JSON.stringify(draft)'),run('captureBefore'));assert.equal(run('JSON.stringify(db)'),run('dbBefore'));assert.equal(run('JSON.stringify([student,activity,reviewFilter,reviewSearchQuery])'),run('contextBefore'));assert.equal($('saveStatus').textContent,'Hay un guardado sin confirmar');assert.equal($('reviewSaveStatus').textContent,'No guardado · Conservamos tu captura');
 // Restricted browser storage does not prevent immediate local interaction.
 const set=context.localStorage.setItem;context.localStorage.setItem=()=>{throw Error('Storage unavailable')};$('toggleStudentList').click();assert(panel.hidden);context.localStorage.setItem=set;
 run(`render=originalRender;mutate=originalMutate;AulaStorage.write=originalWrite;ProfeCloud.hasPending=()=>false`);memory.set('profeflow-review-students-collapsed','true');run('draft=null;renderReview()');assert($('reviewRosterPanel').hidden);assert.equal($('manualValue').value,'85.25');
 console.log('PASS roster toggle: legacy fallback/local override, synchronous repeated DOM toggles, no render/mutation/write even with unconfirmed cloud, exact draft/context/control identity and errors preserved, scroll retained, unavailable storage tolerated');
})().catch(e=>{console.error(e);process.exitCode=1});
