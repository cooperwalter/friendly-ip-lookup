# Friendly IP Lookup — Design Spec

## Overview

A simple, playful, friendly single-page website that shows the visitor's IPv4 address with an easy click-to-copy button. Designed for non-technical people who have been asked by a support person to provide their IP address.

**Non-goals:**
- No scary messages about location exposure
- No upsells or ads
- No IPv6 display (API is structured to support it later)
- No framework, build step, or dependencies

## Architecture

Static HTML + Vercel Serverless Function. Two core files, zero `node_modules`.

```
friendly-ip-lookup/
├── public/
│   └── index.html        ← Entire frontend (single static file)
├── api/
│   └── ip.ts             ← Vercel Serverless Function, returns visitor's IPv4
├── vercel.json            ← Minimal config
└── package.json           ← Metadata only, no dependencies
```

### Request Flow

1. User visits the site → Vercel serves `public/index.html` as a static file
2. On page load, `index.html` fetches `/api/ip`
3. The serverless function reads the IP from the `x-forwarded-for` header and returns JSON
4. The page displays the IP and enables the copy button

## API Function (`/api/ip.ts`)

**Endpoint:** `GET /api/ip`

**Logic:**
- Read `x-forwarded-for` header (Vercel populates this automatically)
- If the header contains multiple IPs (comma-separated from proxies), take the first one (the original client)
- If the IP is an IPv6-mapped IPv4 (like `::ffff:192.168.1.1`), strip the prefix to return clean IPv4
- Set CORS headers to allow only same-origin requests

**Response:**
```json
{ "ipv4": "203.0.113.42" }
```

The key is `ipv4` (not `ip`) so that `ipv6` can be added alongside it in the future without breaking anything.

**Error case:** If `x-forwarded-for` is missing, return `{ "ipv4": null }`.

## Frontend (`public/index.html`)

### Page Structure

- **Header:** Wave emoji, "Here's your IP address" title, "Someone asked you for this — just click copy!" subtitle
- **IP Card:** "Your IPv4 Address" label, large monospace IP display, copy button
- **FAQ Section:** 3 always-expanded cards with common questions

### Behavior

1. **On load:** Fetch `/api/ip`, show a subtle loading placeholder (`···`) where the IP will appear, then swap in the real IP
2. **Copy button:** Uses `navigator.clipboard.writeText()`. On success, button text changes to "Copied!" with a checkmark icon for 2 seconds, then reverts. Button background shifts to a soft green during the copied state.
3. **Clipboard fallback:** If `navigator.clipboard` isn't available (older browsers, non-HTTPS), fall back to `document.execCommand('copy')` with a hidden textarea
4. **Error state:** If the API call fails, show "Couldn't find your IP address — try refreshing the page" in place of the IP. No error codes.

### Styling

- Warm off-white background (`#faf9f7`)
- System font stack for body text, monospace for the IP address
- Muted sage green for the copy button (`#5b8a72`)
- Responsive — single centered column, max-width card, works on mobile without breakpoints
- All styles inline in the single HTML file (no external CSS or fonts)
- Card style: white background, subtle border (`#e8e5e0`), 16px border radius, light box shadow

## FAQ Content

Written for non-technical people. Short, reassuring, jargon-free.

**1. "What is an IP address?"**
It's like a mailing address for your internet connection. It helps other computers find yours so websites can send you information.

**2. "Is it safe to share?"**
Yes! Sharing your IP address with a support person is perfectly normal and safe. It helps them troubleshoot your connection.

**3. "What's IPv4 vs IPv6?"**
They're just two formats for IP addresses. IPv4 looks like 192.168.1.42 (numbers and dots). IPv6 is a newer, longer format. Most support teams just need your IPv4 address.

## Deployment

- **Platform:** Vercel
- **Domain:** Default `.vercel.app` subdomain initially; custom domain later
- **Build:** None required — Vercel serves static files from `public/` and compiles the TypeScript API function on deploy
