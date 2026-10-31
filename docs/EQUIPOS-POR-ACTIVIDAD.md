# Revisión nativa por equipos

## Uso

1. Al crear o editar una actividad, elige Individual o Por equipos y si basta una entrega o se requiere evidencia de cada integrante. También se configura desde Revisión → Revisar actividades → Configurar equipos.
2. Crea equipos con alumnos inscritos en ese grupo. Se permite cualquier cantidad positiva de integrantes. La vista señala alumnos sin equipo e integrantes que dejaron de estar inscritos; bloquea duplicados.
3. Puedes copiar equipos de otra actividad del mismo grupo. La copia es independiente. La importación opcional XLSX/CSV acepta Equipo y AlumnoID o Matrícula, una fila por integrante, con selección de hoja, vista previa y confirmación. Nunca asigna por nombre.
4. Revisa el trabajo por criterios o nota directa una vez. Después elige la evidencia, firma, nota final y observación de cada integrante. La vista previa muestra los cambios antes de aplicarlos.
5. Las revisiones previas se conservan por defecto. Para sustituirlas se requiere seleccionar la nueva evidencia, confirmar la sustitución e indicar motivo. Las observaciones nuevas se agregan sin borrar las anteriores.
6. Usa Ver fichas individuales para validar correos pendientes o hacer una revisión individual. Los correos solo sirven como evidencia del equipo después de su validación manual. No se clonan mensajes ni se validan automáticamente.

## Datos y reglas

- `activities[].teamConfig`: modalidad, requisito de evidencia, equipos, revisión e historial de cambios. `activities[].teamReviews`: instantáneas de cada aplicación y sus integrantes/resultados.
- Las notas se guardan mediante los registros individuales existentes; conservan referencia al equipo y la evaluación común. Libro, concentrado y exportaciones usan la misma fuente.
- La propuesta por correo es el menor valor entre la nota del trabajo y la nota por retraso existente (100/90/80/70/60/0). Es una nota final editable, sin segunda penalización. Se conservan fecha real, remitente y mensaje fuente. Un cero tardío queda Revisada.
- Una entrega por equipo permite usar el correo validado de un integrante para los demás. Con evidencia propia, cada correo debe corresponder al AlumnoID de la fila. La evidencia de plataforma se confirma manualmente en cada fila.
- Firma y observaciones admiten excepciones individuales. Se conserva la firma previa si no se modifica; el correo mantiene la calificación independiente de la firma.
- Sin entregar genera un estado sin nueva calificación; Conservar no modifica el registro individual. Los ceros reales siguen siendo notas.
- Un cambio de integrantes no altera notas ni revisiones anteriores. Eliminar equipos o cambiar a modalidad individual conserva historial. Duplicar actividades/materias conserva la modalidad pero inicia equipos vacíos y sin revisiones ajenas; la copia explícita de equipos permite reutilizarlos dentro del mismo grupo.
- Las guardas de vista previa y la revisión optimista existente evitan guardar sobre datos que cambiaron. Se realiza una sola escritura por equipo; un fallo conserva los cambios pendientes para reintentar. La captura advierte al cerrar sin guardar.
- Configuración, equipos, historial y notas forman parte del documento privado de la cuenta, sus respaldos y la sincronización existente. No requieren tablas nuevas, macros, ChatGPT ni Excel.

## Verificación

- `node tests/team-reviews.cjs`: gestión, tamaños libres, pertenencia, duplicados, copia independiente, importación, criterios, excepciones, protección/historial, correos propios/compartidos, retraso una vez, cero tardío, libro, respaldo/recarga, escritura fallida y reintento.
- `node tests/test-cloud.cjs`: equipos y notas viajan entre dos dispositivos simulados mediante el protocolo real de almacenamiento de la aplicación; conflictos y cuenta privada conservados.
- `node tests/browser-team-reviews.cjs`: Chrome, escritorio y móvil, configuración y creación manual, notas individuales, libro, recarga, lectura XLSX real con vista previa y confirmación, sustitución protegida; sin errores de consola ni desbordamiento global.
- `node tests/run.cjs`: suite integral aislada. `node tests/release-check.cjs`: recursos de publicación y archivos protegidos.
- La comprobación de la versión pública utiliza un contexto de navegador efímero con alumnos ficticios, configuración de nube interceptada y sin llamadas a servicios de datos. No modifica datos académicos de producción.
