# SocialClaw

Servidor MCP (Model Context Protocol) para gestionar anuncios y contenido en redes sociales desde cualquier cliente MCP compatible.

## Plataformas soportadas

| Plataforma | Funcionalidades |
|---|---|
| **Meta Ads** | Campañas, ad sets, anuncios, insights, targeting |
| **Instagram** | Posts orgánicos, cuentas vinculadas |
| **TikTok Ads** | Campañas, ad groups, anuncios, reportes, targeting |
| **Pinterest** | Boards, pins, analíticas |
| **Gemini AI** | Descripción de videos e imágenes |
| **Generación de imágenes** | Generación con Azure OpenAI (GPT Image) |
| **Transcripción** | Transcripción de video con Whisper (Replicate) |

## Inicio rápido

```bash
npm install
npm run build
```

Crea un archivo `.env` en la raíz del proyecto con las variables de entorno necesarias para cada plataforma que quieras usar. Consulta las guías de configuración en la carpeta `docs/`.

## Guías de configuración

- [Meta Ads e Instagram](docs/meta-ads.md)
- [TikTok Ads](docs/tiktok-ads.md)
- [Pinterest](docs/pinterest.md)
- [Gemini AI (Video e Imagen)](docs/gemini.md)
- [Generación de Imágenes (Azure OpenAI)](docs/image-generation.md)
- [Transcripción de Video (Replicate)](docs/transcription.md)

## Uso con MCP

Agrega SocialClaw a la configuración de tu cliente MCP:

```json
{
  "mcpServers": {
    "socialclaw": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "tu-token",
        "META_AD_ACCOUNT_ID": "act_123456"
      }
    }
  }
}
```

Solo incluye las variables de entorno de las plataformas que necesites. Revisa cada guía para obtener los valores correspondientes.
