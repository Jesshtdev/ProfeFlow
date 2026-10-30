const {run,$,assert,context}=require('./helper.cjs');
(async()=>{await run('boot()');context.pastedRubric=`Estructura completa — 10 puntos
Portada — 5 puntos
Introducción y conceptos — 15 puntos
Situaciones o riesgos — 10 puntos
Recomendaciones — 10 puntos
Ejemplo de aplicación — 10 puntos
Beneficios y conclusión — 10 puntos
Síntesis y jerarquía — 15 puntos
Presentación visual básica — 10 puntos
Entrega de archivos — 5 puntos`;
const before=run('JSON.stringify(db)');run('var parsed=rubricRows(rubricTextRows(pastedRubric))');assert.equal(run('parsed.length'),10);assert.equal(run('parsed.reduce((n,c)=>n+c.weight,0)'),100);assert.equal(run('parsed[0].name'),'Estructura completa');
for(const separator of ['—','–','-',':']){context.sample=`• Contenido, ejemplos ${separator} 3,5 puntos\n2. Presentación ${separator} 96,5 pts.`.replace(/\\n/g,'\n');assert.equal(run('rubricRows(rubricTextRows(sample)).reduce((n,c)=>n+c.weight,0)'),100)}
assert.equal(run('rubricRows(textRows("Criterio;Valor\\nContenido;60\\nPresentación;40")).length'),2);assert.equal(run('rubricRows(textRows("| Criterio | Valor |\\n| --- | --- |\\n| Contenido | 100 |")).length'),1);
assert.throws(()=>run('rubricRows(rubricTextRows("Portada — -5 puntos"))'),/inválido/);assert.throws(()=>run('rubricRows(rubricTextRows("Portada — 0 puntos"))'),/inválido/);
run('dialog("Cotejo",builderHTML([],100,[]),()=>{});var rubricBuilder=initBuilder([])');$('builderPaste').value=context.pastedRubric;$('builderParse').click();assert.equal(run('rubricBuilder.get().criteria.length'),10);assert.equal(run('rubricBuilder.get().total'),100);$('builderPaste').value='Criterio sin puntaje';$('builderParse').click();assert(!$('modalError').hidden);assert.equal(run('rubricBuilder.get().criteria.length'),10);assert.equal(run('JSON.stringify(db)'),before);
console.log('PASS pasted 10-criterion/100-point rubric, dash variants, bullets, commas, decimal weights, CSV/Markdown compatibility, invalid values preserve the builder and all stored records');
})().catch(e=>{console.error(e);process.exitCode=1});
