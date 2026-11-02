const {createRequire}=require('module'),assert=require('assert'),fs=require('fs');
const load=createRequire('C:/Users/jessi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');let browser;const live=process.env.PROFEFLOW_VERIFY_URL||'';
(async()=>{
 browser=await load('playwright').chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 for(const viewport of [{width:1440,height:1000},{width:1280,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,timezoneId:'America/Mexico_City'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.addInitScript(seed=>{if(!localStorage.getItem('team-test-seeded')){localStorage.setItem('aula-revision-v1',seed);localStorage.setItem('team-test-seeded','1')}},fs.readFileSync('tests/fixture.json','utf8'));
  await page.route('**/*',async r=>{const u=new URL(r.request().url()),p=u.pathname;if(live){if(u.origin!==new URL(live).origin)return r.abort();if(p.endsWith('/cloud-config.js'))return r.fulfill({contentType:'text/javascript',body:'window.PROFEFLOW_CLOUD={requireLogin:false}'});return r.continue();}if(u.hostname!=='fixture.invalid')return r.abort();if(p==='/cloud-config.js')return r.fulfill({contentType:'text/javascript',body:'window.PROFEFLOW_CLOUD={requireLogin:false}'});if(p==='/')return r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8').replace('<head>','<head><script>localStorage.setItem("aula-revision-v1",'+JSON.stringify(fs.readFileSync('tests/fixture.json','utf8'))+')</script>')});if(!/^\/[a-z0-9.-]+\.(js|css|svg)$/i.test(p))return r.abort();return r.fulfill({contentType:p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'image/svg+xml',body:fs.readFileSync('.'+p)});});

  await page.goto(live||'https://fixture.invalid/');await page.waitForSelector('#content .card');
  const before=await page.evaluate(()=>JSON.stringify(db));
  const views=['home','review','activities','emailQueue','grades','semesterConcentrate','attendance','examGroups','justifications','eligibility','participation','activityAttendance','planning','admin','manage','students','imports','courses','data'];
  for(const view of views){
   await page.evaluate(v=>navigate(v),view);await page.waitForTimeout(40);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow in '+view+' at '+viewport.width);
   if(view==='review'){assert(await page.locator('#saveReview').isVisible());assert(await page.locator('#nextStudent').isVisible());if(viewport.width===390)await page.screenshot({path:'tests/.tmp/visual-review-mobile.png',fullPage:true})}
   if(view==='grades')assert.equal(await page.locator('#bookTable table').evaluate(el=>getComputedStyle(el).display),'table');
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(db)),before,'Read-only navigation changed academic data');
  await page.evaluate(async()=>{await mutate(d=>saveComponentExams(d,group,period,ev().categories.find(c=>c.kind==='exam').id,{mode:'custom',gradeScale10:true,criteria:[{key:'theory',name:'Teoría',type:'theory',max:18,applicable:true,method:'points'},{key:'excel',name:'Excel',type:'practice',max:12,applicable:true,method:'checklist',criteria:[{id:'x1',name:'Identificación correcta',weight:10},{id:'x2',name:'Archivo completo',weight:2}]},{key:'ppt',name:'PowerPoint',type:'practice',max:20,applicable:true,method:'rubric',criteria:[{id:'p1',name:'Presentación',weight:20,levels:[{id:'best',label:'Excelente',ratio:1,description:'Presenta los elementos completos.'},{id:'good',label:'Satisfactorio',ratio:.8,description:'Presentación con detalles por mejorar.'},{id:'no',label:'Insuficiente',ratio:0,description:'No cumple los elementos solicitados.'}]}]}]},[]));navigate('physicalExams')});
  assert.equal(await page.locator('#examSectionsPanel').getAttribute('open'),null);assert((await page.locator('#examSectionsSummary').innerText()).includes('3 secciones · 50'));assert(await page.locator('#physicalTable').isVisible());assert.equal(await page.locator('#physicalTable [data-section-choice]').count(),0);
  await page.fill('[data-exam-component="theory"][data-for-student="u0"]','17');
  const open=key=>page.click('[data-exam-instrument="'+key+'"][data-section-scope="u0"]');
  const row=page.locator('#physicalTable tbody > tr').first(),height=await row.evaluate(el=>el.getBoundingClientRect().height);
  await open('excel');await page.selectOption('[data-section-choice="x1"]','1');await page.selectOption('[data-section-choice="x2"]','0');await page.click('#cancel');
  assert((await page.locator('#physicalResult-u0').innerText()).includes('5.4 / 10'));assert((await page.locator('#physicalResult-u0').innerText()).includes('Provisional'));assert((await page.locator('#physicalResult-u0').innerText()).includes('Sin guardar'));assert.equal(await page.evaluate(()=>db.exams.length),0);
  await page.reload();await page.waitForSelector('#physicalRecover');await page.click('#physicalRecover');assert((await page.locator('#physicalResult-u0').innerText()).includes('5.4 / 10'),await page.locator('#physicalResult-u0').innerText());await open('excel');assert.equal(await page.inputValue('[data-section-choice="x1"]'),'1');await page.click('#modalSave');
  await open('ppt');assert.equal(await row.evaluate(el=>el.getBoundingClientRect().height),height);await page.check('[data-section-choice="p1"][value="good"]');await page.keyboard.press('Escape');
  assert((await page.locator('#physicalResult-u0').innerText()).includes('8.6 / 10'));assert((await page.locator('#physicalResult-u0').innerText()).includes('Definitiva'));
  await open('ppt');assert(await page.isChecked('[data-section-choice="p1"][value="good"]'));assert(await page.locator('#modalSave').isVisible());assert(await page.locator('#closeModal').isVisible());
  if(viewport.width===390){assert(await page.locator('#modalContent .exam-rubric-scroll').evaluate(el=>el.scrollWidth>el.clientWidth));await page.screenshot({path:'tests/.tmp/visual-instrument-mobile.png'})}
  await page.click('#modalSave');if(!(await page.locator('#examSectionsPanel').evaluate(el=>el.open)))await page.click('#examSectionsPanel > summary');await page.fill('[data-criterion-name="0"]','Teoría escrita');await page.click('#examSectionsPanel > summary');await page.click('#examSectionsPanel > summary');assert.equal(await page.inputValue('[data-criterion-name="0"]'),'Teoría escrita');
  await page.click('#savePhysicalExams');await page.waitForFunction(()=>db.exams.length===1);assert.equal(await page.evaluate(()=>db.exams[0].score),86);assert.equal(await page.locator('#examSectionsPanel').getAttribute('open'),null);assert(!(await page.locator('#physicalResult-u0').innerText()).includes('Sin guardar'));
  await page.reload();await page.waitForSelector('#physicalTable');await open('ppt');assert(await page.isChecked('[data-section-choice="p1"][value="good"]'));await page.click('#modalSave');
  if(viewport.width===1280)await page.screenshot({path:'tests/.tmp/visual-exams-desktop.png'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await page.close();
 }
 await browser.close();console.log('PASS visual audit: 19 read-only views preserve data at 1440/1280/390; compact independent instrument dialogs, close/Escape/reopen drafts, fixed row height, live 5.4 provisional/8.6 definitive, saved configuration collapse and reload, horizontal book/matrices, no page overflow or console errors');
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1});
