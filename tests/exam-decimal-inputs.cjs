const {run,assert}=require('./helper.cjs');
(async()=>{await run('boot()');for(const [raw,expected] of [['0',0],['3.5',3.5],['.75',.75],['14.',14],['1e-7',1e-7]])assert.equal(run('examPointNumber('+JSON.stringify(raw)+')'),expected);for(const raw of ['0x10','12,5','abc','Infinity','  ','1.2.3'])assert.throws(()=>run('examPointNumber('+JSON.stringify(raw)+')'));
 for(const raw of ['0x10','abc'])assert.throws(()=>run('examMakeComponents("theory",18,12,'+JSON.stringify(raw)+',null)'));
 assert.equal(run('examComponentsResult("theory",examMakeComponents("theory",18,12,"",null)).score'),null);assert.equal(run('examComponentsResult("theory",examMakeComponents("theory",18,12,"0",null)).score'),0);assert.throws(()=>run('examComponentsResult("theory",examMakeComponents("theory",18,12,"18.1",null))'));
 console.log('PASS decimal grade validation: plain decimals/zero and legacy small numeric values, invalid text/hex/comma rejected, blank pending and unchanged section ranges');
})().catch(e=>{console.error(e);process.exitCode=1});
