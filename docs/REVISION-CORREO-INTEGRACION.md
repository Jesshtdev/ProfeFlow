# Revisión y correos vinculados — 31/10/2026

Implementación exclusivamente local en `development/redesign`. Sin push, despliegue ni cambios en Supabase o datos publicados.

## Comportamiento

- Importar un mensaje institucional con alumno/actividad inequívocos conserva sus AlumnoID y ActividadID. La ficha muestra «Entrega por correo recibida — pendiente de validar», fecha real, vencimiento del catálogo, retraso y máximo informativo existente en America/Mexico_City. Importar o mostrar ese aviso no crea una entrega académica ni calificación.
- Los mensajes ya importados se reconcilian al consultar la ficha, sin reimportación, duplicados, eliminación de historial ni escrituras académicas. La consulta selecciona siempre el par de IDs persistentes; los nombres/grupos por sí solos no identifican al alumno.
- La docente confirmó que el campo Tarea de Apps Script se extrae del asunto. Se usa ese contrato para los registros antiguos. Se admite además una columna opcional Asunto/Subject; cuando existe, incluso si está vacía, prevalece sobre Tarea. El CSV anterior de nueve columnas sigue funcionando y Apps Script no fue modificado.
- Se excluyen de la vinculación/aplicación a Revisión los correos personales, usuarios institucionales sin matrícula coincidente, asuntos vacíos, asuntos sin actividad reconocible y destinos ambiguos. Sus registros originales permanecen consultables en la bandeja, con el motivo, sin aceptación ni vinculación automática. Se evita confundir P1 con P10 o Práctica 1 con Práctica 10.
- Validar desde la bandeja o desde la ficha actualiza el mismo mensaje. Si no hay datos protegidos, prepara la entrega existente para evaluación manual, con fecha y regla de atraso registradas. No asigna ninguna nota.
- Con calificación (incluido cero), historial de revisión, estado final/Revisada, observaciones, excepción, ajustes del periodo u otro correo aplicado, validar solo asocia el mensaje: no sobrescribe esos datos. La ficha muestra la protección y la nota guardada cuando existe.
- «Preparar revisión con este correo» exige confirmación y abre únicamente un borrador nuevo: sin nota, firma ni criterios marcados, conservando las observaciones y excepciones manuales actuales. El registro anterior permanece intacto hasta que la docente evalúa y guarda; al hacerlo se agrega una nueva revisión histórica con referencia al mensaje, sin borrar la anterior.
- Varios mensajes para un mismo alumno/actividad se mantienen independientes y vinculados. La ficha permite consultar su historial de validación/aplicación, fechas, remitentes, adjuntos y observaciones del registro. No se sustituye silenciosamente un mensaje por otro; la reimportación deduplica por MessageID.

## Presentación y alcance

Cabecera compacta con progreso/alumno/nota; bloque de correos separado de la evaluación; etiquetas y fechas legibles; firma, observaciones, accesos y acciones alineados. La puntualidad del correo y la regla de la revisión actual se distinguen para evitar confundir una referencia informativa con una nota guardada. Adaptado a escritorio y móvil.

Cambios funcionales limitados a `email-deliveries.js` y `ui.js`. Presentación en `theme.css`, versiones de recursos en `index.html`, pruebas y este registro. No se modificó la lógica de asistencia, Moodle, cursos, exámenes ni autenticación.

Campos opcionales compatibles con respaldos/documentos actuales: subject, acceptedEmailRule y reviewApplication en el mensaje; referencia emailMessageId en el borrador/entrega/revisión. No requiere migración SQL. La persistencia reutiliza el guardado atómico existente.

## Pruebas

- `node tests/review-email-sync.cjs`: vínculo/aviso al importar, reconciliación antigua sin escrituras, duplicados y varios mensajes, zona horaria y retrasos, exclusiones, Asunto opcional, límites P1/P10, ambigüedad e inscripciones multigrupo, validación sin notas, conservación de cero/Revisada/notas/excepciones/ajustes, estados finales, confirmación del borrador, nueva revisión histórica con referencia y recarga durable.
- `node tests/run.cjs`: suite completa aislada aprobada, incluyendo revisión, firmas, importaciones, historial, asistencia, respaldos y sincronización simulada. Tras reforzar la protección de estados finales se repitieron las pruebas focalizadas de integración/bandeja/regla de correo.
- Chrome real con red interceptada y datos ficticios: escritorio 1440 px y móvil 390 px, sin desbordamiento. Bajo zona Pacific/Auckland se comprueba el máximo de CDMX, validación desde la ficha sin alterar firma/nota/observaciones y preparación explícita sin asignar calificación.
- `node tests/release-check.cjs`: recursos válidos, SDK/SQL/configuración de producción intactos.

Los fixtures de correo configuran explícitamente su dominio escolar ficticio; no se relajó la exclusión de correos personales para que pasaran las pruebas.
