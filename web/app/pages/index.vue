<script setup lang="ts">
const GITHUB_LINK = 'https://github.com'

const platforms = [
  { name: 'Meta Ads', icon: '📊', description: 'Manage campaigns, ad sets, ads, budgets, targeting, and performance insights.' },
  { name: 'TikTok Ads', icon: '🎵', description: 'Control campaigns, ad groups, budgets, targeting, and pull performance reports.' },
  { name: 'Pinterest', icon: '📌', description: 'Create and manage pins, boards, upload images and videos, track analytics.' },
  { name: 'Instagram', icon: '📸', description: 'Fetch organic posts, view counts, video URLs, and manage linked accounts.' },
]

const features = [
  { number: '01', title: 'AI Image Generation', description: 'Generate images from text prompts using GPT Image model. Create ad creatives and pin visuals directly from your AI assistant.', accent: '#63B3ED' },
  { number: '02', title: 'Video Transcription', description: 'Transcribe videos with Whisper. Get timestamped chunks, batch process multiple videos in parallel.', accent: '#48BB78' },
  { number: '03', title: 'Batch Operations', description: 'Update statuses, budgets, and targeting for dozens of ads in a single API call. Save hours of manual work.', accent: '#ED8936' },
  { number: '04', title: 'Cross-Platform Analytics', description: 'Pull performance metrics across all platforms. Impressions, clicks, spend, conversions -- all from one interface.', accent: '#E53E3E' },
]

const isVisible = ref(false)
const visibleCards = ref<Set<number>>(new Set())
const visibleFeatures = ref<Set<number>>(new Set())

onMounted(() => {
  requestAnimationFrame(() => { isVisible.value = true })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-index'))
          const type = entry.target.getAttribute('data-type')
          if (type === 'platform') visibleCards.value.add(idx)
          else visibleFeatures.value.add(idx)
        }
      })
    },
    { threshold: 0.15 }
  )

  document.querySelectorAll('.observe-card').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div>
    <!-- ===== Navbar ===== -->
    <nav class="navbar">
      <div class="section-container navbar-inner">
        <a href="/" class="logo font-display">
          SocialClaw<span class="logo-dot">.</span>
        </a>
        <div class="nav-links">
          <a href="#platforms">Platforms</a>
          <a href="#features">Features</a>
          <a href="/privacy">Privacy</a>
          <a :href="GITHUB_LINK" class="btn-primary btn-sm">
            <span>Get Started</span>
          </a>
        </div>
      </div>
    </nav>

    <!-- ===== Hero ===== -->
    <section class="hero">
      <div class="hero-glow-1" />
      <div class="hero-glow-2" />
      <div class="hero-grid" />

      <div class="section-container hero-content">
        <div
          class="label-tag"
          :class="isVisible ? 'animate-fade-up' : 'hidden'"
        >
          <span class="pulse-dot" />
          Open source MCP server
        </div>

        <h1
          class="hero-title font-display"
          :class="isVisible ? 'animate-fade-up delay-1' : 'hidden'"
        >
          Manage social media<br>
          <span class="hero-accent">from your AI.</span>
        </h1>

        <p
          class="hero-subtitle"
          :class="isVisible ? 'animate-fade-up delay-2' : 'hidden'"
        >
          SocialClaw is an MCP server that lets AI assistants publish content,
          manage ads, and pull analytics across Meta, TikTok, Pinterest, and Instagram.
        </p>

        <div
          class="hero-ctas"
          :class="isVisible ? 'animate-fade-up delay-3' : 'hidden'"
        >
          <a :href="GITHUB_LINK" class="btn-primary">
            <span>Get Started</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </a>
          <a href="#platforms" class="btn-secondary">
            View Platforms
          </a>
        </div>

        <p
          class="hero-note font-mono"
          :class="isVisible ? 'animate-fade-up delay-4' : 'hidden'"
        >
          Works with Claude, ChatGPT, and any MCP-compatible client.
        </p>

        <!-- Stats -->
        <div
          class="hero-stats"
          :class="isVisible ? 'animate-fade-up delay-5' : 'hidden'"
        >
          <div class="stat">
            <div class="stat-value font-display">4</div>
            <div class="stat-label font-mono">Platforms</div>
          </div>
          <div class="stat">
            <div class="stat-value font-display">40+</div>
            <div class="stat-label font-mono">Tools</div>
          </div>
          <div class="stat">
            <div class="stat-value font-display">0</div>
            <div class="stat-label font-mono">Dependencies*</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Platforms ===== -->
    <section id="platforms" class="platforms-section">
      <div class="dot-pattern" />
      <div class="section-container platforms-content">
        <span class="label-tag">Integrations</span>
        <h2 class="section-title font-display">
          One server, <span class="accent-underline">every platform</span>
        </h2>
        <p class="section-subtitle">
          Connect your accounts and control everything from your AI assistant.
        </p>

        <div class="platforms-grid">
          <div
            v-for="(platform, index) in platforms"
            :key="platform.name"
            :data-index="index"
            data-type="platform"
            class="card observe-card"
            :class="visibleCards.has(index) ? 'animate-fade-up' : 'hidden'"
            :style="{ animationDelay: `${index * 120}ms` }"
          >
            <div class="card-icon">{{ platform.icon }}</div>
            <h3 class="card-title font-display">{{ platform.name }}</h3>
            <p class="card-desc">{{ platform.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Features ===== -->
    <section id="features" class="features-section">
      <div class="section-container features-content">
        <span class="label-tag">Capabilities</span>
        <h2 class="section-title font-display">
          More than just <span class="accent-underline">posting</span>
        </h2>
        <p class="section-subtitle">
          Built-in AI image generation, video transcription, batch operations, and analytics.
        </p>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            :data-index="index"
            data-type="feature"
            class="card observe-card feature-card"
            :class="visibleFeatures.has(index) ? 'animate-fade-up' : 'hidden'"
            :style="{ animationDelay: `${index * 120}ms` }"
          >
            <div class="feature-accent-line" :style="{ backgroundColor: feature.accent }" />
            <div class="feature-inner">
              <span class="font-mono feature-number" :style="{ color: feature.accent }">{{ feature.number }}</span>
              <div>
                <h3 class="card-title font-display">{{ feature.title }}</h3>
                <p class="card-desc">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-card">
          <div class="cta-glow-1" />
          <div class="cta-glow-2" />
          <div class="cta-inner">
            <h2 class="cta-title font-display">
              Ready to automate your<br>
              <span class="hero-accent">social media</span>?
            </h2>
            <p class="cta-subtitle">
              Install SocialClaw, connect your accounts, and start managing
              everything from your AI assistant.
            </p>
            <a :href="GITHUB_LINK" class="btn-primary">
              <span>Get Started</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
            <p class="cta-note font-mono">Free and open source.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Footer ===== -->
    <footer class="site-footer">
      <div class="section-container footer-inner">
        <div class="footer-top">
          <div>
            <a href="/" class="logo font-display">SocialClaw<span class="logo-dot">.</span></a>
            <p class="footer-tagline">Social media management via MCP.</p>
          </div>
          <div class="footer-links">
            <a href="#platforms">Platforms</a>
            <a href="#features">Features</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="font-mono">&copy; {{ new Date().getFullYear() }} SocialClaw. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hidden { opacity: 0; }

/* Delays */
.delay-1 { animation-delay: 100ms; }
.delay-2 { animation-delay: 200ms; }
.delay-3 { animation-delay: 300ms; }
.delay-4 { animation-delay: 400ms; }
.delay-5 { animation-delay: 500ms; }

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(8, 8, 10, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.5rem;
}
.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #F5F5F7;
  letter-spacing: -0.02em;
}
.logo-dot { color: #D4845A; }
.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: #7C7C8A;
  transition: color 0.3s;
}
.nav-links a:hover { color: #F5F5F7; }
.btn-sm {
  padding: 12px 28px !important;
  font-size: 0.875rem !important;
}

@media (max-width: 768px) {
  .nav-links a:not(.btn-primary) { display: none; }
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 6rem;
  padding-bottom: 3rem;
  overflow: hidden;
}
.hero-glow-1 {
  position: absolute;
  top: 0;
  right: 0;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  opacity: 0.12;
  filter: blur(150px);
  pointer-events: none;
  background: radial-gradient(circle, #D4845A 0%, transparent 70%);
  transform: translate(20%, -30%);
}
.hero-glow-2 {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(120px);
  pointer-events: none;
  background: radial-gradient(circle, #E8533A 0%, transparent 70%);
  transform: translate(-30%, 30%);
}
.hero-grid {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
  background-size: 80px 80px;
}
.hero-content {
  position: relative;
  z-index: 10;
}
.hero-title {
  font-size: clamp(2.8rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #F5F5F7;
  margin: 2rem 0;
}
.hero-accent { color: #D4845A; }
.hero-subtitle {
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  color: #7C7C8A;
  max-width: 38rem;
  line-height: 1.7;
  margin-bottom: 3rem;
  font-weight: 300;
}
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.hero-note {
  font-size: 0.8rem;
  color: #56565F;
}
.hero-stats {
  margin-top: 5rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.stat-value {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #F5F5F7;
  margin-bottom: 0.25rem;
}
.stat-label {
  font-size: 0.75rem;
  color: #56565F;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* Platforms */
.platforms-section {
  padding: 7rem 0;
  position: relative;
}
.dot-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px);
  background-size: 24px 24px;
}
.platforms-content { position: relative; z-index: 10; }
.section-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.15;
  color: #F5F5F7;
  margin: 1.25rem 0 1rem;
}
.section-subtitle {
  font-size: 1.1rem;
  color: #7C7C8A;
  line-height: 1.6;
  margin-bottom: 3.5rem;
}
.accent-underline {
  text-decoration: underline;
  text-decoration-color: #D4845A;
  text-decoration-thickness: 3px;
  text-underline-offset: 8px;
}
.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1.25rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F5F5F7;
  margin-bottom: 0.75rem;
}
.card-desc {
  color: #7C7C8A;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Features */
.features-section {
  padding: 7rem 0;
}
.features-content { position: relative; z-index: 10; }
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.feature-card {
  position: relative;
  overflow: hidden;
}
.feature-accent-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 0;
  border-radius: 4px;
  transition: height 0.7s ease;
}
.feature-card:hover .feature-accent-line {
  height: 100%;
}
.feature-inner {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}
.feature-number {
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

/* CTA */
.cta-section {
  padding: 7rem 0;
}
.cta-card {
  max-width: 60rem;
  margin: 0 auto;
  background: #131318;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  padding: clamp(3rem, 5vw, 5rem);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.cta-glow-1 {
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(100px);
  pointer-events: none;
  background: #D4845A;
  transform: translate(30%, -40%);
}
.cta-glow-2 {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(100px);
  pointer-events: none;
  background: #E8533A;
  transform: translate(-30%, 40%);
}
.cta-inner { position: relative; z-index: 10; }
.cta-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.15;
  color: #F5F5F7;
  margin-bottom: 1.5rem;
}
.cta-subtitle {
  font-size: 1.15rem;
  color: #7C7C8A;
  max-width: 32rem;
  margin: 0 auto 3rem;
  line-height: 1.7;
}
.cta-note {
  font-size: 0.8rem;
  color: #56565F;
  margin-top: 1.5rem;
}

/* Footer */
.site-footer {
  padding: 4rem 0 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.footer-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
}
.footer-tagline {
  font-size: 0.875rem;
  color: #56565F;
  margin-top: 0.5rem;
}
.footer-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.footer-links a {
  font-size: 0.875rem;
  color: #56565F;
  transition: color 0.3s;
}
.footer-links a:hover { color: #CDCDD4; }
.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.footer-bottom p {
  font-size: 0.75rem;
  color: #3A3A42;
}

@media (max-width: 640px) {
  .footer-top { flex-direction: column; }
  .hero-stats { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
}
</style>
