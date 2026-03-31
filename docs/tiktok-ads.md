# TikTok Ads

## Variables de entorno

```env
TIKTOK_ACCESS_TOKEN=tu-token-de-acceso
TIKTOK_ADVERTISER_ID=123456789
```

## Paso a paso

### 1. Crear una app en TikTok for Business

1. Ve a [TikTok for Business Developers](https://business-api.tiktok.com/portal/docs) e inicia sesión.
2. Navega a **My Apps** y haz clic en **Create App**.
3. Selecciona **Marketing API** como tipo de app.
4. Completa la información requerida y envía para revisión.

### 2. Obtener el Access Token

1. Una vez aprobada tu app, ve a la sección de **App Management**.
2. Genera un token de acceso de larga duración desde el panel.
3. Alternativamente, usa el flujo OAuth2:
   - Redirige al usuario a la URL de autorización de TikTok.
   - Intercambia el código de autorización por un access token.

> Los tokens de TikTok Marketing API tienen larga duración pero pueden requerir renovación periódica.

### 3. Obtener el Advertiser ID

1. Inicia sesión en [TikTok Ads Manager](https://ads.tiktok.com/).
2. El Advertiser ID aparece en la esquina superior derecha de la interfaz.
3. También puedes obtenerlo desde la API con el endpoint `advertiser/info`.

### 4. Configurar el archivo .env

```env
TIKTOK_ACCESS_TOKEN=abc123xxxxx
TIKTOK_ADVERTISER_ID=7123456789
```

## Herramientas disponibles

- `tiktok_get_advertiser_info` - Información de la cuenta
- `tiktok_get_campaigns` - Listar campañas
- `tiktok_get_adgroups` - Listar grupos de anuncios
- `tiktok_get_ads` - Listar anuncios
- `tiktok_get_report` - Reportes de rendimiento
- `tiktok_update_campaign_status` - Activar/desactivar campañas
- `tiktok_update_campaign_budget` - Actualizar presupuesto de campañas
- `tiktok_update_adgroup_status` - Activar/desactivar ad groups
- `tiktok_update_adgroup_budget` - Actualizar presupuesto de ad groups
- `tiktok_update_ad_status` - Activar/desactivar anuncios
- `tiktok_update_adgroup_targeting` - Actualizar targeting
