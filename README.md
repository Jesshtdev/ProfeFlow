# ProfeFlow

Gestión docente en español: actividades, listas de cotejo, calificaciones, asistencia, justificantes con fotos y horario personal.

La aplicación funciona como página estática. No necesita compilación: `index.html` es el punto de entrada. El cliente oficial de Supabase está incluido en `supabase-2.118.0.js` con versión fija y licencia.

## Cuenta privada y sincronización

1. Abre la aplicación y pulsa **Conectar mi cuenta**.
2. Crea tu cuenta, confirma el correo e inicia sesión.
3. En el equipo con tus registros, acepta subir el aula local completa. Si estás usando una URL nueva, primero importa tu respaldo completo desde **Datos y respaldos**: los datos del navegador no cambian de ubicación solos.
4. En otro equipo, abre la misma aplicación e inicia sesión con la misma cuenta. Si ya hay datos remotos, se abren sin reemplazarlos por los del equipo nuevo.

Los guardados se envían al servidor antes de mostrarse como guardados. Los otros equipos consultan cambios cada 15 segundos cuando no hay edición pendiente ni formulario abierto. Una revisión antigua se rechaza mediante control de versión: no se mezclan automáticamente dos ediciones simultáneas. Ante un conflicto, conserva tus apuntes, usa **Mi cuenta · Nube → Actualizar desde la nube** y vuelve a aplicar el cambio.

El modo nube necesita internet para guardar. No hay cola de ediciones sin conexión. Cerrar sesión vuelve al aula local conservada en ese navegador. Sigue exportando respaldos completos periódicamente.

## Datos y privacidad

Este repositorio contiene únicamente código y configuración pública. No contiene listas, respaldos, fotografías ni el horario personal del docente. El horario ya guardado se conserva en el respaldo o en la cuenta.

Supabase guarda un documento privado por usuario. Las políticas RLS exigen que el propietario coincida con la sesión autenticada. Las fotos originales viven en la tabla privada `profeflow_photos`, protegidas por la misma cuenta. Se usa la base de datos para evitar depender del servicio de archivos durante su incidencia de aprovisionamiento. Las fotos antiguas se conservan para que los respaldos históricos sigan funcionando; no se purgan automáticamente al borrar un registro.

`cloud-config.js` contiene solo la URL y la clave **publicable** del proyecto. Nunca agregues una clave `service_role`, contraseña de base de datos o token de GitHub.

## Despliegue

GitHub Pages puede servir directamente la raíz de este repositorio, rama `main`. `.nojekyll` evita procesado adicional. Configura la URL pública como Site URL en Supabase → Authentication → URL Configuration para que los correos de confirmación vuelvan al sitio.

Para otro proyecto Supabase, ejecuta `schema.sql` una sola vez en un proyecto nuevo y cambia `cloud-config.js`. Se necesitan Auth con correo y contraseña, tabla `profeflow_state`, función `profeflow_save` y tabla privada `profeflow_photos`.
