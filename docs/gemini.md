# Gemini AI (Video e Imagen)

## Variables de entorno

```env
GEMINI_API_KEY=tu-api-key
```

## Paso a paso

### 1. Obtener una API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en **Get API Key** > **Create API Key**.
4. Selecciona un proyecto de Google Cloud (o crea uno nuevo).
5. Copia la API key generada.

### 2. Configurar el archivo .env

```env
GEMINI_API_KEY=AIzaSyXXXXXXX
```

### 3. Requisitos adicionales

- **ffmpeg** debe estar instalado en el sistema para la optimización automática de videos grandes (>20MB).
  ```bash
  # macOS
  brew install ffmpeg

  # Ubuntu/Debian
  sudo apt install ffmpeg
  ```

## Herramientas disponibles

### describe_video
Analiza un video usando Gemini AI y devuelve una descripción detallada del contenido visual y de audio.

**Soporta:**
- URLs de YouTube (se envían directo a Gemini, sin descarga)
- URLs directas de video
- Archivos locales

**Opciones:**
- `video_url` (requerido) - URL del video o ruta local
- `prompt` (opcional) - Prompt personalizado para el análisis
- `auto_optimize` (opcional) - Comprime videos >20MB automáticamente (default: true)

### describe_image
Analiza una imagen usando Gemini AI y devuelve una descripción detallada.

**Soporta:**
- URLs de imágenes públicas
- Archivos locales

**Opciones:**
- `image_url` (requerido) - URL de la imagen o ruta local
- `prompt` (opcional) - Prompt personalizado para el análisis
