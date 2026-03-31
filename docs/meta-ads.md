# Meta Ads e Instagram

## Variables de entorno

```env
META_ACCESS_TOKEN=tu-token-de-acceso
META_AD_ACCOUNT_ID=act_123456789
```

## Paso a paso

### 1. Crear una app en Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com/) e inicia sesión.
2. Haz clic en **Mis Apps** > **Crear app**.
3. Selecciona el tipo **Empresa** (Business).
4. Asigna un nombre a tu app y vincula tu Business Manager (si tienes uno).

### 2. Obtener el Access Token

#### Opción A: Token de pruebas (corta duración)

1. En tu app, ve a **Herramientas** > **Explorador de la API Graph**.
2. Selecciona tu app en el desplegable.
3. Haz clic en **Generar token de acceso**.
4. Otorga los permisos: `ads_management`, `ads_read`, `pages_show_list`, `instagram_basic`.
5. Copia el token generado.

> Este token expira en ~1 hora. Útil solo para pruebas.

#### Opción B: Token de larga duración

1. Con el token de corta duración, haz una petición para intercambiarlo:
   ```
   GET https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=TU_APP_ID&client_secret=TU_APP_SECRET&fb_exchange_token=TOKEN_CORTO
   ```
2. El token devuelto dura ~60 días.

#### Opción C: Token de sistema (recomendado para producción)

1. Ve a tu [Business Manager](https://business.facebook.com/settings/).
2. Navega a **Configuración del negocio** > **Usuarios del sistema**.
3. Crea un usuario del sistema (o usa uno existente).
4. Haz clic en **Generar token** y selecciona tu app.
5. Asigna los permisos: `ads_management`, `ads_read`, `pages_show_list`, `instagram_basic`.
6. Copia el token. Este token no expira.

### 3. Obtener el Ad Account ID

1. Ve a [Business Manager](https://business.facebook.com/settings/) > **Cuentas** > **Cuentas publicitarias**.
2. Selecciona tu cuenta publicitaria.
3. El ID aparece en la URL o en los detalles de la cuenta. Tiene el formato `act_123456789`.

### 4. Configurar el archivo .env

```env
META_ACCESS_TOKEN=EAAxxxxxxx
META_AD_ACCOUNT_ID=act_123456789
```

## Herramientas disponibles

### Meta Ads
- `get_account_info` - Información de la cuenta publicitaria
- `get_campaigns` - Listar campañas
- `get_adsets` - Listar conjuntos de anuncios
- `get_ads` - Listar anuncios
- `get_insights` - Métricas de rendimiento
- `update_campaign_status` - Activar/pausar campañas
- `update_campaign_budget` - Actualizar presupuesto de campañas
- `update_adset_budget` - Actualizar presupuesto de ad sets
- `update_adset_status` - Activar/pausar ad sets
- `update_ad_status` - Activar/pausar anuncios
- `update_adset_targeting` - Actualizar targeting
- `batch_update_ad_statuses` - Actualizar múltiples anuncios
- `batch_update_adset_statuses` - Actualizar múltiples ad sets
- `batch_request` - Peticiones batch a la API de Meta

### Instagram
- `get_instagram_posts` - Posts orgánicos de un perfil público
- `get_instagram_accounts` - Cuentas de Instagram vinculadas

> **Nota:** Instagram utiliza el mismo `META_ACCESS_TOKEN`. No requiere variables adicionales.
