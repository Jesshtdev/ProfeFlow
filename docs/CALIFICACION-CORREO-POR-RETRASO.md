# Calificación por correo según retraso — 31/10/2026

Estado: corregido y verificado exclusivamente en local, rama `development/redesign`. Sin push, despliegue, cambios de Supabase ni escrituras sobre datos reales publicados.

## Regla vigente

Al validar **y aplicar** una entrega institucional identificada, se registra una revisión con calificación real sobre 100: días 0–2 = 100; 3 = 90; 4 = 80; 5 = 70; 6 = 60; 7 o más = 0. Se utiliza la fecha real del mensaje, convertida a America/Mexico_City, y el vencimiento del catálogo, comparando días calendario. Entregar antes del límite cuenta como cero días de retraso.

Caso de referencia reproducido con datos ficticios: límite 14/10/2026 y recepción 19/10/2026 → 5 días → **70/100 persistidos**. No se consultó ni modificó la cuenta real de la alumna mencionada.

## Corrección

- Antes solo se guardaba la recepción/regla y el formulario de firma podía volver a presentar 100. Ahora la aplicación crea una revisión con `rawScore = score = nota final` y conserva una captura de fecha, vencimiento, días y regla en `emailDeliveryGrade`.
- Esa revisión utiliza una regla local con multiplicador neutro porque su retraso ya se incluyó en la nota. No se desactiva ninguna regla global ni se modifica el motor de otras calificaciones. Esto evita 70 → 49 o 100 al recargar/guardar.
- La firma no se da por encontrada automáticamente. El formulario muestra la nota aplicada en el campo editable y conserva ese valor al marcar Sí. Las correcciones explícitas se guardan como nuevas revisiones históricas, sin descontar otra vez el retraso.
- Si existe una revisión, calificación manual, estado final, observaciones, ajustes u otro correo aplicado, sustituir la evaluación requiere una confirmación con la nota anterior y la nueva. También se puede validar y dejar el correo solo asociado, sin aplicar nota.
- Los correos aceptados con el comportamiento anterior pueden corregirse con **Aplicar calificación por entrega**, previa confirmación; no hay migración masiva ni recálculo automático de notas antiguas.
- Se mantienen observaciones, ajustes de examen y excepciones registradas, y todas las revisiones previas. La nueva nota sigue la regla de días indicada por la docente; las notas anteriores permanecen en su historial.
- Las etiquetas de nota guardada leen la revisión realmente persistida. La ficha, campo editable, lista y libro usan la misma revisión por AlumnoID/ActividadID.
- Fecha límite ausente/inválida, fecha real inválida, identidad no válida o falta de confirmación impiden asignar una nota automática. Cero por siete días es una nota real, no un pendiente.
- Reimportar o volver a aplicar el mismo resultado no duplica mensajes ni revisiones. Cambiar después las fechas/reglas solo modifica la propuesta de aplicación; una nota ya aplicada permanece intacta hasta una nueva acción confirmada.

## Archivos y compatibilidad

Lógica en `email-deliveries.js`, captura en `ui.js`, versiones de recursos en `index.html`, pruebas focalizadas y documentación. Sin cambios de `model.js`, CSV obligatorio, Apps Script, SQL ni configuración de producción. Los campos nuevos son opcionales y conservados por los respaldos/documentos actuales.

## Verificación

- `node tests/email-delivery-grades.cjs`: todos los límites 0–7+, ejemplo 14→19 = 70, medianoche de CDMX, firma/nota actual/campo/lista/libro coherentes, cero real, fechas inválidas, confirmación de sustitución, historial, rollback de persistencia, notas/ajustes/otra alumna intactos, corrección manual posterior, notas congeladas e idempotencia.
- Suites de correo e integración adaptadas a la nueva regla: importar sigue sin calificar; validar y aplicar sí registra la nota. El modo de solo asociación conserva la evaluación anterior.
- `node tests/run.cjs`: suite completa aislada aprobada (incluye firmas, asistencia, importaciones, exportaciones, respaldos y sincronización simulada).
- Chrome real, escritorio 1440 px y móvil 390 px, navegador en Pacific/Auckland: sustituir 100 exige confirmación, guarda 70, marcar firma Sí conserva 70, guardar notas conserva 70, recargar conserva 70 y el historial mantiene 100. Sin conexiones externas ni desbordamiento.
- `node tests/release-check.cjs`: recursos presentes y archivos protegidos de producción intactos.
