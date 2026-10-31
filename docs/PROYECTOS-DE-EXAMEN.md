# Proyectos de examen con el gestor compartido de equipos

## Uso

En Calificaciones → Exámenes físicos, selecciona el parcial y la categoría de examen y pulsa Configurar evaluación:

- Examen individual: conserva la captura anterior de teoría/práctica y criterios.
- Proyecto individual: usa esa misma captura, identificado como proyecto.
- Proyecto por equipos: permite organizar integrantes y calificar el trabajo una sola vez, con puntos distintos por integrante cuando se necesite.

El proyecto sustituye al examen de esa categoría y parcial. Su nota permanece en el componente de examen; no se crea una actividad ni se cambian las ponderaciones. Teoría y práctica forman una sola nota.

Crear, editar, eliminar, copiar e importar integrantes reutiliza TeamReviews y sus tres modales originales mediante un adaptador opcional. Se admiten equipos de cualquier tamaño, se señalan alumnos sin equipo y se rechazan duplicados/ajenos al grupo. Copiar permite elegir actividades u otros exámenes del mismo grupo. No hay vínculos posteriores entre las copias. Excel es opcional y conserva vista previa/confirmación.

Guarda los cambios de máximos o criterios antes de calificar un equipo. La revisión usa esos componentes guardados, muestra una vista previa y admite Puntos del equipo, Puntos individuales y Conservar. Las notas o ajustes anteriores se conservan por defecto; una sustitución requiere confirmación y motivo. Las observaciones nuevas se agregan y los registros anteriores permanecen.

## Persistencia y cálculos

- La configuración vive en `groups[].physicalExamConfigs[].assessment`, identificada por grupo, parcial y categoría. Contiene el mismo `teamConfig` del gestor existente y un historial de aplicaciones. Se conserva al editar componentes.
- Se reutiliza `saveComponentExams`: componentes/puntos originales y sus máximos, porcentaje global, redondeo, bonificaciones y penalizaciones del alumno. Los resultados individuales alimentan el libro, parcial y concentrado existentes.
- Se conserva la distinción entre pendiente, cero y componente no aplicable. Una excepción individual se captura con sus puntos por componente, sin transformar artificialmente el desglose del trabajo común.
- El retraso de tareas no se consulta. Está desactivado por defecto. Si la docente habilita expresamente una regla de proyecto, se exige fecha de entrega y se conserva una instantánea de fecha límite, fecha real y regla en cada nueva nota. Se descuenta una sola vez antes de los ajustes del examen, conservando los puntos originales. Las correcciones posteriores de ajustes reutilizan esa base; no descuentan otra vez.
- Cambiar tipo o regla no recalifica notas anteriores. Los exámenes antiguos sin metadatos conservan el comportamiento existente.
- La vista previa detecta cambios concurrentes y una escritura fallida conserva la captura para reintentar. No se repite una aplicación. Configuración, equipos e historial se incluyen en el documento privado, respaldo y sincronización existentes; no requieren SQL ni tablas nuevas.

## Comprobaciones

- `node tests/exam-projects.cjs`: reutilización del gestor, equipos independientes entre parciales, duplicados, copia, componentes, excepciones, ajustes e historial; 80 de actividades + 90 de proyecto = 83 con 70/30; pendientes/ceros/escala; retraso expresamente activado y aplicado una vez; guardado atómico, conflicto, respaldo y captura individual.
- `node tests/test-cloud.cjs`: configuración y nota del proyecto viajan entre dos dispositivos simulados, conservando las guardas de conflicto y cuenta.
- `node tests/browser-exam-projects.cjs`: escritorio y móvil; interfaz nativa, máximos, equipo manual, excepciones, confirmación de sustitución, recarga, copia de actividad, XLSX opcional y vuelta a captura individual.
- `node tests/team-reviews.cjs` y `node tests/browser-team-reviews.cjs`: regresión del módulo original por actividad.
- `node tests/run.cjs` y `node tests/release-check.cjs`: regresión integral y recursos/archivos protegidos.
- La versión pública se verifica con un navegador efímero y datos ficticios: nube desactivada por interceptación, sin modificar registros reales.
