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
