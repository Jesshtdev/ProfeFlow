# Divisiones en Exámenes físicos

- Reutiliza `examPlans`, sus turnos y AlumnoID; mantiene el examen del grupo oficial. Admite varias distribuciones, nombres originales, archivadas identificadas, Todos y Sin asignar.
- Filtro de pantalla en memoria: sin escritura de datos al cambiarlo. Las filas ocultas conservan sus valores. Captura pendiente exige guardar, descartar o cancelar; un fallo de guardado mantiene filtro y borrador.
- Guardado individual limitado a filas modificadas, evitando recalificar alumnos ocultos aunque se edite la configuración.
- Equipos: muestra los integrantes visibles; los de otras divisiones quedan en «Conservar sin cambios», excluidos de la aplicación. Usa el mismo motor y las excepciones existentes, sin nuevas notas ni equipos duplicados. La versión A/B del examen es independiente.
- Pruebas ficticias: `exam-division-filter.cjs`, `browser-exam-division-filter.cjs`, suite existente y regresiones visuales. Incluye varios planes, no asignados, sin distribución, teoría/práctica/mixto, cero/pendiente, rúbricas/proyección, historial y equipo entre divisiones. Sin cambios en asistencia, importadores, cálculos, respaldos o sincronización.
