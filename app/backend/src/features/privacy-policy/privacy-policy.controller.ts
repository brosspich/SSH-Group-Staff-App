import { Request, Response } from "express";
import { DatabaseAuditLogger } from "../../infrastructure/events/eventEmitter.js";
import {
  BACKEND_APP_VERSION,
  PRIVACY_POLICY_DATA,
  PRIVACY_POLICY_LAST_UPDATED,
  type PolicyLang,
} from "./privacy-policy.data.js";

const auditLogger = new DatabaseAuditLogger();

export class PrivacyPolicyController {
  /**
   * GET /privacy-policy and GET /api/v1/privacy-policy
   * Renders a public responsive HTML page or JSON for Store Compliance.
   */
  getPublicPolicy = (req: Request, res: Response) => {
    const format = req.query.format as string;
    const acceptHeader = req.headers.accept || "";

    // 1. Return JSON if explicitly requested
    if (format === "json" || acceptHeader.includes("application/json")) {
      const requestedLang = (req.query.lang as PolicyLang) || "km";
      const lang: PolicyLang =
        requestedLang === "en" ||
        requestedLang === "zh" ||
        requestedLang === "km"
          ? requestedLang
          : "km";

      return res.status(200).json({
        success: true,
        version: BACKEND_APP_VERSION,
        language: lang,
        lastUpdated: PRIVACY_POLICY_LAST_UPDATED[lang],
        sections: PRIVACY_POLICY_DATA[lang],
      });
    }

    // 2. Otherwise render public HTML page (Relax CSP for inline styles)
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const defaultLang = ((req.query.lang as string) || "km").toLowerCase();
    const activeLang: PolicyLang =
      defaultLang === "en" || defaultLang === "zh" || defaultLang === "km"
        ? (defaultLang as PolicyLang)
        : "km";

    const allDataJson = JSON.stringify(PRIVACY_POLICY_DATA);
    const lastUpdatedJson = JSON.stringify(PRIVACY_POLICY_LAST_UPDATED);

    const html = `<!DOCTYPE html>
<html lang="${activeLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - SSH Group Staff App</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #047857;
      --primary-light: #10B981;
      --primary-bg: #ECFDF5;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --border: #E2E8F0;
      --radius: 12px;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.65;
      padding-bottom: 60px;
    }
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, #065F46 100%);
      color: #FFFFFF;
      padding: 48px 24px 36px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(4, 120, 87, 0.15);
    }
    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(8px);
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 15px;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      max-width: 860px;
      margin: -24px auto 0;
      padding: 0 20px;
    }
    .lang-switcher {
      background: var(--card-bg);
      padding: 8px;
      border-radius: var(--radius);
      display: flex;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }
    .lang-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    .lang-btn:hover {
      background: var(--primary-bg);
      color: var(--primary);
    }
    .lang-btn.active {
      background: var(--primary);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(4, 120, 87, 0.25);
    }
    .version-tag {
      text-align: center;
      margin-bottom: 20px;
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
      background: #FFFFFF;
      display: inline-block;
      padding: 6px 18px;
      border-radius: 999px;
      border: 1px solid var(--border);
    }
    .version-wrapper {
      text-align: center;
    }
    .policy-card {
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border);
    }
    .policy-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #F1F5F9;
    }
    .policy-section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: "";
      width: 4px;
      height: 18px;
      background: var(--primary-light);
      border-radius: 2px;
      display: inline-block;
    }
    .section-body {
      font-size: 15px;
      color: var(--text-muted);
      white-space: pre-line;
      line-height: 1.75;
    }
    .contact-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
    }
    .contact-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: #FFFFFF;
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .contact-btn:hover {
      opacity: 0.9;
    }
    .contact-btn.secondary {
      background: #FFFFFF;
      color: var(--text-main);
      border: 1px solid var(--border);
    }
    .contact-btn.secondary:hover {
      background: var(--bg);
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 13px;
      color: #94A3B8;
    }
    @media (max-width: 640px) {
      .header {
        padding: 36px 16px 28px;
      }
      .header h1 {
        font-size: 22px;
      }
      .policy-card {
        padding: 20px 16px;
      }
      .section-title {
        font-size: 16px;
      }
      .section-body {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-badge">SSH GROUP ENTERPRISE</div>
    <h1 id="page-title">គោលការណ៍ឯកជនភាព (Privacy Policy)</h1>
    <p>SSH Group Staff Mobile Application</p>
  </header>

  <main class="container">
    <nav class="lang-switcher">
      <button class="lang-btn ${activeLang === "km" ? "active" : ""}" onclick="switchLang('km')">ភាសាខ្មែរ</button>
      <button class="lang-btn ${activeLang === "en" ? "active" : ""}" onclick="switchLang('en')">English</button>
      <button class="lang-btn ${activeLang === "zh" ? "active" : ""}" onclick="switchLang('zh')">中文</button>
    </nav>

    <div class="version-wrapper">
      <div class="version-tag" id="last-updated">
        ${PRIVACY_POLICY_LAST_UPDATED[activeLang]}
      </div>
    </div>

    <article class="policy-card" id="policy-sections">
      ${PRIVACY_POLICY_DATA[activeLang]
        .map(
          (sec, i) => `
        <section class="policy-section">
          <h2 class="section-title">${sec.title}</h2>
          <div class="section-body">${sec.body}</div>
          ${
            i === PRIVACY_POLICY_DATA[activeLang].length - 1
              ? `
            <div class="contact-actions">
              <a href="https://t.me/sshgroup168" target="_blank" class="contact-btn">💬 Telegram Support</a>
              <a href="mailto:support@sshgroups.com" class="contact-btn secondary">✉️ support@sshgroups.com</a>
              <a href="https://www.sshgroups.com" target="_blank" class="contact-btn secondary">🌐 Website</a>
            </div>
          `
              : ""
          }
        </section>
      `,
        )
        .join("")}
    </article>

    <footer class="footer">
      <p>&copy; ${new Date().getFullYear()} SSH Group Co., Ltd. All rights reserved.</p>
      <p style="margin-top: 4px;">Phnom Penh, Kingdom of Cambodia</p>
    </footer>
  </main>

  <script>
    const policyData = ${allDataJson};
    const lastUpdatedData = ${lastUpdatedJson};

    const titleMap = {
      km: "គោលការណ៍ឯកជនភាព",
      en: "Privacy Policy",
      zh: "隐私政策"
    };

    function switchLang(lang) {
      document.documentElement.lang = lang;
      
      // Update buttons
      document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.lang-btn')).find(b => 
        (lang === 'km' && b.innerText.includes('ខ្មែរ')) ||
        (lang === 'en' && b.innerText.includes('English')) ||
        (lang === 'zh' && b.innerText.includes('中文'))
      );
      if (activeBtn) activeBtn.classList.add('active');

      // Update Header Title
      document.getElementById('page-title').innerText = titleMap[lang] || 'Privacy Policy';

      // Update Last Updated
      document.getElementById('last-updated').innerText = lastUpdatedData[lang] || '';

      // Update Sections
      const sections = policyData[lang] || [];
      const container = document.getElementById('policy-sections');
      container.innerHTML = sections.map((sec, i) => \`
        <section class="policy-section">
          <h2 class="section-title">\${sec.title}</h2>
          <div class="section-body">\${sec.body}</div>
          \${i === sections.length - 1 ? \`
            <div class="contact-actions">
              <a href="https://t.me/sshgroup168" target="_blank" class="contact-btn">💬 Telegram Support</a>
              <a href="mailto:support@sshgroups.com" class="contact-btn secondary">✉️ support@sshgroups.com</a>
              <a href="https://www.sshgroups.com" target="_blank" class="contact-btn secondary">🌐 Website</a>
            </div>
          \` : ''}
        </section>
      \`).join('');

      // Update browser URL query without reload
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);
    }
  </script>
</body>
</html>`;

    return res.status(200).send(html);
  };

  /**
   * POST /api/v1/privacy-policy/consent
   * Logs staff acceptance into both local SQLite and Cloudflare D1 AuditLog tables.
   */
  recordConsent = async (req: Request, res: Response) => {
    try {
      const {
        lang = "km",
        version = BACKEND_APP_VERSION,
        userId,
        userName,
      } = req.body;
      const clientIp =
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "unknown";

      const actorId = userId ? String(userId).trim() : "anonymous";
      const actorName = userName ? String(userName).trim() : "Staff User";

      await auditLogger.log({
        action: "PRIVACY_POLICY_ACCEPTED",
        actorId,
        actorName,
        targetId: `policy-${version}`,
        details: {
          version,
          lang,
          userAgent: req.headers["user-agent"] || "SSH Group Staff App",
          acceptedAt: new Date().toISOString(),
          ipAddress: clientIp,
        },
        ipAddress: clientIp,
        timestamp: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Privacy policy consent successfully recorded in audit log",
        data: {
          actorId,
          version,
          lang,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: `Failed to record privacy policy consent: ${error?.message}`,
      });
    }
  };
}

export const privacyPolicyController = new PrivacyPolicyController();
