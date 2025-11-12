# Sticky - Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                         (Next.js App)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Landing Page │  │ Auth Pages   │  │  Dashboard   │        │
│  │              │  │ - Sign In    │  │ - My Designs │        │
│  │ - Features   │  │ - Sign Up    │  │ - New Design │        │
│  │ - Call to    │  │              │  │              │        │
│  │   Action     │  └──────────────┘  └──────────────┘        │
│  └──────────────┘                                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              Design Editor                           │     │
│  │  ┌────────────────┐  ┌────────────────┐            │     │
│  │  │ AI Generation  │  │ 3D Preview     │            │     │
│  │  │ - Text Prompt  │  │ - React Three  │            │     │
│  │  │ - Generate Btn │  │ - Camera Ctrl  │            │     │
│  │  └────────────────┘  └────────────────┘            │     │
│  │  ┌────────────────┐  ┌────────────────┐            │     │
│  │  │ BG Removal     │  │ Order/Save     │            │     │
│  │  │ - Process Img  │  │ - Save Design  │            │     │
│  │  │ - Cut Path     │  │ - Order Now    │            │     │
│  │  └────────────────┘  └────────────────┘            │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes Layer                           │
│                   (Next.js API Routes)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/generate      → AI Image Generation                 │
│  POST /api/remove-bg     → Background Removal + Path Tracing   │
│  POST /api/checkout      → Create Stripe Session               │
│  POST /api/webhooks/stripe → Handle Payment Events             │
│  POST /api/printful      → Upload to Printful                  │
│  GET  /auth/callback     → Handle Auth Redirect                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Internal Processing    │  │   External Services      │
├──────────────────────────┤  ├──────────────────────────┤
│                          │  │                          │
│  • Sharp (Image Process) │  │  • Supabase              │
│  • Potrace (SVG Tracing) │  │    - Auth                │
│  • Type Validation       │  │    - Database            │
│  • Error Handling        │  │    - Storage             │
│                          │  │                          │
│                          │  │  • Replicate             │
│                          │  │    - SDXL Model          │
│                          │  │                          │
│                          │  │  • Remove.bg             │
│                          │  │    - BG Removal          │
│                          │  │                          │
│                          │  │  • Stripe                │
│                          │  │    - Payment             │
│                          │  │    - Webhooks            │
│                          │  │                          │
│                          │  │  • Printful              │
│                          │  │    - Print/Ship          │
│                          │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

## User Flow Diagram

```
START
  │
  ▼
┌────────────────┐
│  Landing Page  │
└────────────────┘
  │
  ├─── Sign Up ───┐
  │               │
  ▼               ▼
┌────────────────┐ ┌────────────────┐
│   Sign In      │ │   Sign Up      │
└────────────────┘ └────────────────┘
  │                 │
  └────────┬────────┘
           │
           ▼
     ┌─────────────┐
     │  Dashboard  │◄────────────────┐
     └─────────────┘                 │
           │                         │
           │ Click "New Design"      │
           ▼                         │
     ┌─────────────┐                 │
     │   Editor    │                 │
     └─────────────┘                 │
           │                         │
           │ 1. Enter Prompt         │
           ▼                         │
     ┌─────────────────┐             │
     │ AI Generation   │             │
     │ (Replicate SDXL)│             │
     └─────────────────┘             │
           │                         │
           │ 2. Generated Image      │
           ▼                         │
     ┌─────────────────┐             │
     │ View in Editor  │             │
     └─────────────────┘             │
           │                         │
           │ 3. Click "Remove BG"    │
           ▼                         │
     ┌─────────────────┐             │
     │  Remove.bg API  │             │
     │  + Potrace      │             │
     └─────────────────┘             │
           │                         │
           │ 4. Processed Image      │
           │    + Cut Path           │
           ▼                         │
     ┌─────────────────┐             │
     │ 3D Preview      │             │
     │ (React Three)   │             │
     └─────────────────┘             │
           │                         │
           ├── Save Design ──────────┤
           │                         │
           │ 5. Click "Order"        │
           ▼                         │
     ┌─────────────────┐             │
     │ Stripe Checkout │             │
     └─────────────────┘             │
           │                         │
           │ 6. Payment Success      │
           ▼                         │
     ┌─────────────────┐             │
     │ Webhook Handler │             │
     │ → Submit to     │             │
     │   Printful      │             │
     └─────────────────┘             │
           │                         │
           │ 7. Order Created        │
           └─────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Database Schema                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  auth.users (Supabase Built-in)                         │
│  ├── id (UUID)                                           │
│  ├── email                                               │
│  └── encrypted_password                                  │
│                                                          │
│  designs                                                 │
│  ├── id (UUID) [PK]                                      │
│  ├── user_id (UUID) [FK → auth.users]                   │
│  ├── name (TEXT)                                         │
│  ├── design_data (JSONB)                                 │
│  ├── image_url (TEXT)                                    │
│  ├── cut_path (TEXT)                                     │
│  ├── created_at (TIMESTAMP)                              │
│  └── updated_at (TIMESTAMP)                              │
│                                                          │
│  orders                                                  │
│  ├── id (UUID) [PK]                                      │
│  ├── user_id (UUID) [FK → auth.users]                   │
│  ├── design_id (UUID) [FK → designs]                    │
│  ├── printful_order_id (TEXT)                           │
│  ├── stripe_payment_id (TEXT)                           │
│  ├── status (TEXT)                                       │
│  ├── total_amount (DECIMAL)                             │
│  ├── created_at (TIMESTAMP)                              │
│  └── updated_at (TIMESTAMP)                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## API Integration Flow

```
User Action               API Route                External Service
─────────────────────────────────────────────────────────────────
Generate Image      →    /api/generate       →    Replicate SDXL
                                                    ↓
                                                 Generated URL
                                                    ↓
                         ←─────────────────────  Return to User

Remove Background   →    /api/remove-bg      →    Remove.bg API
                                                    ↓
                                                 Processed Image
                                                    ↓
                         Potrace Processing
                                                    ↓
                         ←─────────────────────  Image + Cut Path

Order Stickers      →    /api/checkout       →    Stripe API
                                                    ↓
                                                 Checkout Session
                                                    ↓
                         ←─────────────────────  Redirect URL
                                                    ↓
                         User Pays
                                                    ↓
Webhook Event       ←────────────────────────    Stripe Webhook
                         ↓
                    /api/webhooks/stripe
                         ↓
                    Submit to Printful     →    Printful API
                                                    ↓
                                                 Order Created
```

## Component Hierarchy

```
App
├── layout.tsx (Root Layout)
│   └── globals.css
│
├── page.tsx (Landing Page)
│
├── auth/
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   └── callback/route.ts
│
├── dashboard/page.tsx
│   └── Design Cards (mapped)
│
└── editor/page.tsx
    ├── Design Name Input
    ├── AI Generation Panel
    │   ├── Prompt Textarea
    │   └── Generate Button
    ├── Image Processing Panel
    │   └── Remove BG Button
    ├── Generated Image Display
    ├── StickerPreview3D (Component)
    │   ├── Canvas (React Three Fiber)
    │   ├── OrbitControls
    │   ├── Lights
    │   └── StickerMesh
    └── Order Panel
        └── Order Button
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│            Client Side                      │
│  • Type validation                          │
│  • Form validation                          │
│  • Token storage (httpOnly)                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Authentication Layer                │
│  • Supabase Auth                            │
│  • Session validation                       │
│  • Protected routes                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Authorization Layer                 │
│  • Row Level Security (RLS)                 │
│  • User-specific data access                │
│  • Storage bucket policies                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           API Security                      │
│  • Environment variables                    │
│  • Webhook signature verification           │
│  • Server-side API calls only               │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   GitHub Repo   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Vercel Build   │
                    │  - Next.js      │
                    │  - TypeScript   │
                    │  - Optimize     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Vercel Hosting  │
                    │ - CDN           │
                    │ - Serverless    │
                    │ - Edge Network  │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  Supabase   │  │   Stripe    │  │  Printful   │
    │  (DB/Auth)  │  │  (Payment)  │  │  (Fulfill)  │
    └─────────────┘  └─────────────┘  └─────────────┘
```

## Cost Structure per Design

```
┌──────────────────────────────────────────────┐
│ Design Creation Costs                        │
├──────────────────────────────────────────────┤
│ AI Generation (Replicate)      $0.02        │
│ Background Removal (Remove.bg)  $0.20        │
│ Storage (Supabase)             ~$0.00        │
│                                ──────        │
│ Total per Design:               $0.22        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Order Costs                                  │
├──────────────────────────────────────────────┤
│ Stripe Fee (on $25)            $1.03        │
│ Printful (varies)              ~$15.00       │
│                                ──────        │
│ Total Cost:                    ~$16.03       │
│ Revenue (if $25):               $25.00       │
│ Profit Margin:                  $8.97        │
└──────────────────────────────────────────────┘
```

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 | React framework |
| | TypeScript | Type safety |
| | Tailwind CSS | Styling |
| | React Three Fiber | 3D graphics |
| **Backend** | Next.js API Routes | Serverless functions |
| | Supabase | Auth/DB/Storage |
| **AI/Image** | Replicate SDXL | Image generation |
| | Remove.bg | Background removal |
| | Potrace | SVG path tracing |
| | Sharp | Image processing |
| **Commerce** | Stripe | Payments |
| | Printful | Fulfillment |
| **Dev Tools** | pnpm | Package manager |
| | ESLint | Linting |
| | CodeQL | Security |

---

This architecture provides a scalable, secure, and maintainable foundation for the sticker design application.
