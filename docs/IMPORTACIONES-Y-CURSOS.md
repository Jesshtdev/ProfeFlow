# Importaciones y cursos independientes

- Administración → Importaciones abre PowerCampus, Moodle, Apps Script y padrón sin asistencias mediante los importadores existentes. En Moodle, elegir «solo actividades» nunca importa notas ni estados de entrega. Las notas existentes requieren la confirmación habitual de reemplazo y conservan historial.
- Administración → Cursos y talleres administra ediciones independientes. Crear una nueva edición copia solo la configuración: no participantes ni registros. El archivo de participantes admite Nombre, Referencia y Correo; los dos últimos son opcionales. Un homónimo requiere elegir una persona o confirmar un alta distinta.
- Dentro del curso: Participantes, Asistencias, Actividades y evaluación y Resumen. Las sesiones se generan hasta el total deseado sin repetir fecha/hora. Las observaciones y correcciones conservan valores anteriores. Un cambio de pestaña o curso advierte si la asistencia tiene cambios sin guardar.
- La evaluación puede ser numérica o solo cumplimiento. Los pesos son relativos, sin reglas universitarias; «excluido» no aporta peso, «no entregado» aporta cero, «pendiente» deja el resultado final sin cerrar. El mínimo de aprobación es opcional; la asistencia no impone mínimo.
- Una nota evaluada conserva la escala y el cotejo que se usaron. Añadir un cotejo después no recalcula las notas anteriores. Si se cambia la modalidad después de evaluar se pide crear otra edición.
- Excel exporta seis hojas: participantes, asistencias, actividades, evaluaciones, concentrado e historial. Los cursos archivados permanecen consultables y exportables.

## Persistencia y publicación

`independentCourses` e `importHistory` se guardan dentro del documento privado JSON existente de cada cuenta. No se crean tablas, funciones SQL, permisos ni dependencias. El RPC y las políticas de propietario permanecen sin cambios; el control de revisión evita guardar una copia obsoleta. Los cursos aparecen en respaldos y en la confirmación de primera transferencia aunque el aula no contenga alumnos universitarios.

La sincronización se verificó con servicios simulados y dos dispositivos, incluyendo conflictos y bloqueo de cambio de cuenta. No se consultaron ni modificaron registros de producción. No se requiere migración pendiente de Supabase con el esquema incluido en el repositorio.

Antes de publicar: exportar un respaldo completo, ejecutar `node tests/run.cjs` y `node tests/release-check.cjs`, revisar el commit e incluir ambos archivos nuevos `courses.js` e `import-center.js` junto al HTML con versiones de caché actualizadas. Desplegar una sola versión. Para revertir la interfaz, volver al commit anterior; las colecciones adicionales permanecen en el documento y el respaldo. No importar un respaldo anterior encima de datos nuevos sin revisarlo.
