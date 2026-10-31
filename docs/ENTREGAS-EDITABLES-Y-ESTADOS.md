# Correos: nota editable, observaciones y estados — 31/10/2026

Implementación y pruebas locales completas en `development/redesign`. La docente autorizó publicar al terminar. No requiere migración SQL ni cambios directos en Supabase.

## Captura y observaciones

- «Validar y aplicar entrega por correo» incluye **Calificación a aplicar / 100**, con nota sugerida por días calendario (100/90/80/70/60/0), editable entre 0 y 100. Una edición manual no modifica la fecha real del mensaje y no se reinicia al cambiar la opción de aplicar.
- Sin identificación inequívoca o fecha límite válida no se precarga una nota automática. Aplicar exige validar esos datos. Se mantienen las exclusiones de correos personales, asunto vacío y actividad no identificada en el asunto/Tarea.
- Guardar aplica la nota final elegida una sola vez. La firma se conserva como evidencia independiente: Sí/No no cambia la nota del correo ni elimina su valor editable. La evidencia previa de firma y su calificación de clase se conservan separadas de la nota de entrega.
- Reemplazar una calificación exige confirmación y motivo. La revisión nueva conserva referencia a la anterior, nota anterior, razón y registro del mensaje. Solo validar, sin aplicar, conserva notas y calificación actuales.
- Al aplicar se genera una observación con recepción real en CDMX, vencimiento, días de retraso, nota finalmente asignada y constancia de validación por correo. Un único texto predeterminado «Sin entregar en Moodle» se sustituye; comentarios personalizados se conservan completos.
- La observación se incorpora únicamente durante el guardado de validación/aplicación. Importar nunca escribe observaciones académicas. La metadata por MessageID permite actualizar el bloque de ese mensaje, sin duplicarlo; las versiones anteriores permanecen en el historial de revisiones.

## Estados sincronizados

Se reutilizan `email`, `reviewed` e `invalid`, sin crear estados paralelos persistentes:

- Un mensaje válido pendiente enlazado por AlumnoID/ActividadID proyecta **Entregada por correo — pendiente de validar** si la actividad sigue sin entrega.
- Si se valida sin aplicar, continúa como correo pendiente de aplicar y no altera la evaluación existente.
- Al aplicar una nota se guarda **Revisada**, incluso si la nota es 0 por retraso. El cero no se reclasifica como Sin entregar ni como No válida.
- Al rechazar, una actividad sin entrega se muestra **No válida**. Si hay otro correo válido pendiente, se mantiene pendiente; no se invalida una calificación o revisión ya guardada.
- La proyección se obtiene de los mensajes guardados y se reconstruye al recargar. No crea entregas académicas duplicadas ni modifica observaciones/ajustes durante la importación o consulta.
- Filtros de alumnos y libro reconocen correo pendiente/No válida. Revisada y Sin entregar distinguen correctamente el cero real del trabajo revisado.

## Alcance y pruebas

Cambios en `email-deliveries.js`, `ui.js`, extensión opcional de lectura/índice en `model.js`, versiones de recursos, pruebas y este registro. La extensión de estado no modifica cálculos de notas ajenas. Se conservan almacenamiento atómico, respaldos y sincronización del documento completo; no cambió el CSV obligatorio ni Apps Script.

- `node tests/email-editable-sync.cjs`: 70 sugerido → 65/55/63 elegidos, recepción inmutable, firma independiente, motivo/confirmación/historial, validación sin aplicar, números inválidos, comentarios predeterminados/personalizados, actualización por mensaje sin duplicados, ausencia de escrituras académicas al importar, estados/filtros/libro, rechazos, cero revisado, exclusiones y recarga.
- `node tests/run.cjs`: suite completa aislada aprobada; incluye importaciones, revisión, firmas, asistencia, exportación, respaldos y sincronización simulada.
- Chrome escritorio 1440 px y móvil 390 px, navegador Pacific/Auckland: nota editable, fecha CDMX fija, comentario generado, firma Sí/No conserva 65, guardado/recarga sin duplicar texto y estado Revisada. Sin desbordamientos ni llamadas a producción.
- `node tests/release-check.cjs` y `git diff --check`: aprobados. SDK, SQL y configuración de producción intactos.
