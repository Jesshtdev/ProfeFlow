# Editar integrantes de Grupos

- «Editar integrantes» reutiliza las divisiones de `examPlans`. Mueve alumnos, incorpora no asignados o los deja Sin asignar; no cambia padrón, notas ni asistencia oficial.
- Requiere vista previa y confirmación. Si cambian las selecciones, debe generarse de nuevo. No permite editar con asistencia pendiente ni modificar organizaciones archivadas sin restaurarlas.
- Mover/retirar a un alumno con marca o historial requiere confirmación adicional. La aplicación original queda conservada en `examPlans[].membershipHistory[].changes[]`: AlumnoID, división/fecha/hora/aula originales y copia completa de su marca e historial. El destino comienza sin registro. Los integrantes sin cambios conservan sus marcas intactas.
- El historial es visible en Grupos y se conserva en respaldos/sincronización existentes. Se admiten divisiones temporalmente vacías; el filtro de Exámenes físicos lee los integrantes actuales y Sin asignar, sin incluir las copias históricas.
- Pruebas focalizadas: `exam-members.cjs`, `browser-exam-members.cjs`, regresión de asistencia por turnos, filtro de divisiones, interfaz y controles de publicación. Datos ficticios, escritorio/celular, vista previa/cancelación, errores de guardado, conflictos, duplicados, pertenencia al grupo, recarga y respaldo. Sin cambios en calificaciones ni reglas de cálculo.
