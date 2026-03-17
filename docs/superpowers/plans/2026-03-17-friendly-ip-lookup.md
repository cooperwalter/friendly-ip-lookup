# Friendly IP Lookup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page website that shows the visitor's IPv4 address with a friendly copy-to-clipboard button and a short FAQ section.

**Architecture:** Static HTML served from `public/` + one Vercel Serverless Function at `/api/ip` that extracts the visitor's IPv4 from request headers. Zero runtime dependencies; `@vercel/node` as a dev dependency for TypeScript types.

**Tech Stack:** Vanilla HTML/CSS/JS, TypeScript (Vercel Serverless Function), Vercel hosting

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Create | Project metadata, `@vercel/node` dev dependency |
| `vercel.json` | Create | Minimal Vercel config |
| `.gitignore` | Create | Ignore `node_modules`, `.vercel`, `.env*.local` |
| `api/ip.ts` | Create | Serverless function — extract IPv4 from headers, return JSON |
| `public/index.html` | Create | Entire frontend — IP display, copy button, FAQ |

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `vercel.json`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "friendly-ip-lookup",
  "version": "1.0.0",
  "private": true,
  "description": "A friendly website that shows your IP address"
}
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

No custom rewrites needed — Vercel automatically routes `/api/*` to the `api/` directory and serves `public/` as static files.

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
.vercel
.env*.local
```

- [ ] **Step 4: Install dev dependency**

Run: `npm install --save-dev @vercel/node`

- [ ] **Step 5: Commit**

```bash
git add package.json vercel.json .gitignore package-lock.json
git commit -m "chore: scaffold project with Vercel config"
```

---

### Task 2: API function

**Files:**
- Create: `api/ip.ts`

- [ ] **Step 1: Create `api/ip.ts`**

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

function extractIPv4(request: VercelRequest): string | null {
  const forwarded = request.headers["x-forwarded-for"];
  if (!forwarded) {
    return null;
  }

  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw.split(",")[0].trim();

  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }

  return ip;
}

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const ipv4 = extractIPv4(request);
  response.status(200).json({ ipv4 });
}
```

- [ ] **Step 2: Type-check the file**

Run: `npx tsc api/ip.ts --noEmit --esModuleInterop --moduleResolution node`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add api/ip.ts
git commit -m "feat: add /api/ip serverless function"
```

---

### Task 3: Frontend HTML — structure and styling

**Files:**
- Create: `public/index.html`

This task creates the full HTML file with all structure, styling, and content. The copy-to-clipboard behavior is added in Task 4.

- [ ] **Step 1: Create `public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>What's My IP Address?</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #faf9f7;
      color: #3d3d3d;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }

    .header {
      text-align: center;
      margin-top: 3rem;
      margin-bottom: 2rem;
    }

    .wave { font-size: 3rem; margin-bottom: 0.5rem; }

    .title {
      font-size: 1.6rem;
      font-weight: 600;
      color: #2d2d2d;
      margin-bottom: 0.25rem;
    }

    .subtitle {
      font-size: 1rem;
      color: #888;
      font-weight: 400;
    }

    .ip-card {
      background: #fff;
      border: 1px solid #e8e5e0;
      border-radius: 16px;
      padding: 2rem 2.5rem;
      text-align: center;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }

    .ip-label {
      font-size: 0.85rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .ip-address {
      font-size: 2.2rem;
      font-weight: 700;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      color: #2d2d2d;
      letter-spacing: 0.02em;
      margin-bottom: 1.25rem;
      min-height: 2.8rem;
    }

    .copy-btn {
      background: #5b8a72;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 0.7rem 1.8rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .copy-btn:hover { background: #4a7a62; }
    .copy-btn:disabled { cursor: default; }

    .copy-btn.copied {
      background: #e8f5e9;
      color: #4a7a62;
      border: 1px solid #c8e6c9;
    }

    .copy-btn svg { width: 18px; height: 18px; }

    .error-message {
      font-size: 0.95rem;
      color: #999;
    }

    .faq-section {
      max-width: 420px;
      width: 100%;
      margin-top: 2.5rem;
    }

    .faq-title {
      font-size: 0.85rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
      text-align: center;
    }

    .faq-item {
      background: #fff;
      border: 1px solid #e8e5e0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 0.5rem;
    }

    .faq-q {
      font-weight: 600;
      font-size: 0.95rem;
      color: #2d2d2d;
      margin-bottom: 0.35rem;
    }

    .faq-a {
      font-size: 0.9rem;
      color: #777;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="wave" aria-hidden="true">👋</div>
    <h1 class="title">Here's your IP address</h1>
    <p class="subtitle">Someone asked you for this — just click copy!</p>
  </div>

  <div class="ip-card">
    <div class="ip-label">Your IPv4 Address</div>
    <div class="ip-address" id="ip-display">···</div>
    <button class="copy-btn" id="copy-btn" disabled>
      <svg id="copy-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
      <span id="copy-text">Copy to clipboard</span>
    </button>
  </div>

  <div class="faq-section">
    <div class="faq-title">Common Questions</div>
    <div class="faq-item">
      <div class="faq-q">What is an IP address?</div>
      <div class="faq-a">It's like a mailing address for your internet connection. It helps other computers find yours so websites can send you information.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">Is it safe to share?</div>
      <div class="faq-a">Yes! Sharing your IP address with a support person is perfectly normal and safe. It helps them troubleshoot your connection.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">What's IPv4 vs IPv6?</div>
      <div class="faq-a">They're just two formats for IP addresses. IPv4 looks like 192.168.1.42 (numbers and dots). IPv6 is a newer, longer format. Most support teams just need your IPv4 address.</div>
    </div>
  </div>

  <script>
    // Populated in Task 4
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/index.html
git commit -m "feat: add frontend HTML with styling and FAQ"
```

---

### Task 4: Frontend JavaScript — fetch IP and copy-to-clipboard

**Files:**
- Modify: `public/index.html` (replace the empty `<script>` block)

- [ ] **Step 1: Add JavaScript to `public/index.html`**

Replace the `<script>` block with:

```html
<script>
  var ipDisplay = document.getElementById("ip-display");
  var copyBtn = document.getElementById("copy-btn");
  var copyText = document.getElementById("copy-text");
  var copyIcon = document.getElementById("copy-icon");

  var currentIP = null;

  var copySVG =
    '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
    '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>';
  var checkSVG = '<polyline points="20 6 9 17 4 12"/>';
  var errorText = "Couldn\u2019t find your IP address \u2014 try refreshing the page";

  function showError() {
    ipDisplay.textContent = errorText;
    ipDisplay.classList.add("error-message");
  }

  function fetchIP() {
    fetch("/api/ip")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.ipv4) {
          currentIP = data.ipv4;
          ipDisplay.textContent = currentIP;
          copyBtn.disabled = false;
        } else {
          showError();
        }
      })
      .catch(function () {
        showError();
      });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      resolve();
    });
  }

  copyBtn.addEventListener("click", function () {
    if (!currentIP) return;
    copyToClipboard(currentIP)
      .then(function () {
        copyBtn.classList.add("copied");
        copyIcon.innerHTML = checkSVG;
        copyText.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          copyIcon.innerHTML = copySVG;
          copyText.textContent = "Copy to clipboard";
        }, 2000);
      })
      .catch(function () {
        copyText.textContent = "Couldn\u2019t copy \u2014 try selecting and copying manually";
      });
  });

  fetchIP();
</script>
```

Note: `innerHTML` is used only with hardcoded SVG strings (no user input), so there is no XSS risk.

- [ ] **Step 2: Commit**

```bash
git add public/index.html
git commit -m "feat: add IP fetch and copy-to-clipboard behavior"
```

---

### Task 5: Deploy and verify

- [ ] **Step 1: Deploy to Vercel**

Run: `vercel`

Follow prompts to link the project. Accept defaults.

- [ ] **Step 2: Open the preview URL and verify**

Check:
- Page loads with the wave emoji and title
- IP address appears (not `···`)
- Copy button works — copies the IP to clipboard
- "Copied!" state shows for 2 seconds then reverts
- FAQ section displays below the card
- Page looks correct on mobile (resize browser)

- [ ] **Step 3: Deploy to production**

Run: `vercel --prod`

- [ ] **Step 4: Commit any Vercel config changes if needed**

```bash
git add -A
git status
```

Only commit if there are meaningful changes (e.g., `.vercel/project.json` is usually gitignored).
