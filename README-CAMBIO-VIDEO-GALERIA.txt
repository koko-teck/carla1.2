CAMBIO — VIDEO DENTRO DE LA GALERÍA
===================================

Se reemplazó el bloque independiente de presentación por un módulo de video dentro de la galería de transformaciones.

- El video usa el archivo existente: assets/presentacion-beauty-stylist.mp4
- Al finalizar el video se muestra automáticamente el logotipo existente: assets/beauty-stylist-logo-current.jpg
- El logotipo también funciona como estado final y el botón permite reproducir nuevamente el video.
- La proporción del video respeta el formato vertical original del MP4 (9:16), evitando estiramientos.
- En móvil el módulo mantiene su proporción y no depende de hover.
- NO se utilizó la captura enviada por el cliente como imagen del sitio.

Para cambiar el comportamiento del video, revisar:
- index.html → bloque .result-card-video
- script.js → bloque "Video integrado en Resultados"
- styles.css → bloque "VIDEO EN RESULTADOS — ajuste final solicitado"
