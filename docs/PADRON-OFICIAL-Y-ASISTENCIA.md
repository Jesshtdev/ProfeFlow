# Grupos, decisiones de asistencia y padrón oficial

Bloques terminados y comprobados secuencialmente:

1. Edición/vista previa: se conserva la corrección de IDs históricos y operaciones sin cambios. Siguen funcionando movimientos mixtos, varias retiradas y reincorporaciones desde Sin asignar.
2. Asistencia de examen: Conservar por defecto; Eliminar general/individual exige decisión y confirmación explícitas. Movimientos y decisiones se validan y guardan juntos. La eliminación limpia también las copias preservadas del alumno en esa organización, evitando reapariciones; conserva únicamente el registro administrativo de eliminación. No toca PowerCampus, otras organizaciones ni notas.
3. Padrón: PowerCampus es la autoridad. Solo una lista declarada completa y sin errores detecta ausencias; genera incidencias pendientes y no bajas automáticas. La vista previa de importación permite confirmar por alumno o posponer a Asistencia → Revisar padrón oficial, con vista previa y confirmación propias. Se distingue la baja explícita de PowerCampus de la baja confirmada por desaparición. Se guarda última aparición, evidencia Moodle, fuente y auditoría de decisiones. Una reaparición necesita padrón completo y confirmación para reincorporar. Moodle y las listas antiguas no reactivan bajas ni sustituyen el padrón oficial.

Grupos muestra el estado vigente. Los antiguos `rosterNote` siguen disponibles solo en Historial de avisos al importar; no se convierten en estado actual. Las distribuciones históricas y sus asistencias permanecen consultables; el padrón activo y las distribuciones aleatorias excluyen bajas confirmadas.

Persistencia: campos opcionales en los alumnos y `examPlans` existentes. Sin migración SQL ni cambio de Supabase; respaldos y sincronización conservan los mismos documentos. No se modifican cálculos, rúbricas, ponderaciones ni concentrados.

Pruebas ficticias: suite existente más `exam-attendance-decisions.cjs`, `official-roster.cjs`, regresiones de edición y `browser-groups-official-roster.cjs` (escritorio/celular). Cubren decisiones generales/individuales, confirmaciones, copias históricas, registros oficiales/otras organizaciones intactos, lista parcial/inválida, baja por ambas fuentes, Moodle no autoritativo, reincorporación, estado vigente, filtro de Exámenes físicos y persistencia/recarga.
