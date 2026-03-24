export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "SocialClaw - Social Media Management via MCP",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "SocialClaw is an MCP server for managing and publishing content across Meta, TikTok, Pinterest, and Instagram from AI assistants.",
        },
        { property: "og:title", content: "SocialClaw - Social Media Management via MCP" },
        { property: "og:description", content: "Manage and publish content across Meta, TikTok, Pinterest, and Instagram programmatically from AI assistants." },
        { property: "og:type", content: "website" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },
})
