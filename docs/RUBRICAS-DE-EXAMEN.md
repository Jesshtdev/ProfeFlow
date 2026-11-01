# Exámenes: secciones con puntos, rúbricas y cotejos

## Uso

En Calificaciones → Exámenes físicos, las evaluaciones nuevas abren directamente Secciones del examen con una sola sección libre. Cada fila permite cambiar nombre, máximo y método, agregar o eliminar secciones y configurar su propio instrumento. Los formatos Teórico, Práctico y Mixto anteriores se conservan; Configurar secciones del examen los convierte a filas editables con sus máximos originales. No se exige teoría ni práctica.

En cada fila pulsa Puntos / rúbrica / cotejo:

- Aciertos/puntos: captura el máximo y los puntos obtenidos.
- Rúbrica: usa el constructor existente de criterios, configura los niveles y sus puntos; la suma de máximos debe coincidir con el máximo de la sección.
- Lista de cotejo: usa el mismo constructor; cada criterio se marca Cumple o No cumple.

El editor permite copiar de actividades, plantillas u otras secciones. La copia es independiente. Los criterios y niveles se pueden editar antes de usar la sección. Después guarda la configuración/captura del examen con el botón existente; cualquier sustitución de notas guardadas necesita confirmación.

Para importar, selecciona DOCX o XLSX, elige tabla/hoja y pulsa Preparar vista previa editable. Revisa o corrige los criterios, puntos y niveles, confirma la importación y usa la sección. No se cambian calificaciones durante la importación. Se admiten tablas Criterio/Puntos y matrices con columnas de niveles y puntos numéricos por criterio; también DOCX con criterios y puntos por párrafo. Los documentos ambiguos o con puntos inválidos se rechazan, sin adivinar valores ni recurrir a ChatGPT.

En la captura individual o por equipos, despliega Rúbrica/Lista de cotejo y selecciona los niveles. Los subtotales se calculan y quedan de solo lectura. En equipos se evalúa el trabajo común una vez; las excepciones individuales usan exactamente los mismos controles y cálculo.

## Cálculo, compatibilidad e historial

- Ejemplo verificado: Teoría 12/18 + Excel 10/12 + PowerPoint 16/20 = 38/50 = 7.6/10.
- Las capturas nuevas usan base 10 con un decimal. Los porcentajes internos equivalentes alimentan el libro y concentrado existentes: no se cambian el esquema de ponderaciones ni los pesos de los parciales. El libro identifica las nuevas notas de examen con /10.
- No se recalculan notas antiguas al abrir, importar o editar una definición. La conversión nueva se aplica al guardar una evaluación nueva o confirmar una corrección. Se conservan pendientes, ceros reales y componentes no aplicables.
- Cada componente conserva su definición y selección de criterios/niveles en sectionEvaluation. Los resultados previos no dependen de una rúbrica que se edite posteriormente. Los máximos, puntos, nota y auditoría permanecen en el registro habitual de exámenes.
- Se reutilizan builderHTML/initBuilder, rubricRows/rubricTextRows, la escala de respuestas y Aula.rawScore de las actividades; no se crea otro catálogo ni otro almacenamiento de rúbricas. DOCX reutiliza el lector ZIP/XML local y XLSX el lector existente.
- Los proyectos por equipos reutilizan ExamProjects y TeamReviews. Se conservan notas previas por defecto y se exige confirmación/motivo para sustituirlas. Los ajustes de examen y el retraso expresamente habilitado se aplican una vez, conservando sus auditorías.
- Configuración, selecciones y versiones se guardan en el documento privado de la cuenta y participan en los respaldos y la sincronización existentes. No hay cambios SQL, credenciales ni operaciones directas sobre registros reales.

## Verificación

- `node tests/exam-sections.cjs`: ejemplo 7.6, solo teoría, solo práctica, rúbrica práctica sin teoría, exámenes mixtos, un decimal, escala de materia conservada, cero/pendiente, importación estructurada, copias independientes, protección de notas, snapshots, equipo con excepciones y persistencia.
- `node tests/browser-exam-sections.cjs`: escritorio y móvil, constructor nativo, cotejo pegado, archivo DOCX real con niveles editables y confirmación, XLSX editable/cancelación sin cambios, ejemplo completo individual/equipo, libro y recarga.
- `node tests/test-cloud.cjs`: configuración y selección de cotejo viajan entre dos dispositivos simulados.
- `node tests/run.cjs`, `node tests/browser-exam-projects.cjs`, `node tests/browser-team-reviews.cjs`: regresiones de captura, proyectos, equipos y aplicación general.
- La comprobación pública usa los archivos publicados en un navegador efímero con datos ficticios y la nube interceptada; no modifica datos académicos reales.

## Aclaración: pantalla de secciones dinámicas

- La estructura se organiza en la pantalla principal del examen. No se creó otro módulo ni una segunda colección de instrumentos.
- Guardar secciones (sin cambiar notas) utiliza el guardado existente de configuración con cero registros de notas; conserva las calificaciones y sus historiales, incluso al eliminar o renombrar secciones. La captura pendiente se descarta solo tras confirmación.
- Cada sección nueva tiene precisión completa de puntos. Se suman todos los subtotales y máximos antes de la conversión final a 0–10 con un decimal. Las actividades mantienen el comportamiento anterior de Aula.rawScore; la nueva opción sin redondeo solo la utilizan estas secciones.
- La precisión utilizada queda en la instantánea de cada rúbrica/cotejo. Las revisiones anteriores conservan su aritmética y no se recalculan al cargar o guardar la estructura.
- Prueba de precisión: 0.04999996 + 0.09999996 sobre 2 puntos da 0.7/10. Redondear previamente los subtotales a seis decimales daría incorrectamente 0.8/10; el nuevo cálculo conserva los puntos originales.
- `node tests/dynamic-exam-sections.cjs`: creación con una sección, agregar/renombrar/eliminar, métodos e instrumentos independientes, conversión de formato antiguo con máximos originales, guardado estructural sin recalificar, precisión e historial compatible y persistencia atómica.
- `node tests/browser-dynamic-exam-sections.cjs`: interfaz nativa en escritorio, tableta y móvil; varias prácticas sin teoría, reducción a una rúbrica, captura, recarga y conservación exacta de notas anteriores.

## Rúbrica descriptiva en matriz

- El importador admite Criterio y columnas de niveles con puntuaciones decimales dentro del texto, sin exigir Máximo/Puntos. Si no hay máximo, utiliza el mayor nivel de cada criterio. Conserva las tablas numéricas y los formatos anteriores.
- Cada nivel conserva la descripción completa original en `levels[].description`; criterio, máximo y celda (nombre, puntos, descripción) se editan en una matriz. Se reutiliza el constructor existente mediante una actualización de criterio por ID, sin otro catálogo ni otro motor de calificación.
- La calificación muestra la misma matriz con radios: un nivel por criterio, o ninguna selección para dejarlo pendiente. Las selecciones siguen usando los IDs existentes. El cotejo conserva sus controles y cálculo.
- Las matrices mantienen encabezados y filas en escritorio/móvil; sus contenedores permiten desplazamiento horizontal y se excluyen únicamente de la conversión visual de tablas a tarjetas.
- Verificado con el archivo proporcionado `P2 -TI_vA.docx`: tabla con ocho criterios, cuatro niveles y máximos 5,3,3,3,2,1,1,2 (total 20), incluidos 1.5, 0.75 y 0.25. Se comprobó el texto completo de las 32 celdas.
- `tests/exam-rubric-matrix.cjs` y `tests/browser-exam-rubric-matrix.cjs`: DOCX real y XLSX, edición/confirmación, copia independiente, pendiente/cambio de nivel, persistencia/recarga y conservación de la teoría de 30 aciertos y de notas anteriores. La huella SHA-256 del DOCX no cambia.
- `tests/fixtures/ti-p2-rubric-matrix.json` contiene solo la tabla de rúbrica, para repetir las regresiones sin distribuir el examen ni sus preguntas.
- Publicación autorizada posteriormente por la docente. Las verificaciones usan datos ficticios; no se escriben datos académicos de producción.
