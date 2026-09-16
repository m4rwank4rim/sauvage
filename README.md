# Vortex Creative Studio — GTA World Roleplay Design Agency Website

A production-quality marketing + client-intake + Fleeca payment platform for an in-character
graphic design agency operating on the **GTA World Roleplay (GTAW)** server.

Visually modeled after **superpower.com**: big confident headline, generous whitespace, large
rounded cards, soft violet glows on a deep dark background, scroll-triggered animations, sticky
pill nav, bold stat callouts, and horizontally-scrolling testimonials.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (custom brand palette)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Data Storage**: File-backed JSON store (`/data/agency.json`) — zero dependencies, atomic writes
- **Payments**: Fleeca Bank HTTP API v2 with HMAC-SHA256 webhook verification

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Fleeca Bank Payment Gateway
FLEECA_API_KEY=your_merchant_api_key_from_fleeca_merchant_center
FLEECA_MODE=0                          # 0 = sandbox, 1 = live
FLEECA_BASE_URL=https://banking.gta.world
FLEECA_REDIRECT_URL=http://localhost:3000/payment/result
FLEECA_CALLBACK_URL=http://localhost:3000/api/webhooks/fleeca

# Public Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Passcode (TODO: replace with proper auth before production)
ADMIN_ACCESS_PASSCODE=fleeca2026
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Fleeca Bank Payment Gateway

### How it works

1. **Admin issues a quote** at `/admin` by entering a dollar amount and clicking "Generate Quote & Fleeca Link".
2. This calls `POST /api/fleeca/pay` (server-side) which calls `POST https://banking.gta.world/api/v2/payment`.
3. The returned `payment_id` and `payment_link` are stored against the design request.
4. The client visits their project page at `/request/[id]` and clicks "Pay via Fleeca Bank".
5. Fleeca redirects the browser to your `FLEECA_REDIRECT_URL` with `?payment_id=...`.
6. `GET /api/fleeca/status/[id]` reconciles status server-side (never trusting the client redirect alone).
7. Fleeca also fires a signed webhook `POST` to `FLEECA_CALLBACK_URL`.
8. `/api/webhooks/fleeca` verifies the `X-Fleeca-Signature: sha256=<hex>` header using HMAC-SHA256 with your `FLEECA_API_KEY` as the secret (`crypto.timingSafeEqual`), then marks the request as `paid`.

### Sandbox vs Live Mode

| Setting | Behaviour |
|---|---|
| `FLEECA_MODE=0` + demo key | Uses local checkout simulator at `/fleeca-mock/checkout/[id]`. No real balance changes. Full webhook flow is tested end-to-end using signed HMAC. |
| `FLEECA_MODE=0` + real key | Calls real Fleeca API in sandbox mode. |
| `FLEECA_MODE=1` + real key | Live mode — real in-game balance transfers. |

### Getting a real Fleeca API key

1. Log in to the [Fleeca Merchant Center](https://banking.gta.world/merchant) with your GTA World character.
2. Register your merchant business and generate a Bearer API key.
3. Set your redirect URL: `https://yourdomain.com/payment/result`
4. Set your callback/webhook URL: `https://yourdomain.com/api/webhooks/fleeca`
5. Paste the API key into `FLEECA_API_KEY` in `.env.local`.

---

## Editing Content

### Agency Name, Stats, Pricing, FAQs

All editable copy lives in one file: [`src/config/siteConfig.ts`](./src/config/siteConfig.ts)

```ts
agencyName: "Vortex Creative",  // ← Change this
stats: [ ... ],                 // ← Edit statistics
services: [ ... ],              // ← Edit pricing tiers and features
faqs: [ ... ],                  // ← Edit FAQ questions/answers
```

### Portfolio Items

All portfolio items live in: [`src/data/portfolio.ts`](./src/data/portfolio.ts)

Add a new entry like this:

```ts
{
  id: "my-new-project",
  title: "Custom Livery for LSPD",
  category: "Vehicle Liveries",
  clientName: "Los Santos Police Department",
  businessType: "Law Enforcement",
  year: "2026",
  description: "High-visibility pursuit livery...",
  tags: ["Livery", "Police", "LSPD"],
  featured: true,
  colorAccent: "#CCFF00",
  previewType: "livery",
},
```

Then add a matching visual case in [`src/components/PortfolioGraphic.tsx`](./src/components/PortfolioGraphic.tsx).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (Hero, Stats, How It Works, Portfolio, Pricing, Testimonials, FAQ)
│   ├── work/page.tsx               # Filterable portfolio grid with lightbox
│   ├── request/
│   │   ├── page.tsx                # Design request intake form
│   │   └── [id]/page.tsx           # Project status tracker + Fleeca pay button
│   ├── contact/page.tsx            # Contact info + message form
│   ├── admin/page.tsx              # Admin: manage requests, issue quotes, Fleeca sync
│   ├── payment/result/page.tsx     # Fleeca checkout return handler + receipt
│   ├── fleeca-mock/
│   │   └── checkout/[id]/page.tsx  # Sandbox Fleeca Bank checkout simulator
│   └── api/
│       ├── requests/               # Design request CRUD
│       ├── fleeca/
│       │   ├── balance/            # Merchant balance check
│       │   ├── pay/                # Create payment link
│       │   ├── status/[id]/        # Payment status reconciliation
│       │   └── sign-mock/          # Sandbox HMAC signing helper
│       ├── webhooks/fleeca/        # Webhook receiver (HMAC-SHA256 verified)
│       └── contact/                # Contact form handler
├── components/
│   ├── Navbar.tsx                  # Sticky pill nav
│   ├── Footer.tsx                  # Footer with OOC disclaimer
│   ├── HeroSection.tsx             # Big headline + dual CTAs + violet glow blobs
│   ├── StatsBar.tsx                # Bold numeric stats
│   ├── HowItWorks.tsx              # 4-step process cards
│   ├── FeaturedWork.tsx            # Curated portfolio grid
│   ├── PricingSection.tsx          # Service tiers with in-game $ pricing
│   ├── TestimonialsStrip.tsx       # Auto-scrolling horizontal testimonials
│   ├── FaqAccordion.tsx            # Animated FAQ accordion
│   ├── LightboxModal.tsx           # Portfolio item fullscreen modal
│   └── PortfolioGraphic.tsx        # SVG/CSS portfolio artwork generator
├── config/
│   └── siteConfig.ts               # All editable agency copy & settings
├── data/
│   └── portfolio.ts                # Portfolio dataset
└── lib/
    ├── types.ts                    # Shared TypeScript interfaces
    ├── fleeca.ts                   # Fleeca Bank API client + HMAC utilities
    └── db/
        └── store.ts                # File-backed JSON data store
```

---

## OOC Disclaimer

This website is built for an **in-character creative agency within the GTA World Roleplay (GTAW)
server**. All dollar amounts (`$`) represent in-game virtual currency processed via the Fleeca Bank
in-game API. This project is not affiliated with Rockstar Games, Take-Two Interactive, or any
real-world financial institution.
