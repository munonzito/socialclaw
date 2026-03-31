# Transcripción de Video (Replicate)

## Variables de entorno

```env
REPLICATE_API_TOKEN=tu-api-token
```

## Paso a paso

### 1. Crear una cuenta en Replicate

1. Ve a [Replicate](https://replicate.com/) y crea una cuenta.
2. Puedes iniciar sesión con GitHub.

### 2. Obtener el API Token

1. Ve a [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).
2. Crea un nuevo token o copia el existente.

### 3. Configurar el archivo .env

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
```

> Replicate tiene un plan gratuito con uso limitado. Revisa los [precios](https://replicate.com/pricing) para uso en producción.

## Herramientas disponibles

### transcribe_video
Transcribe el audio de un video usando Whisper (vía Replicate).

**Opciones:**
- `video_url` (requerido) - URL pública del video
- `language` (opcional) - Código del idioma (ej: `english`, `spanish`). Auto-detecta si no se especifica.

### batch_transcribe_videos
Transcribe múltiples videos en paralelo (hasta 10 concurrentes).

**Opciones:**
- `video_urls` (requerido) - JSON array de objetos con URLs. Ej: `[{"url":"https://..."},{"url":"https://...","language":"spanish"}]`
- `language` (opcional) - Idioma por defecto para todos los videos.
