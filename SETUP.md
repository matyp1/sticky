# Sticky - Setup Guide

This guide will walk you through setting up the Sticky application from scratch.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Accounts for required services (see below)

## Service Setup

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to finish provisioning

2. **Get Your API Keys**
   - Go to Project Settings → API
   - Copy the "Project URL" (NEXT_PUBLIC_SUPABASE_URL)
   - Copy the "anon public" key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Copy the "service_role" key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

3. **Set Up the Database**
   - Go to the SQL Editor in Supabase
   - Copy the contents of `supabase-schema.sql`
   - Run the SQL to create tables and policies

4. **Create Storage Bucket**
   - Go to Storage in Supabase
   - Create a new bucket named `designs`
   - Make it public
   - The SQL policies will handle access control

### 2. Replicate Setup (AI Image Generation)

1. **Create Account**
   - Go to [replicate.com](https://replicate.com)
   - Sign up for an account

2. **Get API Token**
   - Go to Account Settings → API Tokens
   - Create a new token
   - Copy the token (REPLICATE_API_TOKEN)

3. **Add Billing** (if not already done)
   - Replicate requires a payment method
   - SDXL costs approximately $0.02 per generation

### 3. Remove.bg Setup (Background Removal)

1. **Create Account**
   - Go to [remove.bg](https://www.remove.bg/api)
   - Sign up for an account

2. **Get API Key**
   - Go to the API section
   - Copy your API key (REMOVEBG_API_KEY)
   - Free plan includes 50 API calls/month
   - Paid plans available for higher volume

### 4. Stripe Setup (Payment Processing)

1. **Create Account**
   - Go to [stripe.com](https://stripe.com)
   - Create an account

2. **Get API Keys**
   - Go to Developers → API keys
   - Copy the "Publishable key" (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   - Copy the "Secret key" (STRIPE_SECRET_KEY)

3. **Set Up Webhooks** (for production)
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the "Signing secret" (STRIPE_WEBHOOK_SECRET)

4. **For Local Development**
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Use the webhook secret provided

### 5. Printful Setup (Print Fulfillment)

1. **Create Account**
   - Go to [printful.com](https://www.printful.com)
   - Create an account
   - Complete store setup

2. **Get API Key**
   - Go to Settings → Stores
   - Select your store
   - Go to "Add to store" → Custom integration
   - Generate API key (PRINTFUL_API_KEY)

3. **Configure Products**
   - Browse the catalog
   - Note the variant IDs for sticker products
   - Update the variant_id in `/api/webhooks/stripe/route.ts` if needed
   - Default: 4011 (Kiss Cut Sticker Sheet)

## Installation Steps

1. **Clone and Install**
```bash
git clone https://github.com/matyp1/sticky.git
cd sticky
pnpm install
```

2. **Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` and fill in all the API keys from the services above:

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

3. **Run Development Server**
```bash
pnpm dev
```

4. **Access the Application**
   - Open http://localhost:3000
   - Create an account
   - Start designing!

## Testing the Application

### 1. Test Authentication
- Sign up with a test email
- Check Supabase dashboard to verify user was created
- Sign in with the same credentials

### 2. Test Design Creation
- Click "New Design"
- Enter a prompt like "a friendly cartoon plumber"
- Click "Generate Image"
- Wait for the AI to generate the image

### 3. Test Background Removal
- After generating an image, click "Remove Background & Create Cut Path"
- The background will be removed
- A cut path will be generated

### 4. Test 3D Preview
- The 3D preview should show your design
- Use mouse to rotate and zoom

### 5. Test Payment Flow (Stripe Test Mode)
- Click "Order Printed Stickers"
- Use Stripe test card: 4242 4242 4242 4242
- Any future expiry date, any CVC
- Complete the checkout

### 6. Test Printful Integration
- After successful payment, check Printful dashboard
- Order should be created (in test mode)

## Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Run `pnpm install` to reinstall dependencies
- Clear `.next` folder: `rm -rf .next`

### Supabase Connection Issues
- Check that URLs don't have trailing slashes
- Verify API keys are correct
- Check Row Level Security policies are enabled

### API Rate Limits
- Replicate: May need to upgrade for higher volume
- Remove.bg: 50 free calls/month, then paid
- Stripe: No rate limits in test mode

### 3D Preview Not Loading
- Check browser console for errors
- Ensure WebGL is supported
- Try a different browser

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Environment Variables in Production
- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Use production API keys (not test keys)
- Set up Stripe webhook endpoint
- Configure Supabase production policies

### Post-Deployment
1. Test all flows end-to-end
2. Monitor Supabase usage
3. Monitor API costs (Replicate, Remove.bg)
4. Set up error tracking (Sentry, etc.)

## Cost Estimates

- **Supabase**: Free tier includes 500MB database, 1GB file storage
- **Replicate SDXL**: ~$0.02 per image generation
- **Remove.bg**: 50 free/month, then $0.20 per image
- **Stripe**: 2.9% + $0.30 per transaction
- **Printful**: Cost per order varies by product
- **Vercel**: Free tier for hobby projects, Pro at $20/mo

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the main README.md for project overview
- Review the code comments for implementation details

## Next Steps

After setup, consider:
- Customizing the UI to match your brand
- Adding more sticker product options
- Implementing user profiles
- Adding order history tracking
- Setting up email notifications
- Adding social sharing features
- Implementing design templates
