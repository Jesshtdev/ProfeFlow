# Editar integrantes de Grupos

- «Editar integrantes» reutiliza las divisiones de `examPlans`. Mueve alumnos, incorpora no asignados o los deja Sin asignar; no cambia padrón, notas ni asistencia oficial.
- Requiere vista previa y confirmación. Si cambian las selecciones, debe generarse de nuevo. No permite editar con asistencia pendiente ni modificar organizaciones archivadas sin restaurarlas.
- Mover/retirar a un alumno con marca o historial requiere confirmación adicional. La aplicación original queda conservada en `examPlans[].membershipHistory[].changes[]`: AlumnoID, división/fecha/hora/aula originales y copia completa de su marca e historial. El destino comienza sin registro. Los integrantes sin cambios conservan sus marcas intactas.
- El historial es visible en Grupos y se conserva en respaldos/sincronización existentes. Se admiten divisiones temporalmente vacías; el filtro de Exámenes físicos lee los integrantes actuales y Sin asignar, sin incluir las copias históricas.
- Pruebas focalizadas: `exam-members.cjs`, `browser-exam-members.cjs`, regresión de asistencia por turnos, filtro de divisiones, interfaz y controles de publicación. Datos ficticios, escritorio/celular, vista previa/cancelación, errores de guardado, conflictos, duplicados, pertenencia al grupo, recarga y respaldo. Sin cambios en calificaciones ni reglas de cálculo.

## Lista agrupada

- El diálogo agrupa por división actual, con conteo y paneles nativos plegables. «Sin asignar» aparece al final solo cuando tiene alumnos. Cada grupo ordena nombres con `Intl.Collator('es')`, incluidos acentos y Ñ; la matrícula se muestra en una línea independiente.
- Los selectores permanecen en el mismo DOM al plegar/expandir: conservan cambios pendientes y confirmaciones. Ordenar es exclusivamente visual; no escribe asignaciones ni registros académicos.
- `exam-member-list.cjs` verifica agrupación, conteos, orden español, grupos vacíos y ausencia de escrituras; la regresión de navegador verifica selección/conteos visibles y plegado en escritorio y celular, manteniendo el flujo anterior.

## Corrección de Sin asignar

- Se omiten operaciones sin cambios antes de validar pertenencia, conservando los controles de duplicados, destinos y conflictos. Una operación real con ficha de otro grupo oficial informa nombre, matrícula, ID y grupo en conflicto.
- Los integrantes históricos incorporados al diálogo conservan su AlumnoID: se normaliza `member.studentId` como `id` y se usa la clave del mapa al presentar la lista. No se cambia ninguna matrícula ni se identifica por nombre.
- `exam-member-unassigned.cjs` y `browser-exam-member-unassigned.cjs` cubren varias retiradas simultáneas, movimientos mixtos, no asignados sin cambios, integrantes inactivos o antiguos, errores sin pérdida de selecciones, vista previa/guardado, respaldo y conservación de notas y asistencia original. Pruebas ficticias en escritorio/celular.
