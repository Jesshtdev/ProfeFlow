# Correos y parciales

- Periodos de recepción: rangos inclusivos por semestre, materia o grupo en America/Mexico_City, independientes del calendario oficial. Solo eventos de tipo parcial confirmados sirven como alternativa; las semanas de evaluación no se interpretan como periodos de recepción.
- Actividad inequívoca: manda su parcial real, también en entregas tardías. Sin actividad, fecha original y rango único proponen el parcial. Solapamientos, contradicciones o fecha inválida: Por clasificar. Guardar parcial sin validar permite una asignación manual sin notas ni aceptación.
- Los filtros de parcial, identificación, alumno, grupo, actividad y estado se combinan. Agrupar por parcial permite plegar bloques. Los rangos no reclasifican entregas históricas resueltas.
- El resumen muestra importables, requieren revisión y excluidos por parcial. El estado externo NO VÁLIDA no decide por sí solo: una posible entrega incompleta o tardía permanece para revisión. Consultas, justificantes, salientes y mensajes explícitamente leídos se excluyen; Canva permanece como evidencia potencial.
- Duplicados por ID de Gmail; reenvíos con distinto ID permanecen independientes. Los estados y notas existentes nunca se sobrescriben al reimportar. El CSV anterior de nueve columnas sigue admitido: Tarea fue extraída del asunto. Las columnas nuevas conservan el asunto completo y los datos de auditoría.

## Apps Script

Archivo actualizado: `apps-script/profeflow-mail.gs`, basado en el código proporcionado por la docente. Copiar su contenido al proyecto vinculado al mismo Google Sheets y guardar. Ejecutar manualmente Preparar hoja para ProfeFlow y descargar esa hoja como CSV. No se han instalado disparadores ni se ha accedido al Gmail real durante las pruebas.

La exportación consulta los mensajes actuales, comprueba entrada/no leído por mensaje (no solo por hilo), descarta remitentes propios y consultas, conserva el asunto original, fecha real, enlaces, hilo y motivo. No marca mensajes como leídos ni no leídos. Las aprobaciones históricas del script se conservan, pero un mensaje sin asunto no se exporta como entrega identificada. La clasificación y validación definitivas se realizan en ProfeFlow.

Pruebas con servicios simulados y datos ficticios: rangos por ámbito, medianoche local, solapamientos, P1 tardío durante P2, manual sin validar, Canva, consultas, reimportación, reenvíos, originales con separador |, resumen y filtros, recarga y conservación de notas.
