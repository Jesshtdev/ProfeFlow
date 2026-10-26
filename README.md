# ProfeFlow

Gestión docente en español: actividades, listas de cotejo, calificaciones, asistencia, justificantes con fotos y horario personal.

La aplicación funciona como página estática. No necesita compilación: `index.html` es el punto de entrada. El cliente oficial de Supabase está incluido en `supabase-2.118.0.js` con versión fija y licencia.

## Cuenta privada y sincronización

1. Abre la aplicación: verás la pantalla **Inicia sesión** si no tienes una sesión vigente.
2. Usa tu cuenta existente o elige **Crear cuenta**; confirma el correo e inicia sesión.
3. Si la cuenta ya tiene un aula, se abre directamente. En una cuenta nueva se ofrece subir los datos locales de este navegador; también puedes importar un respaldo completo desde **Datos y respaldos** después de entrar.
4. En otro equipo, abre la misma aplicación e inicia sesión con la misma cuenta. Si ya hay datos remotos, se abren sin reemplazarlos por los del equipo nuevo.

Los guardados se envían al servidor antes de mostrarse como guardados. Los otros equipos consultan cambios cada 15 segundos cuando no hay edición pendiente ni formulario abierto. Una revisión antigua se rechaza mediante control de versión: no se mezclan automáticamente dos ediciones simultáneas. Ante un conflicto, conserva tus apuntes, usa **Mi cuenta · Nube → Actualizar desde la nube** y vuelve a aplicar el cambio.

El modo nube necesita internet para guardar. No hay cola de ediciones sin conexión. El botón **Cerrar sesión**, arriba, vuelve a la pantalla de acceso sin borrar el aula de la cuenta. En la versión local descargada se conserva el acceso a su aula local. Sigue exportando respaldos completos periódicamente.

## Datos y privacidad

Este repositorio contiene únicamente código y configuración pública. No contiene listas, respaldos, fotografías ni el horario personal del docente. El horario ya guardado se conserva en el respaldo o en la cuenta.

Supabase guarda un documento privado por usuario. Las políticas RLS exigen que el propietario coincida con la sesión autenticada. Las fotos originales viven en la tabla privada `profeflow_photos`, protegidas por la misma cuenta. Se usa la base de datos para evitar depender del servicio de archivos durante su incidencia de aprovisionamiento. Las fotos antiguas se conservan para que los respaldos históricos sigan funcionando; no se purgan automáticamente al borrar un registro.

`cloud-config.js` contiene solo la URL y la clave **publicable** del proyecto. Nunca agregues una clave `service_role`, contraseña de base de datos o token de GitHub.

## Despliegue

GitHub Pages puede servir directamente la raíz de este repositorio, rama `main`. `.nojekyll` evita procesado adicional. Configura la URL pública como Site URL en Supabase → Authentication → URL Configuration para que los correos de confirmación vuelvan al sitio.

Para otro proyecto Supabase, ejecuta `schema.sql` una sola vez en un proyecto nuevo y cambia `cloud-config.js`. Se necesitan Auth con correo y contraseña, tabla `profeflow_state`, función `profeflow_save` y tabla privada `profeflow_photos`.

## Uso en celular

La navegación está en **Menú**. El semestre y la búsqueda global, así como los filtros de cada pantalla, se despliegan al tocarlos. Las listas se presentan como tarjetas con etiquetas, los criterios de revisión en una columna y el horario por día. El libro de calificaciones conserva desplazamiento horizontal para comparar sus columnas. Formularios y ventanas se ajustan al alto disponible y los controles usan tamaños táctiles. No cambia los registros ni los cálculos.

## Exámenes por turnos

En **Exámenes por turnos**, elige la materia y el grupo. Puedes importar un Excel con columnas por turno (fecha arriba y nombres debajo), o una tabla con Turno, Nombre, ID y Fecha; también puedes generar una distribución equilibrada al azar. Sin ID, se exige una coincidencia única del nombre completo, aun si los apellidos vienen primero. Revisa las coincidencias antes de guardar. Las bajas e inactivos solo se incluyen si lo eliges expresamente y conservan su estado.

Cada turno permite editar fecha, hora y aula, buscar alumnos y marcar Presente, Falta o Justificada. El orden se conserva y la asistencia se guarda por separado: no cambia la asistencia diaria, las calificaciones ni el derecho a examen. Puedes exportar la lista a Excel y archivar o restaurar organizaciones. La cuenta y los respaldos incluyen estas listas.
