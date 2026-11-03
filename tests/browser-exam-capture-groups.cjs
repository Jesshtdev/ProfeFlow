const {createRequire}=require('module'),assert=require('assert'),fs=require('fs');
const load=createRequire('C:/Users/jessi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),live=process.env.PROFEFLOW_VERIFY_URL||'';let browser;
(async()=>{browser=await load('playwright').chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const viewport of [{width:1440,height:1000},{width:1280,height:900},{width:390,height:844},{width:320,height:740}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));let accept=true;page.on('dialog',d=>accept?d.accept():d.dismiss());
 await page.addInitScript(seed=>{if(!localStorage.getItem('keys-fixture')){localStorage.setItem('aula-revision-v1',seed);localStorage.setItem('keys-fixture','1')}},fs.readFileSync('tests/fixture.json','utf8'));
 await page.route('**/*',async r=>{const u=new URL(r.request().url()),p=u.pathname;if(u.origin!==(live?new URL(live).origin:'https://fixture.invalid'))return r.abort();if(p.endsWith('/cloud-config.js'))return r.fulfill({contentType:'text/javascript',body:'window.PROFEFLOW_CLOUD={requireLogin:false}'});if(live)return r.continue();if(p==='/')return r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')});if(!/^\/[a-z0-9.-]+\.(js|css|svg)$/i.test(p))return r.abort();return r.fulfill({contentType:p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'image/svg+xml',body:fs.readFileSync('.'+p)});});

 await page.goto(live||'https://fixture.invalid/');await page.waitForSelector('#content .card');
 await page.evaluate(async()=>{await mutate(d=>{
  const names=[['Érika','Álvarez','Zúñiga','30'],['Ana','Álvarez','Ávila','2'],['José','Zárate','López','10'],['Ángel','Bravo','Pérez','4']];
  names.forEach(([given,paternal,maternal,number],i)=>Object.assign(d.students.find(s=>s.id==='u'+i),{name:given+' '+paternal+' '+maternal,givenName:given,paternalSurname:paternal,maternalSurname:maternal,number}));
  const cid=ev().categories.find(c=>c.kind==='exam').id;
  saveComponentExams(d,group,period,cid,{mode:'mixed',theoryMax:18,practiceMax:12,gradeScale10:true},[{studentId:'u2',expectedId:'',theory:12,practice:8,notes:'Intacto'}]);
  saveExamVersions(d,group,period,cid,['A','B','A','B'].map((v,i)=>({studentId:'u'+i,expectedVersion:'',examVersion:v})));
  const source=examRandomDraft(group,2);source.slots[0].name='Grupo 1';source.slots[1].name='Grupo 2';source.rows=['u0','u1','u2','u3'].map((id,i)=>({studentId:id,slotKey:source.slots[i<2?0:1].key}));d.examPlans=[buildExamPlan(source,group,'Plan ficticio','random')];
 });navigate('physicalExams')});
 const before=await page.evaluate(()=>JSON.stringify(db)),peer=await page.evaluate(()=>JSON.stringify(db.exams.filter(e=>e.studentId!=='u0')));
 const visible=()=>page.locator('[data-exam-student-row]:visible').evaluateAll(es=>es.map(e=>e.dataset.examStudentRow));
 await page.selectOption('#physicalGrouping','division');assert.equal(await page.locator('[data-exam-group-heading]').count(),3);
 assert((await page.locator('[data-exam-group-heading]').last().innerText()).includes('Sin asignar · 2 alumnos'));
 const input=page.locator('[data-for-student="u0"][data-exam-component="theory"]');await input.fill('17');
 await page.selectOption('#physicalVersionOrder','surname');assert.equal(await page.locator('#modal').isVisible(),false);assert.deepEqual((await visible()).slice(0,2),['u1','u0']);
 const first=page.locator('.exam-group-toggle').first();await first.click();assert.equal(await first.getAttribute('aria-expanded'),'false');assert(!(await visible()).includes('u0'));assert.equal(await input.inputValue(),'17');
 await page.selectOption('#physicalVersionOrder','number');assert.equal(await input.inputValue(),'17');assert.equal(await first.getAttribute('aria-expanded'),'false');
 await page.click('#physicalCollapseAll');assert.deepEqual(await visible(),[]);assert.equal(await page.evaluate(()=>document.querySelectorAll('[data-exam-student-row]').length),6);
 assert.equal(await page.evaluate(()=>JSON.stringify(db)),before);
 await page.click('#savePhysicalExams');await page.waitForFunction(()=>document.querySelector('#physicalSaveState').textContent.includes('Grupo guardado'));
 assert.equal(await page.evaluate(()=>db.exams.at(-1).studentId),'u0');assert.equal(await page.evaluate(()=>db.exams.at(-1).score),null);assert.equal(await page.evaluate(()=>db.exams.at(-1).components[0].obtained),17);assert.equal(await page.evaluate(()=>JSON.stringify(db.exams.filter(e=>e.studentId!=='u0'))),peer);
 await page.click('#physicalExpandAll');assert.equal((await visible()).length,6);
 await page.selectOption('#physicalGrouping','version');assert.equal(await page.locator('[data-version-heading]').count(),3);assert((await page.locator('[data-version-heading]').last().innerText()).includes('Sin versión · 2 alumnos'));
 await page.locator('.exam-group-toggle').first().click();assert(!(await visible()).includes('u0'));assert((await visible()).includes('u1'));await page.click('#physicalExpandAll');
 await page.selectOption('#physicalVersionOrder','surname');assert.deepEqual((await visible()).slice(0,2),['u0','u2']);
 const slots=await page.evaluate(()=>db.examPlans[0].slots.map(s=>s.id));await page.selectOption('#physicalDivisionChoice',slots[0]);assert.deepEqual(await visible(),['u0','u1']);await page.selectOption('#physicalVersionChoice','B');assert.deepEqual(await visible(),['u1']);
 await page.selectOption('#physicalDivisionChoice','all');await page.selectOption('#physicalVersionChoice','all');await page.selectOption('#physicalGrouping','none');await page.selectOption('#physicalVersionOrder','number');assert.deepEqual((await visible()).filter(x=>['u0','u1','u2','u3'].includes(x)),['u1','u3','u2','u0']);
 await page.selectOption('#physicalVersionOrder','name');assert.deepEqual((await visible()).filter(x=>['u0','u1','u2','u3'].includes(x)),['u1','u3','u0','u2']);
 await page.reload();await page.waitForSelector('#content .card');await page.evaluate(()=>navigate('physicalExams'));assert.equal(await page.inputValue('[data-for-student="u0"][data-exam-component="theory"]'),'17');
 await page.selectOption('#physicalGrouping','division');assert(await page.locator('.exam-group-toggle').first().isVisible());if(viewport.width<=750){assert(await page.locator('#physicalTable table').evaluate(e=>e.classList.contains('mobile-records')));assert((await page.locator('.exam-group-toggle').first().boundingBox()).height>=44)}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await page.close();
}console.log('PASS exam grouping browser: independent division/version collapse and counts, unassigned/unversioned, expand/collapse all, structured Spanish sorting/ID, retained drafts, collapsed save/reload, untouched peers and combined filters; desktop/mobile');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
