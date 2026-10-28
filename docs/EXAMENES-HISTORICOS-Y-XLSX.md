# Exámenes por componentes, históricos y concentrado XLSX

Implementación local en `development/redesign`. Sin push, despliegue, consultas ni cambios en Supabase de producción. Se mantienen versión de respaldo 2, almacenamiento, autenticación y sincronización por documento existente.

## 1. Captura de exámenes — verificada

- Calificaciones → Exámenes físicos: Teórico, Práctico o Mixto. Máximos configurables por grupo/parcial/categoría; notas y observaciones por alumno.
- Resultado normalizado = suma de puntos obtenidos / suma de máximos aplicables × 100. La presentación respeta escala, decimales y redondeo de la materia. El porcentaje de examen se aplica una sola vez en `Aula.summary`.
- Cero es real, vacío es pendiente; componentes no aplicables conservan `obtained: null, max: null, applicable: false`. Un examen parcialmente capturado conserva los puntos y tiene `score: null`.
- Un botón guarda el grupo; deshabilita edición durante el envío y confirma persistencia tras terminar. Error conserva la captura. La protección existente de cambios sin guardar incluye modalidad, máximos, componentes y notas.
- Correcciones agregan versiones en `exams`, con `previousId`. Los registros antiguos con solo nota final siguen vigentes, visibles como «sin desglose»; no se inventan componentes. El libro abre esta misma captura para editar exámenes. Actividades siguen evaluándose en Revisión.
- Pruebas: 18 + 22 puntos, 34/40 = 85/100 = 8.5/10, teórico/práctico, cero, pendiente, no aplicable, historial, control de versión y guardado del grupo.

## 2. Importación histórica — verificada

Administración → Importaciones → Importar calificaciones anteriores.

1. Elegir materia, grupo, parcial y categorías vigentes.
2. Cargar Excel XLSX/XLSM. Opcional: otro libro Moodle de una sola hoja.
3. Revisar hojas detectadas (ACP1/2/3, P1/P2/EF, Moodle), escalas de origen y, si no están en la hoja, máximos del examen.
4. Preparar vista previa: actividades, nombres completos, matrículas, notas de ambas fuentes, nota actual y componentes originales.
5. Resolver diferencias, reemplazos y cambios de nombre. Para categorías múltiples, cada actividad nueva permite elegir categoría. Confirmar expresamente escala, categorías y pesos semestrales antes de importar.

Reglas:
- Matrícula numérica normalizada, acotada al grupo; correo numérico puede suplir matrícula vacía. Duplicados, matrícula/correo incompatibles y coincidencias ambiguas bloquean. No se crean ni reactivan alumnos.
- Nombres desde Moodle o alias CONFIG. Actividades nuevas con `criteria: []`, `total: 100`, peso relativo 1; pueden recibir criterios después sin cambiar las revisiones directas guardadas.
- Solo columnas P/T de actividades y teoría/práctica de exámenes. CAL, promedios, concentrados, totales del curso y ponderaciones del Excel no se toman como notas definitivas. Asistencias, notas de alumno, justificantes y turnos no se tocan.
- Un cero histórico es una revisión con cero, sin inferir «no entregó». Notas finales importadas quedan exentas de otra penalización de atraso; conserva retroalimentación y procedencia. Configuración vigente determina resultados.
- Decisiones por conflicto y control de revisión de vista previa. Aplicación atómica sobre copia; reimportaciones idénticas no crean actividades, revisiones, entregas ni versiones de examen adicionales.
- La referencia autorizada `Lista_LIM-5A.xlsm` se leyó sin modificarla. La fixture guardada reemplaza todas las matrículas, nombres, correos y retroalimentación por datos ficticios.
- Caso LIM: 8 actividades × 14 alumnos = 112 notas, 14 exámenes, 7 diferencias ACP/Moodle. Reimportación sin duplicados, corrección con historial y respaldo/reapertura comprobados.

## 3. Exportación completa — verificada

Calificaciones → Libro o Concentrado semestral → Concentrado completo XLSX.

- Filtro de semestre, materia y grupo, o todas las materias/grupos del semestre elegido.
- Hojas funcionales: P1, P2, EF; ACP1, ACP2, ACP3; CASISTENCIA; CONCENTRADO; CONFIG. Otros periodos, actividades, categorías y fechas generan columnas/hojas dinámicas. Si hay varios grupos, se agregan sufijos y nombres únicos válidos.
- Identificación, estatus, nombres completos de actividades y pesos, componentes y máximos del examen, categorías y aportaciones semestrales. Pendientes vacíos y ceros reales preservados.
- Encabezados grises, bordes finos, títulos con contexto y fecha de generación, anchos diferenciados, texto envuelto, filtros e inmovilización de identificación/encabezados. P verde, AI rojo y AJ amarillo.
- Es una instantánea calculada por ProfeFlow, no una hoja para volver a ponderar manualmente. Sin fórmulas, macros, VBA, vínculos externos ni hojas auxiliares de macros. Exportación segura Moodle permanece separada y sin cambios.
- Se reutiliza `xlsx`/`zip`; el formato ampliado es opcional por hoja, sin alterar los exportadores ordinarios.
- Verificación: importación independiente del XLSX con openpyxl, XML válido, separación de 17/18 y 17/22, nota 8.5/10, 70/30 y 25/25/50; esquema alternativo 60/40 y 10/20/70 da 7.82/10 en el caso sintético. Descarga no modifica datos.
- Previsualizaciones de P1, ACP1 y CONCENTRADO renderizadas e inspeccionadas. No se abrió Microsoft Excel ni se probó contra cuentas reales.

## Validación local

`node tests/run.cjs`: 24 suites, con casos nuevos de componentes, históricos y exportación, más regresiones de navegación, Moodle, asistencia, justificantes, respaldos, autenticación y sincronización entre dos dispositivos simulados.

`node tests/release-check.cjs`: recursos completos; SQL, SDK y configuración de producción intactos. Los archivos generados y las imágenes de prueba están en `tests/.tmp`, excluidos de Git.
