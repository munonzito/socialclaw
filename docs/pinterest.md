# Pinterest

## Variables de entorno

```env
PINTEREST_ACCESS_TOKEN=tu-token-de-acceso
PINTEREST_REFRESH_TOKEN=tu-refresh-token
PINTEREST_APP_ID=tu-app-id
PINTEREST_APP_SECRET=tu-app-secret
```

## Paso a paso

### 1. Crear una app en Pinterest

1. Ve a [Pinterest Developers](https://developers.pinterest.com/) e inicia sesión.
2. Navega a **My Apps** > **Create app**.
3. Completa el nombre y la descripción de tu app.
4. Acepta los términos y crea la app.

### 2. Obtener las credenciales de la app

1. En la página de tu app, encontrarás el **App ID** y el **App Secret**.
2. Copia ambos valores.

### 3. Obtener el Access Token

#### Flujo OAuth2

1. Redirige al usuario a:
   ```
   https://www.pinterest.com/oauth/?client_id=TU_APP_ID&redirect_uri=TU_REDIRECT_URI&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read
   ```
2. El usuario autoriza tu app y Pinterest redirige con un código.
3. Intercambia el código por tokens:
   ```bash
   curl -X POST https://api.pinterest.com/v5/oauth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=CODIGO&redirect_uri=TU_REDIRECT_URI" \
     -u "TU_APP_ID:TU_APP_SECRET"
   ```
4. Recibirás un `access_token` y un `refresh_token`.

> El access token expira. SocialClaw usa automáticamente el refresh token para renovarlo cuando es necesario.

### 4. Configurar el archivo .env

```env
PINTEREST_ACCESS_TOKEN=pina_xxxxx
PINTEREST_REFRESH_TOKEN=pinr_xxxxx
PINTEREST_APP_ID=14xxxxx
PINTEREST_APP_SECRET=abc123xxxxx
```

## Herramientas disponibles

- `pinterest_get_account` - Información de la cuenta
- `pinterest_list_boards` - Listar tableros
- `pinterest_create_board` - Crear tablero
- `pinterest_create_pin` - Crear pin (imagen o video)
- `pinterest_list_pins` - Listar pins
- `pinterest_get_pin` - Detalle de un pin
- `pinterest_update_pin` - Actualizar un pin
- `pinterest_delete_pin` - Eliminar un pin
- `pinterest_get_pin_analytics` - Analíticas de un pin
