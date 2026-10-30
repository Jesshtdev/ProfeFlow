# Identidades y correos institucionales — revisión local (30/10/2026)

Estado: implementación y revisión terminadas en `development/redesign`. Sin push, despliegue, consultas/escrituras a Supabase ni reparación de datos reales publicados.

## Causa comprobada

La lógica de correo existía en la importación de asistencia oficial, pero el importador de padrón Lista/CASISTENCIA no mapeaba ni guardaba la columna de correo. Moodle conservaba otra identidad para las filas de calificaciones seleccionadas; el exportador tomaba ambos campos sin comprobar coherencia. Por tanto, cambiar solamente el formato de los IDs no recuperaba los datos perdidos.

La inspección local, de solo lectura, confirmó la estructura descrita: CDI-3J tiene 31 correos; los 58 de PowerCampus LEX-1A están entre los 69 de Moodle; el catálogo tiene 165 inscripciones, 108 correos y 57 vacíos (31 CDI-3J, 16 IDVA-1A y 10 IDAS-5A). No se copiaron nombres, matrículas ni correos reales a fixtures o al repositorio.

Fuentes locales revisadas: `AsistenciaDiaria_CDI-3J.xls`, `AsistenciaDiaria_LEX-1A.xls` y archivos equivalentes de la carpeta PWC, `2026_2S_UPOSLP_UPPLEXMSEE002_SL1A Calificaciones.xlsx` y `ProfeFlow-catalogo-AppsScript.xlsx`.

## Cambios

- `model.js`: clave institucional numérica independiente del formato visual; conserva las matrículas originales y los IDs persistentes.
- `imports.js`, `data.js`: mapeo y persistencia de correo en padrón; separa ID externo PowerCampus de matrícula; valida Moodle y bloquea conflictos antes de importar notas.
- `attendance.js`: coincidencia por correo/matrícula y grupo, detección de ambigüedades y confirmación de correos distintos en la importación oficial. Conserva sus reglas de altas, desapariciones, reincorporaciones e historial de asistencia.
- `identities.js`: conciliación independiente con vista previa, selección por fila y confirmaciones de vinculación, correo y matrícula; historial anterior/nuevo/origen/fecha. Escritura atómica, control de revisión e idempotencia. No importa asistencias ni cambia bajas, calificaciones, exámenes, actividades, justificantes o ajustes.
- `import-center.js`: acceso desde la tarjeta PowerCampus.
- `email-deliveries.js`: catálogo con correo coherente y validado, resumen de pendientes y confirmación si se descarga con correos vacíos. Mantiene hojas, columnas, orden y nombre del archivo de Apps Script; conserva inscripciones independientes entre grupos. Descarga sin escribir datos.
- `index.html`: carga del módulo y versiones de los recursos cambiados.
- Pruebas: nuevos `tests/identities.cjs` y `tests/browser-identities.cjs`; integración del módulo y ajuste de confirmaciones en los helpers/suites existentes.

Los campos nuevos de identidad son opcionales dentro del documento existente. Los respaldos y la sincronización conservan esos campos; no se requiere una migración SQL.

## Cómo reparar los datos locales

1. Administración → Importaciones → PowerCampus → **Conciliar correos institucionales**.
2. Elegir semestre, materia y grupo existentes; subir su lista PowerCampus. También se permite Moodle en modo solo identidad.
3. Comparar. Los correos recuperables se preseleccionan; los correctos y conflictos no se aplican automáticamente.
4. Revisar las diferencias y, cuando proceda, confirmar por separado la vinculación, cambio de correo y cambio de matrícula. Confirmar correcciones.
5. Repetir para los grupos pendientes. La operación no necesita volver a importar asistencia.
6. Exportar el catálogo Apps Script y revisar el resumen. Los correos sin evidencia válida quedan vacíos; nunca se construyen a partir de la matrícula.

La docente confirmó que IDVA-1A e IADV-1A son el mismo grupo. Elegir su destino existente evita duplicarlo por el nombre del archivo. La vista previa ofrece una casilla opcional para corregir **IDVA-1A → IADV-1A** conservando el mismo ID y referencias. No se renombra automáticamente; si ya existe otro IADV-1A en la materia se bloquea la corrección para revisión manual.

## Conflictos que requieren revisión

Correos diferentes, correo/matrícula incompatibles, duplicados dentro del grupo, destinos ambiguos y filas sin coincidencia no se fusionan automáticamente. Las coincidencias solo por nombre no se aceptan automáticamente. Una discrepancia matrícula/correo dentro del archivo Moodle debe corregirse en origen. Los 11 alumnos adicionales de Moodle LEX-1A no justifican altas o bajas automáticas mediante la conciliación.

No se aplicaron correcciones a la cuenta publicada ni se certifica su catálogo actual: la recuperación debe confirmarse en la interfaz local con las listas correspondientes.

## Verificación

- `node tests/run.cjs`: suite completa aprobada, con servicios simulados y sin llamadas de producción. Incluye asistencia oficial, historial, padrón, justificaciones, revisión, importación Moodle, exámenes, respaldos, sincronización simulada y acceso.
- `node tests/identities.cjs`: matrícula con ceros, ID externo diferente, Moodle de nueve dígitos, correo faltante/correcto/distinto, corrección de matrícula confirmada, duplicados, homónimos, inscripciones multigrupo, origen parcial 58/69, lote atómico, vista previa desactualizada, idempotencia, persistencia/recarga y compatibilidad de respaldos. Conserva registros académicos y observaciones existentes.
- Fixture sintético equivalente: 165 inscripciones, 108 correos/57 faltantes; recuperación de 31+16+10 → 165 correos sin duplicar inscripciones ni cambiar el esquema del catálogo.
- `node tests/browser-identities.cjs`: Chrome real con recursos interceptados desde archivos locales y todas las conexiones externas bloqueadas. Prueba XLS con tabla HTML, vista previa, confirmación, recarga con IndexedDB, corrección opcional del grupo, importación habitual de padrón y resumen del catálogo. No usa sesiones ni datos reales de la docente.
- `node tests/release-check.cjs`: aprobado; SDK, SQL y configuración de nube de producción intactos.
- `git diff --check`: sin errores.
