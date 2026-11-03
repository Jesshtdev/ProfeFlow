const {run,assert,$,document}=require('./helper.cjs');
(async()=>{await run('boot()');
 const compare=(a,b,order)=>{return run('examCaptureCompareStudents('+JSON.stringify(a)+','+JSON.stringify(b)+','+JSON.stringify(order)+')')};
 const a={id:'a',name:'Érika Álvarez Zúñiga',givenName:'Érika',paternalSurname:'Álvarez',maternalSurname:'Zúñiga',number:'30'},b={id:'b',name:'José Álvarez Ávila',givenName:'José',paternalSurname:'Álvarez',maternalSurname:'Ávila',number:'2'};
 assert(compare(a,b,'surname')>0);assert(compare(a,b,'name')<0);assert(compare(a,b,'number')>0);
 assert(compare({id:'a',name:'Ana Zárate',number:'1'},{id:'b',name:'José Álvarez',number:'2'},'surname')<0,'Full names are not split to guess surnames');
 assert(compare({id:'a',name:'X',moodleIdentity:{firstName:'Ana',lastName:'Álvarez'},number:'1'},{id:'b',name:'Y',moodleIdentity:{firstName:'Ana',lastName:'Bravo'},number:'2'},'surname')<0);
 console.log('PASS exam capture groups: Spanish structured sorting, safe full-name fallback, Moodle identity names');
})().catch(e=>{console.error(e);process.exitCode=1});
