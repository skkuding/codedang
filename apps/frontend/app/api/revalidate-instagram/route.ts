// app/api/revalidate-instagram/route.ts
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

// This is a GET handler for webhook verification.
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.WEBHOOK_VERIFY_TOKEN')
  const challenge = searchParams.get('hub.challenge')

  // Verify the request came from Facebook
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verification successful!')
    return new NextResponse(challenge, { status: 200 })
  } else {
    console.error('Failed to verify webhook')
    return new NextResponse('Verification failed.', { status: 403 })
  }
}

// event notifications.
export async function POST(request: Request) {
  const body = await request.json()
  console.log('Webhook POST received:', body)

  // Check if the event is an Instagram media update
  if (body.entry && body.entry[0].changes) {
    const changes = body.entry[0].changes
    if (changes[0].field === 'media') {
      console.log('Instagram media update detected. Revalidating cache...')

      // Manually revalidate the cache with the 'instagram-media' tag
      revalidateTag('instagram-media')
    }
  }

  // Always return a 200 OK to acknowledge the event
  return new NextResponse('OK', { status: 200 })
}
