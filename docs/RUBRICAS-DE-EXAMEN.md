# Exámenes: secciones con puntos, rúbricas y cotejos

## Uso

En Calificaciones → Exámenes físicos se mantienen Teórico, Práctico y Mixto para captura por puntos. Para combinar secciones, elige Secciones / criterios. Puedes añadir o quitar secciones sin exigir teoría o práctica.

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
