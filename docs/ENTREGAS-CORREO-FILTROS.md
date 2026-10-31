# Entregas por correo: filtros y puntualidad informativa

Implementado y probado en local, rama `development/redesign`. La docente autorizó posteriormente el push conjunto de filtros/puntualidad y reemplazo. No se realizaron operaciones con Supabase ni se cambiaron datos académicos de producción.

## Cambios

- Filtros combinables por identificación inequívoca, alumno (inscripción concreta), grupo, actividad, estado y búsqueda. Estado inicial: alumno/actividad identificados y pendientes de validar. Permite consultar también coincidencias incompletas/ambiguas, aceptadas, por calificar, calificadas y rechazadas; restablecer recupera los valores iniciales.
- Las propuestas de mensajes ya importados se revisan contra el catálogo vigente al mostrar la bandeja. No se reimportan, duplican ni guardan esos cálculos. Los destinos aceptados manualmente siguen siendo autoritativos.
- Cada tarjeta muestra fecha límite, días calendario de retraso y porcentaje máximo informativo. Usa la fecha real del correo y el vencimiento del catálogo en America/Mexico_City. Fechas sin offset se interpretan como días/horas locales de México; fechas con offset se convierten explícitamente, sin depender de la zona del equipo.
- Regla informativa original: días 0–2 = 100 %, 3 = 90 %, 4 = 80 %, 5 = 70 %, 6 = 60 %, 7+ = 0 %. Una entrega anterior al vencimiento tiene cero días de retraso. Falta de actividad identificable, vencimiento válido o fecha válida del correo = «No calculable», sin cero artificial.
- Se mantienen la aceptación/rechazo manuales y la calificación desde Revisión. La referencia informativa no cambia la regla configurable de aceptación, sus snapshots, excepciones, notas ni ajustes guardados. No se cambió el esquema del CSV, el catálogo de Apps Script ni Apps Script.
- Presentación reutiliza filtros y tarjetas existentes, con distribución adaptable a móvil.

## Archivos

`email-deliveries.js`, `theme.css`, `index.html` (versiones de recursos), `tests/email-queue.cjs`, `tests/run.cjs` y este registro.

## Verificación aprobada

- `node tests/email-queue.cjs`: filtros combinados, búsqueda, estados, destinos ambiguos, coincidencias multigrupo, propuestas para mensajes existentes, fechas inválidas/ausentes, límites de 0–7+ días, medianoche/offsets, cambio histórico de horario y año bisiesto. Verifica ausencia de escrituras, conservación de notas, incidencias, snapshots y decisiones, y ninguna aceptación automática.
- `node tests/phase4.cjs`: importación sin duplicados, adjuntos, validación manual, excepciones y reglas históricas de calificación intactas.
- `node tests/identities.cjs`: conciliación de identidades y estructura del catálogo conservadas.
- `node tests/regression-ui.cjs`: navegación, revisión, guardado, importaciones y respaldos existentes.
- Chrome con datos ficticios y red interceptada desde archivos locales: escritorio 1400 px y móvil 390 px, sin desbordamiento; filtros/búsqueda funcionales y apertura de validación manual; America/Mexico_City correcto con navegador en Pacific/Auckland. Capturas de comprobación ignoradas en `tests/.tmp/`.
- `node tests/release-check.cjs`: recursos válidos y archivos protegidos de producción intactos.

## Reemplazar entregas importadas (31/10/2026)

- Opción desactivada por defecto dentro de la importación XLSX/CSV. La vista previa cuenta registros a eliminar, conservar, importar y omitir por ID de mensaje. Requiere una confirmación explícita con esos números antes de guardar.
- Solo elimina pendientes del semestre activo sin validación, historial, calificación o ajustes guardados. Se mantienen también registros en papelera, fechas verificadas y notas/excepciones/historial de entregas académicas. Los registros sin semestre inequívoco se conservan por precaución; los legados vinculados inequívocamente al semestre activo pueden reemplazarse.
- Calificaciones, incluido cero real y revisiones archivadas, y ajustes existentes protegen los mensajes asociados. La protección comprueba los IDs guardados y las identidades del catálogo, incluso históricas. Se conservan destinos ambiguos si cualquiera de sus posibles vinculaciones tiene datos protegidos.
- Después del filtrado se agregan los mensajes nuevos; los IDs ya conservados se omiten sin sobrescribir sus datos. El CSV no valida automáticamente ni crea calificaciones.
- Preparación y aplicación comprueban la revisión/semestre y recalculan la protección antes de reemplazar. La lista candidata completa se valida y se guarda mediante el mecanismo atómico existente. Un error de lectura, validación o persistencia no elimina la lista anterior. No hay pasos separados de borrado y guardado.
- Cambiar archivo, texto, hoja o modo invalida la vista previa y su confirmación; lecturas de archivos desactualizadas no sustituyen la selección más reciente.
- `tests/email-replacement.cjs`: reemplazo y modo agregar, conteos, confirmación, duplicados/adjuntos, semestres, registros legados, cero real, notas, ajustes, mensajes aceptados/rechazados, historial, revisiones archivadas, colisión de IDs, vista previa obsoleta, CSV inválido, fallo de almacenamiento y reintento/recarga.
- Comprobación Chrome en escritorio/móvil incluye cargar un CSV real con la opción marcada, confirmar el conteo y guardar conservando el estado pendiente.

Se reutiliza `email-deliveries.js`; no se modificó la lógica de otros módulos ni el esquema CSV/Apps Script.
