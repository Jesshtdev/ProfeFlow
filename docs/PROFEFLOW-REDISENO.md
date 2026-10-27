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
- Fase 1: en curso.
- Fase 1 completada: seis áreas y subapartados; 15 rutas verificadas con fixture ficticio; JSON del aula idéntico antes/después de navegar. Cálculos intactos.
- Fase 2 completada: calendario confirmado y semanas/eventos; sugerencia manual de parcial; horario por semestre, copia sin sobrescritura y PNG local; imagen original integrada en respaldo/restauración y transferencia. Pruebas de fechas, límites, aislamiento y fotos correctas. No se han confirmado fechas reales.
- Fase 3 completada: exportación Moodle única con selección vacía por defecto, vista previa, confirmación y revisión de correspondencias reales. CSV UTF-8 y XLSX; ceros e IDs preservados; pendientes/excluidos bloqueados. Pruebas focalizadas correctas; no se implementó visor ni ZIP.
- Fase 4 completada: registro local de mensajes Apps Script (no bandeja/Gmail), coincidencias propuestas y resolución manual, deduplicación por ID con adjuntos, rechazo/excepción y regla congelada por entrega. Referencia nueva 0–2 días 100 %, 3–6 reducen 10 % diario, 7 inválida; reglas anteriores intactas. Pruebas correctas, sin cambios de asistencia oficial.
- Contrato Apps Script: importación exige ID del mensaje, Fecha, Correo, Matrícula, Grupo, Tarea, Adjunto, Estado y Observaciones. Estado externo solo informativo. Catálogo XLSX privado con hojas Alumnos (SemestreID, AlumnoID, Matricula, Correo, Nombre, GrupoID, Grupo, MateriaID, Materia) y Tareas (SemestreID, ActividadID, Codigo, Actividad, GrupoID, Grupo, MateriaID, Materia, ParcialID, FechaLimite). Apps Script debe leer estas hojas; su código no fue proporcionado ni se modifica un servicio externo. Sin objeto ALUMNOS generado por Python en ProfeFlow.
