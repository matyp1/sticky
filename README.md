# Sticky - Custom Sticker Design App

A Next.js application that enables tradespeople to design custom die-cut stickers with AI-powered tools, 3D previews, and professional printing fulfillment.

## Features

- 🎨 **AI Image Generation** - Generate custom mascots and logos using Replicate SDXL
- ✂️ **Background Removal** - Automatic background removal via remove.bg API
- 📐 **Die-Cut Path Generation** - Precise cut paths generated using Potrace
- 👁️ **3D Preview** - Interactive 3D sticker preview using React Three Fiber
- 🔐 **Authentication** - Secure user authentication via Supabase Auth
- 💾 **Design Storage** - Save and manage designs with Supabase database
- 💳 **Payment Processing** - Stripe integration for secure payments
- 📦 **Print Fulfillment** - Automated order submission to Printful API

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS
- **3D Graphics**: React Three Fiber + Three.js
- **Authentication & Database**: Supabase
- **AI Generation**: Replicate (SDXL model)
- **Image Processing**: remove.bg, Potrace, Sharp
- **Payments**: Stripe
- **Print Fulfillment**: Printful API

## Prerequisites

Before running this application, you'll need to set up accounts and obtain API keys for:

1. **Supabase** - Database and authentication
2. **Replicate** - AI image generation
3. **Remove.bg** - Background removal
4. **Stripe** - Payment processing
5. **Printful** - Print fulfillment

## Installation

1. Clone the repository:
```bash
git clone https://github.com/matyp1/sticky.git
cd sticky
```

2. Install dependencies with pnpm:
```bash
pnpm install
```

3. Copy the environment variables template:
```bash
cp .env.example .env
```

4. Fill in your API keys in the `.env` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Replicate (SDXL for AI generation)
REPLICATE_API_TOKEN=your_replicate_api_token

# Remove.bg API
REMOVEBG_API_KEY=your_removebg_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Printful
PRINTFUL_API_KEY=your_printful_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the SQL schema in your Supabase SQL editor:
```bash
cat supabase-schema.sql
```

3. Create a storage bucket named `designs` in your Supabase dashboard with public access enabled.

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Build

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Project Structure

```
sticky/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── generate/     # AI image generation
│   │   │   ├── remove-bg/    # Background removal
│   │   │   ├── checkout/     # Stripe checkout
│   │   │   ├── webhooks/     # Stripe webhooks
│   │   │   └── printful/     # Printful integration
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── editor/           # Design editor
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/           # React components
│   │   └── StickerPreview3D.tsx
│   ├── lib/                  # Utility functions
│   │   └── supabase.ts
│   └── types/                # TypeScript types
├── public/                   # Static assets
├── supabase-schema.sql       # Database schema
├── .env.example              # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Features Explained

### AI Image Generation
Users can describe their desired mascot or logo, and the app uses Replicate's SDXL model to generate high-quality images.

### 3D Die-Cut Preview
React Three Fiber provides an interactive 3D preview where users can rotate and zoom to see exactly how their sticker will look after die-cutting.

### Background Removal & Cut Path
The remove.bg API removes backgrounds automatically, and Potrace generates precise SVG cut paths for die-cut manufacturing.

### Order Processing
1. User creates a design and clicks "Order Stickers"
2. Stripe checkout session is created
3. Upon successful payment, a webhook triggers order submission to Printful
4. Printful handles printing and shipping

## API Routes

- `POST /api/generate` - Generate AI images using Replicate SDXL
- `POST /api/remove-bg` - Remove background and generate cut path
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe payment webhooks
- `POST /api/printful` - Upload designs to Printful

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details