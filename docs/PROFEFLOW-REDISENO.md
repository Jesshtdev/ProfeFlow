# Rediseño local de ProfeFlow

## Alcance e invariantes
Autorizadas las 5 fases, secuenciales. Rama `development/redesign`; sin push, despliegue ni acceso a Supabase de producción. Base: aplicación validada hasta c804fda (copiada localmente). Sin framework ni dependencias nuevas. Cada acción conserva una implementación; navegación no escribe datos. Historial, notas originales/finales, fotografías, respaldos, RLS y sincronización se conservan. Los pendientes no se convierten en ceros. Nuevos campos opcionales y migración no destructiva. Pruebas con seis alumnos ficticios, almacenamiento en memoria y red simulada.

## Fases y comprobaciones
1. Navegación en seis áreas; accesibles todos los módulos anteriores; verificar rutas y datos inmutables.
2. Calendario confirmado por semestre y horario independiente; PNG y copia no destructiva; probar fechas y compatibilidad.
3. Revisión y exportación Moodle seleccionada/confirmada; probar IDs, escalas, ceros, pendientes y CSV.
4. Entregas Apps Script y catálogo; desduplicar y resolver ambigüedades; aceptación manual y atraso una vez.
5. Captura física y concentrado; integrar asistencia/justificantes y revisar compatibilidad integral.

## Registro
- Base local guardada en 7057d9f. No se ha contactado producción.
- Estado actual: fases 1–5 completadas; revisión integral aprobada. Publicación pendiente de autorización.
- Fase 1 completada: seis áreas y subapartados; 15 rutas verificadas con fixture ficticio; JSON del aula idéntico antes/después de navegar. Cálculos intactos.
- Fase 2 completada: calendario confirmado y semanas/eventos; sugerencia manual de parcial; horario por semestre, copia sin sobrescritura y PNG local; imagen original integrada en respaldo/restauración y transferencia. Pruebas de fechas, límites, aislamiento y fotos correctas. No se han confirmado fechas reales.
- Fase 3 completada: exportación Moodle única con selección vacía por defecto, vista previa, confirmación y revisión de correspondencias reales. CSV UTF-8 y XLSX; ceros e IDs preservados; pendientes/excluidos bloqueados. Pruebas focalizadas correctas; no se implementó visor ni ZIP.
- Fase 4 completada: registro local de mensajes Apps Script (no bandeja/Gmail), coincidencias propuestas y resolución manual, deduplicación por ID con adjuntos, rechazo/excepción y regla congelada por entrega. Referencia nueva 0–2 días 100 %, 3–6 reducen 10 % diario, 7 inválida; reglas anteriores intactas. Pruebas correctas, sin cambios de asistencia oficial.
- Contrato Apps Script: importación exige ID del mensaje, Fecha, Correo, Matrícula, Grupo, Tarea, Adjunto, Estado y Observaciones. Estado externo solo informativo. Catálogo XLSX privado con hojas Alumnos (SemestreID, AlumnoID, Matricula, Correo, Nombre, GrupoID, Grupo, MateriaID, Materia) y Tareas (SemestreID, ActividadID, Codigo, Actividad, GrupoID, Grupo, MateriaID, Materia, ParcialID, FechaLimite). Apps Script debe leer estas hojas; su código no fue proporcionado ni se modifica un servicio externo. Sin objeto ALUMNOS generado por Python en ProfeFlow.
- Fase 5 completada: captura rápida por grupo/parcial/categoría con control de versión de cada nota, ceros reales y vacíos pendientes; concentrado semestral por grupo o todas las materias, exportación Excel y asistencia/justificantes al corte. Reutiliza summary/semesterSummary y la importación oficial existente; no infiere bajas por desaparición ni justifica asistencia al subir fotos. Pruebas de captura, historial y compatibilidad correctas.
- Revisión integral completada: navegador móvil/escritorio, respaldos y regresiones de autenticación/sincronización simuladas aprobados. Ninguna operación en servicios de producción.

## Revisión integral final
- Aprobadas 14 suites (`node tests/run.cjs`): fases 1–5, ponderaciones, importación Moodle mixta, UI/historial/respaldo, comparación de padrón, justificantes multifecha, asistencia, turnos, sincronización y autenticación simuladas. Reglas aceptadas congeladas por entrega; cambio de regla no recalcula notas históricas.
- Navegador local: 18 vistas, escritorio 1280×900 y móvil 390×844, sin errores JavaScript ni desbordamiento horizontal global. Probados edición de horario, calendario en borrador, importación de correo pendiente y descarga PNG original legible. Etiquetas de estado visibles en móvil. Captura física protege cambios sin guardar.
- Compatibilidad: V1/V2, fotos de justificantes y calendario con respaldo/restauración, revisión de notas directas tras añadir criterios, 70/30, 25/25/50, redondeo y pendientes; asistencia oficial intacta por justificante. SDK, esquema SQL y configuración de producción sin cambios.
- Límites de verificación: no se proporcionó el código de Apps Script ni una exportación real de su registro; se documentó y probó el contrato explícito, sin conectarse a Gmail. Confirmar fechas institucionales y correspondencias del archivo real antes de uso operativo. No se ha probado ni escrito contra producción.
- Preparación: un paquete estático para una sola publicación futura, sin fixtures ni registros reales. Revisión/autorizar publicación es el siguiente paso; no existe automatización de push/despliegue.

## Ajuste posterior: PowerCampus
- Eliminada la opción de sobrescribir correcciones manuales: las marcas reconocidas actualizan siempre alumno/fecha. Vacíos y desconocidos no borran registros.
- `students[].attendanceHistory` opcional conserva anterior/nuevo completos, origen y fecha ISO; registra también correcciones manuales. Reimportaciones idénticas no duplican cambios. Se preservan metadatos/observaciones del registro vigente.
- Aprobadas cuatro pruebas focalizadas: historial/reimportaciones/preservación, padrón (altas/desapariciones/reincorporaciones), reglas de asistencia y turnos. Notas, entregas, justificantes y controles de examen por turnos permanecen intactos; historial persiste en respaldo/reapertura.
- Solo rama local; sin cambios de SDK, configuración de nube, SQL ni servicios de producción.
