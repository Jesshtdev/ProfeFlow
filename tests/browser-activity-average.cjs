const {createRequire}=require('module'),assert=require('assert'),fs=require('fs');
const load=createRequire('C:/Users/jessi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),live=process.env.PROFEFLOW_VERIFY_URL||'';let browser;
(async()=>{browser=await load('playwright').chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));let accept=true;page.on('dialog',d=>accept?d.accept():d.dismiss());
 await page.addInitScript(seed=>{if(!localStorage.getItem('keys-fixture')){localStorage.setItem('aula-revision-v1',seed);localStorage.setItem('keys-fixture','1')}},fs.readFileSync('tests/fixture.json','utf8'));
 await page.route('**/*',async r=>{const u=new URL(r.request().url()),p=u.pathname;if(u.origin!==(live?new URL(live).origin:'https://fixture.invalid'))return r.abort();if(p.endsWith('/cloud-config.js'))return r.fulfill({contentType:'text/javascript',body:'window.PROFEFLOW_CLOUD={requireLogin:false}'});if(live)return r.continue();if(p==='/')return r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')});if(!/^\/[a-z0-9.-]+\.(js|css|svg)$/i.test(p))return r.abort();return r.fulfill({contentType:p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'image/svg+xml',body:fs.readFileSync('.'+p)});});





 await page.goto(live||'https://fixture.invalid/');await page.waitForSelector('#content .card');await page.evaluate(async()=>{await mutate(d=>{for(const [i,n]of [18.8,50,25,100,0].entries())Aula.saveReview(d,d.activities[0],d.students[i],{},'',{status:'reviewed'},n)});navigate('grades')});const before=await page.evaluate(()=>JSON.stringify(db));assert.deepEqual(await page.locator('.activity-average strong').allTextContents(),['1.9 / 10','5.0 / 10','2.5 / 10','10.0 / 10','0.0 / 10','0.0 / 10']);assert.equal(await page.locator('.activity-average small').first().innerText(),'18.8 / 100');assert.equal(await page.locator('.activity-average-pending').count(),1);assert((await page.locator('#bookTable thead').innerText()).includes('70 %'));assert(await page.locator('.gradebook').evaluate(el=>getComputedStyle(el).overflowX==='auto'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.evaluate(()=>JSON.stringify(db)),before);assert.deepEqual(errors,[]);await page.close();
}console.log('PASS activities display browser: primary base10 one decimal/secondary raw100, provisional separate, configured header, horizontal gradebook and no page overflow; desktop/mobile, fictitious data and cloud blocked');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
