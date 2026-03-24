<script setup lang="ts">
useHead({ title: 'Privacy Policy - SocialClaw' })
</script>

<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="section-container navbar-inner">
        <a href="/" class="logo font-display">
          SocialClaw<span class="logo-dot">.</span>
        </a>
        <div class="nav-links">
          <a href="/">Home</a>
        </div>
      </div>
    </nav>

    <!-- Privacy Content -->
    <section class="privacy-page">
      <div class="section-container">
        <div class="privacy-header">
          <span class="label-tag">Legal</span>
          <h1 class="privacy-title font-display">Privacy Policy</h1>
          <p class="privacy-date font-mono">Last updated: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>

        <div class="privacy-content">
          <div class="policy-section">
            <h2 class="font-display">1. Introduction</h2>
            <p>
              SocialClaw ("we", "our", or "us") is an open-source MCP (Model Context Protocol) server
              that enables AI assistants to manage social media content across platforms including
              Meta (Facebook/Instagram), TikTok, and Pinterest. This Privacy Policy explains how we
              handle information when you use our software.
            </p>
          </div>

          <div class="policy-section">
            <h2 class="font-display">2. Information We Collect</h2>
            <p>
              SocialClaw is a self-hosted tool that runs on your own infrastructure. We do not operate
              a centralized service and do not collect, store, or process any of your data on our servers.
            </p>
            <p>When you use SocialClaw, the following information is processed locally on your machine:</p>
            <ul>
              <li><strong>API Credentials:</strong> Access tokens and API keys for social media platforms (Meta, TikTok, Pinterest) that you configure in your local environment variables.</li>
              <li><strong>Content Data:</strong> Text, images, and videos that you create, upload, or manage through the tool.</li>
              <li><strong>Analytics Data:</strong> Performance metrics retrieved from connected social media platforms.</li>
              <li><strong>Account Information:</strong> Social media account details retrieved from connected platforms.</li>
            </ul>
          </div>

          <div class="policy-section">
            <h2 class="font-display">3. How We Use Information</h2>
            <p>
              All data processing occurs locally on your machine. SocialClaw acts as an intermediary
              between your AI assistant and social media platform APIs. Specifically:
            </p>
            <ul>
              <li>API credentials are used solely to authenticate requests to the respective social media platforms.</li>
              <li>Content data is transmitted directly to the social media platforms you choose to publish on.</li>
              <li>Analytics data is retrieved from platforms and displayed through your AI assistant.</li>
              <li>No data is sent to SocialClaw servers, as we do not operate any.</li>
            </ul>
          </div>

          <div class="policy-section">
            <h2 class="font-display">4. Third-Party Services</h2>
            <p>SocialClaw interacts with the following third-party platforms on your behalf:</p>
            <ul>
              <li><strong>Meta (Facebook/Instagram):</strong> Subject to <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">Meta's Privacy Policy</a></li>
              <li><strong>TikTok:</strong> Subject to <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noopener">TikTok's Privacy Policy</a></li>
              <li><strong>Pinterest:</strong> Subject to <a href="https://policy.pinterest.com/privacy-policy" target="_blank" rel="noopener">Pinterest's Privacy Policy</a></li>
              <li><strong>Replicate (Whisper/AI):</strong> Used for video transcription and image generation, subject to <a href="https://replicate.com/privacy" target="_blank" rel="noopener">Replicate's Privacy Policy</a></li>
            </ul>
            <p>
              We encourage you to review the privacy policies of these third-party services, as your
              use of SocialClaw involves transmitting data to their APIs.
            </p>
          </div>

          <div class="policy-section">
            <h2 class="font-display">5. Data Security</h2>
            <p>
              Since SocialClaw runs locally on your infrastructure, you are responsible for securing
              your environment. We recommend:
            </p>
            <ul>
              <li>Storing API credentials in environment variables, never in source code.</li>
              <li>Using secure, encrypted connections when accessing social media APIs.</li>
              <li>Regularly rotating your API tokens and access credentials.</li>
              <li>Restricting access to the machine running the MCP server.</li>
            </ul>
          </div>

          <div class="policy-section">
            <h2 class="font-display">6. Data Retention</h2>
            <p>
              SocialClaw does not persist any data beyond the duration of API requests. No databases,
              logs, or caches are maintained by the tool. Any data retention is governed by the
              respective social media platforms' policies.
            </p>
          </div>

          <div class="policy-section">
            <h2 class="font-display">7. Children's Privacy</h2>
            <p>
              SocialClaw is not intended for use by individuals under the age of 18. We do not
              knowingly facilitate the collection of personal information from children.
            </p>
          </div>

          <div class="policy-section">
            <h2 class="font-display">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be reflected on this
              page with an updated "Last updated" date. Continued use of SocialClaw after changes
              constitutes acceptance of the updated policy.
            </p>
          </div>

          <div class="policy-section">
            <h2 class="font-display">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or SocialClaw's data practices,
              please open an issue on our GitHub repository.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="section-container footer-inner">
        <div class="footer-bottom">
          <p class="font-mono">&copy; {{ new Date().getFullYear() }} SocialClaw. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
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
.nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: #7C7C8A;
  transition: color 0.3s;
}
.nav-links a:hover { color: #F5F5F7; }

.privacy-page {
  padding-top: 8rem;
  padding-bottom: 5rem;
}
.privacy-header {
  margin-bottom: 4rem;
}
.privacy-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #F5F5F7;
  margin: 1rem 0 0.75rem;
  letter-spacing: -0.03em;
}
.privacy-date {
  font-size: 0.8rem;
  color: #56565F;
  letter-spacing: 0.05em;
}
.privacy-content {
  max-width: 48rem;
}
.policy-section {
  margin-bottom: 2.5rem;
}
.policy-section h2 {
  font-size: 1.35rem;
  font-weight: 600;
  color: #E8E8EC;
  margin-bottom: 1rem;
}
.policy-section p {
  color: #A9A9B4;
  line-height: 1.8;
  margin-bottom: 0.75rem;
}
.policy-section ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}
.policy-section ul li {
  color: #A9A9B4;
  line-height: 1.8;
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.5rem;
}
.policy-section ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.75rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #D4845A;
}
.policy-section a {
  color: #D4845A;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.3s;
}
.policy-section a:hover {
  color: #E8A87C;
}
.policy-section strong {
  color: #CDCDD4;
}

.site-footer {
  padding: 2.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.footer-bottom p {
  font-size: 0.75rem;
  color: #3A3A42;
}
</style>
