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

## Ajuste posterior: menú por carpetas
- Seis carpetas acordeón con icono, título, indicador, subopciones con sangría y opción activa; se conservan las 18 rutas sin cambiar lógica de vistas. Se reutiliza PF_AREAS y el cierre móvil existente.
- Preferencia de carpeta abierta/cerrada en localStorage; accesos rápidos revelan la carpeta correspondiente. Los botones de despliegue conservan su nodo/foco para no cerrar accidentalmente el menú móvil.
- Pruebas focalizadas de navegación, persistencia y datos inmutables aprobadas; revisión visual de escritorio/móvil sin desbordamiento. Archivos de ejecución: navigation.js, theme.css e index.html (versión de caché). Sin push ni despliegue.

## Ajuste visual: subopciones
- Solo CSS de subopciones: carpetas cerradas y abierta para la activa; encabezados y navegación intactos. Caché de theme actualizada.
- Verificados los 18 accesos, escritorio y móvil; pruebas folder-navigation y phase1 aprobadas, sin errores de consola. Trabajo local sin publicación.
- Ajuste visual adicional: iconos distintos por sección principal y menor sangría para mostrar etiquetas completas; comprobado en escritorio y móvil, sin cambios de rutas.
- Subopciones: 18 iconos según su función, manteniendo etiquetas, rutas y selección; prueba de navegación aprobada y comprobación visual local.
- Calendario institucional: precarga editable S2-2026/S1-2027 desde imagen, 29–30 octubre y 2 noviembre sin clase. Calendarios existentes se conservan y se completan sin duplicados. Tras confirmar se excluyen suspensiones/vacaciones de asistencia y rachas, sin borrar marcas. Pruebas de calendario y asistencia aprobadas; solo local.
- Vista mensual institucional: lunes a domingo, anterior/siguiente/Hoy, eventos por color, detalle del día al primer clic y resumen con puntos en móvil. Se preservan calendario, confirmación, horarios, marcas y minimización. Pruebas de meses/años/bisiesto y navegación sin mutaciones; revisión visual a 390 px sin desbordamiento.
- Calendario: precarga visible sin escrituras automáticas, combinación de eventos antiguos sin duplicarlos y claves estables para conservar ediciones. Formularios por evento (nombre/tipo/fechas/parcial) y configuración de semestre sin texto separado por comas. Columna Sem. desde el inicio; días inhábiles no reinician conteo. Verificados eventos, fechas invertidas, conservación de marcas y vista móvil sin desbordamiento. Publicación autorizada por la docente.

## Centro de importaciones y cursos independientes
- Cuatro accesos a importadores compartidos, modo Moodle solo catálogo y auditoría de padrón. Las notas, justificantes y exámenes por turnos siguen en sus colecciones.
- Cursos con ediciones, participantes, sesiones, observaciones e historiales, evaluaciones numéricas o cumplimiento, seis hojas Excel y acceso desde Inicio. Colección privada independiente y respaldo compatible sin SQL nuevo.
- Pruebas focalizadas de ambos módulos y sincronización simulada aprobadas; revisión visual en escritorio y 390 px. El mensaje posterior de la docente autoriza el despliegue tras revisión final.

## Corrección: guardado rápido en exámenes por turnos
- Marcas inmediatas agrupadas tras 300 ms, con un único guardado en curso y conservación de selecciones pendientes ante timeout. Reintento explícito recarga la revisión vigente antes de aplicar solo las marcas pendientes; no duplica el historial si el servidor ya confirmó el primer intento.
- Se bloquea salir con marcas pendientes; se conserva la separación de asistencia oficial y turnos. Pruebas: pulsaciones rápidas, timeout real, respuesta perdida tras commit, historial sin duplicados y revisión integral con fixtures.

## Asistencia: guardar al finalizar
- Exámenes por turnos: eliminados temporizadores; P/F/J/SR solo cambian el borrador y Guardar asistencia confirma todo en una operación. Barra visible con pendientes, reintento seguro y protección al salir.
- Asistencia oficial y cursos: conservan guardado final existente; controles compactos uniformes P/F/J/SR y botón explícito. Marcas oficiales continúan almacenándose como P/AI/AJ, sin mezclar turnos.
- Pruebas de las tres capturas verifican que marcar no escribe datos hasta guardar, más timeout, historial e importaciones.

## Exámenes, históricos y XLSX — solo local
- Fase 1 verificada: captura Teórico/Práctico/Mixto, componentes y máximos, cero/pendiente/N/A, guardado único y versiones compatibles.
- Fase 2 verificada: referencia LIM anonimizada, 8 actividades, 14 alumnos, 7 diferencias; decisiones explícitas, reimportación sin duplicados ni asistencia histórica.
- Fase 3 verificada: concentrado XLSX de nueve hojas funcionales, estilos de referencia y cálculos configurables; apertura independiente y previsualizaciones revisadas.
- Revisión integral: 24 suites; respaldo y sincronización simulados. Sin push, despliegue ni acceso a producción. Detalles y pruebas en docs/EXAMENES-HISTORICOS-Y-XLSX.md.

- Ajuste visual del encabezado de Cursos: metadatos compactos sin edición/descripción vacías ni salto forzado; pestañas y minimización conservadas. Verificado a 1440 y 390 px sin desbordamiento; prueba independent-courses y release-check aprobadas.

## Captura de exámenes: agrupación y orden (2026-11-02)
- Grupos plegables por división o versión, cantidades, expandir/minimizar todos y categorías sin asignar/sin versión. Solo estado visual en memoria: se conservan las mismas filas, borradores y guardado por alumno.
- Un único selector de orden ampliado a apellido estructurado, nombre y matrícula; orden español dentro de cada grupo. Sin inferir apellidos de nombres completos ni escribir preferencias en datos académicos.
- Pruebas focalizadas con fixtures: orden, plegado independiente, capturas pendientes, guardado de filas contraídas, recarga, filtros combinados, NP, instrumentos, equipos y notas ajenas preservadas; escritorio/móvil.

## Captura directa desde la tabla de exámenes (2026-11-02)
- Reutilizado el marcador y snapshot de evaluación directa para rúbricas y ambos cotejos; total explícito sin selecciones inventadas. Campos principales editables con rango 0–máximo; vacío pendiente y cero real.
- Confirmación al sustituir criterios, modalidad directa/detallada en el instrumento y conservación al abrir/cerrar. Guardado grupal, borradores, historial, notas, NP y versiones reutilizados sin cambios en ponderaciones o fórmulas.
- Pruebas focalizadas de modelo y navegador: decimales/rangos, sustitución/cancelación, recuperación de borradores, recarga, historial, observaciones, NP, filtros/grupos y alumnos ajenos intactos.

## Puntos de examen sin incremento accidental (2026-11-03)
- Campos de captura convertidos a texto con teclado decimal en tabla individual, equipo e instrumentos. Sin flechas, pasos por rueda ni pérdida de foco; Tab y escritura normales.
- Validación de sintaxis numérica y rangos existentes; vacío pendiente y cero real intactos. No se modifican fórmulas, notas, snapshots ni almacenamiento.
- Pruebas focalizadas: rueda con foco, flechas/Tab, rango/formato, criterios/directa, cambios de modalidad, borradores, guardado y recarga en escritorio/móvil; NP y captura detallada existentes preservados.

## Redondeo especial en exámenes base 10 (2026-11-03)
- Base de un decimal antes de aplicar la regla de la materia .9 → entero superior; ajustes posteriores, sin cambiar puntos ni ponderaciones. Auditoría conserva base, redondeada y estado de la regla aplicado para validar registros históricos independientemente de la configuración actual.
- Las notas guardadas no se recalculan al abrir la captura. Corrección opcional solo de auditorías coherentes, con vista previa, confirmación y control de cambios; se agrega una versión histórica sin reemplazar originales. Pendientes/NP excluidos.
- Pruebas: 14/72, 28/72, 42/72, 43/72, 8.9/10, ajustes antes/después, regla desactivada, provisionales, corrección histórica y recarga; libro/exportación leen la nota oficial sin volver a redondearla.

## Correos: filtro y parciales (2026-11-03)
- Filtro de importación con resumen por parcial, conservación de posibles entregas incompletas/Canva y exclusión de mensajes ajenos; fechas y asuntos originales conservados. Rangos por semestre/materia/grupo, prioridad de actividad, asignación manual sin validar y grupos plegables.
- Apps Script proporcionado adaptado y probado sin Gmail real: entrada/no leído por mensaje, salientes y consultas excluidos, auditoría ampliada y cero cambios de lectura. Instalación manual en Google Sheets documentada en ENTREGAS-CORREO-PARCIALES.md.
- Solo fuentes y datos sintéticos se publican; el CSV real se revisó sin importarlo ni copiarlo al repositorio.

## Revisión: ausencias, correo y guardado (2026-11-03)
- Los ceros de ausencia Moodle son resultados registrados; los correos detectados son metadatos y no reabren la evaluación. Filtros coherentes y avance dentro del filtro después del guardado confirmado; barra móvil con alumno, posición y estado.
- Firma no aplicable a trabajos sin entregar. Casilla de correo sin efectos académicos hasta confirmar evidencia, fecha y nota; autorización para sustituir evaluaciones protegidas, sin pérdida del cero original.
- Revisión rápida de ausencias independiente de firmas: selección, vista previa y confirmación, exclusión de correos pendientes/evaluaciones existentes, guardado atómico y sin duplicados. No cambia asistencia ni datos de Gmail.
- Pruebas aisladas y navegador con alumnos ficticios: conexión fallida/reintento, nota editada por retraso, protección de ceros y notas, recarga, filtros y celular.

## Guardado en nube: confirmación y tiempos de espera (2026-11-03)
- Autenticación 20 s, lectura inicial 45 s, guardado 60 s y comprobaciones ligeras 12 s. Sin límite único global; diagnóstico técnico por operación y fase sin contenido académico.
- Función aditiva profeflow_save_v2 y last_request_id: respuesta pequeña de revisión/fecha/identificador, misma concurrencia optimista y RLS, profeflow_save anterior intacta. Instalaciones nuevas: schema.sql y después cloud-save-v2.sql; clientes nuevos admiten la función anterior si v2 aún no existe.
- Ante resultado incierto se verifica el identificador y la revisión antes de reintentar; se conserva exactamente el documento/token original, sin repetir la mutación ni sus historiales. Si la captura cambió, Mi cuenta → Verificar / reintentar guardado pendiente confirma el intento anterior conservando la edición actual. Un conflicto requiere actualizar/conciliar; no se sobrescribe.
- La comprobación periódica descarga solo revision; descarga el aula únicamente cuando cambia. Estado visible no anuncia éxito tras un fallo. La revisión individual mantiene al alumno y su captura hasta confirmarse el guardado.
- Pruebas: documento ficticio >4.2 MB, SDK real en navegador con backend simulado (escritorio/celular), timeout antes/después del commit y pérdida de respuesta, reintento del mismo token, cero real, guardados consecutivos y conflicto. SQL de prueba con usuario ficticio y rollback: respuesta compacta, idempotencia, legado, aislamiento RLS y bloqueo anónimo (tests/cloud-save-v2.sql). No se alteraron registros académicos reales.

## Copiar configuración de examen entre parciales (2026-11-04)
- Acción junto a Configurar evaluación: elige otro parcial de la misma materia/grupo, verifica destino vacío y confirma copia de secciones, máximos e instrumentos; clave privada opcional, sin sobrescribir claves existentes.
- Solo después de persistir la copia se ofrece eliminar la configuración original, con otra confirmación. Se bloquea si hay notas, ajustes, versiones o aplicaciones; el historial de configuración original se conserva dentro de la copia y la clave original permanece intacta.
- Pruebas ficticias: instrumentos mixtos, destinos ocupados/claves protegidas, cambios de revisión, guardado fallido/reintento, eliminación opcional y recarga, sin modificar alumnos ni registros académicos.
