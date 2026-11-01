# Auditoría visual · 31 octubre 2026

- Base conservada: `ef83c9a`, rúbricas DOCX/XLSX ya publicadas.
- Estilos compartidos: tamaños, espacios, tarjetas, formularios y acciones compactas, sin cambiar navegación ni libro horizontal.
- Exámenes: configuración plegable con resumen; minimizada al guardar. Instrumentos existentes en diálogo independiente; selecciones en el mismo borrador recuperable del examen. Cerrar conserva la captura; guardar el grupo confirma persistencia.
- Proyección visual: acumulado/máximo, base 10, Provisional/Definitiva, pendientes y Sin guardar. No se persiste la proyección incompleta ni cambia el cálculo oficial.
- Pruebas nuevas: `exam-capture-view.cjs`, `browser-visual-audit.cjs`. Regresiones de rúbricas adaptadas al diálogo y configuración plegable. Datos ficticios; servicios de nube bloqueados/simulados.
- Verificación: suite aislada completa, instrumentos individuales/equipos, importaciones DOCX/XLSX sintéticas, recarga y recuperación, fallo simulado al guardar, historial, cero/pendiente/no aplicable. Vistas principales a 1440/1280/390 px.
- Alcance protegido: sin cambios en modelos, importadores, asistencia, sincronización, rúbricas/calculadores o ponderaciones. Publicación solo después de las pruebas satisfactorias.
