import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  })
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      // Get the metadata from the session
      const metadata = session.metadata
      
      if (metadata) {
        // Submit order to Printful
        try {
          await submitToPrintful(metadata)
        } catch (error) {
          console.error('Error submitting to Printful:', error)
        }
      }
      break

    case 'payment_intent.succeeded':
      // Handle successful payment
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function submitToPrintful(metadata: Record<string, string>) {
  const printfulApiKey = process.env.PRINTFUL_API_KEY

  if (!printfulApiKey) {
    console.error('Printful API key not configured')
    return
  }

  // This is a simplified example - you would need to:
  // 1. Upload the design file to Printful
  // 2. Create a product with the design
  // 3. Submit an order

  const response = await fetch('https://api.printful.com/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${printfulApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: {
        name: 'Customer Name',
        address1: 'Customer Address',
        city: 'City',
        state_code: 'State',
        country_code: 'US',
        zip: '12345',
      },
      items: [
        {
          variant_id: 4011, // Example: Kiss Cut Sticker Sheet
          quantity: 1,
          files: [
            {
              url: metadata.imageUrl,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Printful order failed:', error)
    throw new Error('Failed to submit order to Printful')
  }

  const result = await response.json()
  console.log('Printful order created:', result)
}
