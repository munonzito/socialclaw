# Generación de Imágenes (Azure OpenAI)

## Variables de entorno

```env
AZURE_OPENAI_API_KEY=tu-api-key
AZURE_OPENAI_ENDPOINT=https://tu-recurso.openai.azure.com
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-image-1.5
```

## Paso a paso

### 1. Crear un recurso de Azure OpenAI

1. Ve a [Azure Portal](https://portal.azure.com/).
2. Busca **Azure OpenAI** y haz clic en **Crear**.
3. Selecciona tu suscripción, grupo de recursos y región.
4. Asigna un nombre al recurso y selecciona el plan de precios.
5. Completa la creación.

### 2. Desplegar el modelo de generación de imágenes

1. Ve a [Azure AI Foundry](https://ai.azure.com/).
2. Selecciona tu recurso de Azure OpenAI.
3. Ve a **Deployments** > **Create deployment**.
4. Selecciona el modelo `gpt-image-1` (o la versión disponible).
5. Asigna un nombre al deployment (por defecto SocialClaw busca `gpt-image-1.5`).

### 3. Obtener las credenciales

1. En Azure Portal, ve a tu recurso de Azure OpenAI.
2. En **Keys and Endpoint**, copia:
   - Una de las dos API keys
   - El endpoint (formato: `https://tu-recurso.openai.azure.com`)

### 4. Configurar el archivo .env

```env
AZURE_OPENAI_API_KEY=abc123xxxxx
AZURE_OPENAI_ENDPOINT=https://mi-recurso.openai.azure.com
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-image-1.5
```

> `AZURE_OPENAI_IMAGE_DEPLOYMENT` es opcional. Si no se especifica, usa `gpt-image-1.5` por defecto.

## Herramientas disponibles

### generate_image
Genera imágenes a partir de prompts de texto.

**Opciones:**
- `prompt` (requerido) - Descripción de la imagen a generar
- `size` (opcional) - Tamaño: `1024x1024`, `1024x1536`, `1536x1024`
- `quality` (opcional) - Calidad: `low`, `medium`, `high`
- `n` (opcional) - Cantidad de imágenes (1-10)
- `output_format` (opcional) - Formato: `png`, `jpeg`, `webp`
- `background` (opcional) - `opaque` o `transparent` (solo png/webp)
- `output_directory` (opcional) - Directorio donde guardar las imágenes
