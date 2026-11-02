# Exámenes: NP y claves privadas

NP es una captura explícita por alumno. Genera cero definitivo en las secciones aplicables sin fabricar selecciones de rúbricas o cotejos. Solicita confirmación si existe captura y conserva una instantánea para recuperar los valores anteriores al desmarcarlo. El historial conserva ambas operaciones. No se distribuye a compañeros de equipo ni afecta alumnos ocultos por división. La captura completamente vacía continúa pendiente, sin un cero provisional.

«Claves de examen» abre una ventana de consulta no modal. Admite texto pegado y TXT, exige vista previa y conserva el original. Reconoce encabezados de versiones A/B y partes habituales; no renumera ni limita preguntas. Los formatos libres permanecen legibles y se pueden consultar íntegros. Los reemplazos conservan el texto anterior y detectan cambios concurrentes. Se guarda dentro del parcial en el documento privado de la cuenta, asociado al grupo y categoría de examen. No forma parte de los archivos estáticos publicados ni de los exportadores de calificaciones. Utiliza el almacenamiento y sincronización existentes, sin cambios de esquema. Los respaldos privados conservan esta información.

Pruebas con datos ficticios: `exam-np.cjs`, `browser-exam-np.cjs`, `exam-keys.cjs`, `browser-exam-keys.cjs`, suite aislada `tests/run.cjs` y comprobación de archivos protegidos `tests/release-check.cjs`. Los navegadores prueban 1440 y 390 px. Los verificadores publicados bloquean servicios externos y cargan exclusivamente fixtures locales.

«Proyectar clave» utiliza solo la clave guardada. Abre una vista de pantalla completa con selector de versión/sección y salida visible, sin alumnos, notas ni edición. No genera enlaces ni archivos públicos. Se cierra al cerrar sesión.
