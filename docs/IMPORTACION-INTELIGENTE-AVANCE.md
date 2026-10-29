# Importación inteligente — desarrollo local

Rama: development/redesign. Sin publicación ni acceso a producción. Referencias reales leídas únicamente en memoria; pruebas con alumnos ficticios.

Secuencia de trabajo:
1. Criterios configurables, cálculo auditado, ajustes y guardado seguro.
2. Modos de importación, selecciones parciales de Moodle y correspondencias históricas.
3. Exportación dinámica, pruebas con las nueve estructuras y revisión integral.

Inspección inicial: siete XLSM y dos XLSX. Máximos P1: CDI-1J 20/20; LEX-1A 20/25; demás 18/22. IADV/IDAS/LEX usan Criterio 1/2: no inferir tipos. CONFIG coloca alias en D/E/F en varias listas. LEX incluye nueve criterios prácticos y ajustes individuales. No usar CAL ni CONCENTRADO como notas de componentes.

- Aclaración posterior: en la plantilla conocida se sugiere Criterio 1 → Teoría, Criterio 2 → Práctica, confirmación obligatoria y máximos del archivo. Nuevas capturas usan Teoría/Práctica.
- Fase 1 comprobada: criterios personalizados, notas por criterio, redondeo opcional por tipo, incidencias previas al examen, cancelación con historial, guardado único y borrador por cuenta/contexto. Pruebas exam-components e intelligent-exams.
- Fase 2 comprobada: cuatro modalidades, selección de hojas/columnas, confirmación de criterios numerados, catálogo sin notas y asignación de parciales; nueve estructuras ficticias, desglose práctico LEX y cinco ajustes históricos. Reimportación sin duplicados. Conservadas las siete diferencias LIM del fixture anterior.

- Fase 3: XLSX con componentes dinámicos, máximos, observaciones, original/redondeada/bonificaciones/penalizaciones/final e incidencias. Descarga de un parcial o del semestre. Verificación independiente con openpyxl y render de encabezados/resultados; sin fórmulas, macros ni vínculos externos. Importación real en Chrome aislado verificada con archivos ficticios.

## Uso

- Administración → Importaciones → Calificaciones anteriores: elegir modalidad, semestre/materia/grupo/parcial, archivo y hojas. El desplegable de columnas permite ajustar encabezado, matrícula/correo y columnas seleccionadas. Pulsar **Actualizar columnas** si se cambia la fila o el identificador.
- Las actividades de Moodle se seleccionan en la vista previa y admiten un parcial distinto por actividad. Al cambiarlo se vuelven a mostrar las notas y conflictos de ese destino. Las columnas ausentes y las notas omitidas no se modifican. Catálogo no exige alumnos ni notas numéricas.
- Exámenes: confirmar las sugerencias de los encabezados numerados; revisar máximos, tipos y esquema vigente. Para LEX se puede elegir **Examen Practico** y el componente que sustituye. Si falta el desglose de una persona se conserva su puntaje agregado, identificado como tal; no se inventan criterios individuales.
- El ajuste histórico de LEX está en una columna F sin título: seleccionarla explícitamente en **Ajuste histórico independiente**. La escala se obtiene de «Base 10» o se confirma manualmente; no seleccionar CAL. Una nota final sin componentes se puede recuperar de forma explícita, sin volver a aplicar ajustes ya incluidos.
- Alumnos → ficha: **Registrar ajuste al examen**. Puntos positivos o negativos en la escala de la materia, motivo, fecha y destino obligatorios; correcciones/cancelaciones conservan historial. Mientras el examen esté pendiente no se genera una nota.
- Evaluación de la materia: activar separadamente el redondeo especial de exámenes y promedios de actividades. Primero se redondea la base y después se ajusta. No se reescriben exámenes confirmados al cambiar esta configuración ni al corregir solo una observación.
- Exámenes físicos: configuración Teórico/Práctico/Mixto o criterios personalizados con nombre, tipo, máximo y observación. **Guardar examen del grupo** realiza una sola escritura. Las filas sin cambios conservan su versión, incluso si tienen un desglose histórico diferente.
- El borrador se conserva en el mismo navegador, por cuenta/grupo/parcial/examen. Después de una recarga se ofrece **Recuperar captura local**; si hay notas más recientes se pide compararlas antes de confirmar correcciones. Es recuperación de captura, no un modo offline completo de la aplicación.

## Compatibilidad y publicación

- Campos opcionales en el documento versión 2: `students[].examAdjustments`, `exams[].audit`, criterios personalizados y `evaluation.specialRounding`. Sin nuevas dependencias ni migración SQL. Respaldo/migración y sincronización entre dos dispositivos simulados comprobados; autenticación, RLS, SDK y configuración de producción intactos.
- No se importan asistencias en este flujo. Asistencia oficial, turnos, cursos, justificantes, historiales previos y exportación segura Moodle conservan sus procesos.
- Cambios funcionales: `historical-grades.js`, `exam-components.js`, `academic-export.js`; integración acotada en `model.js`, `forms.js`, `ui.js`, `groups.js`, `theme.css` e invalidación de recursos en `index.html`.
- Fixtures de nueve estructuras generados por `tests/extract-list-structures.py`: matrículas y nombres ficticios, retroalimentación sustituida. Los libros reales permanecen fuera del repositorio.
- Antes de una futura publicación: revisar el diff y confirmar los esquemas reales de cada materia desde la interfaz. No se modificó ni publicó la versión en línea.

## Cierre de verificación

- 27 suites de `node tests/run.cjs` aprobadas. Repetidas las pruebas focalizadas de importación tras el ajuste final de normalización de guiones.
- Chrome aislado: carga XLSX, sugerencias Teoría/Práctica y máximos 18/22, confirmación y persistencia; catálogo Moodle sin alumnos/notas, sin eliminar actividades previas. Escritorio y móvil 390 px sin desbordamiento horizontal.
- XLSX abierto independientemente, resultados/estilos renderizados y auditados; `release-check` confirma SQL, SDK y configuración de producción intactos; `git diff --check` limpio.
- No push, despliegue, cambios de producción ni commits con datos de alumnos. Cambios disponibles en development/redesign.
