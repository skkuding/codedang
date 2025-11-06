// app/my_api/webhook-instagram/route.ts
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

// GET: Facebook webhook verification
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    if (typeof challenge === 'string') {
      console.log('Safe challenge verified.')
      return new NextResponse(challenge, { status: 200 })
    }
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST: Instagram event notifications
// export async function POST(request: Request) {
//   const body = await request.json()
//   console.log('Webhook POST received:', body)

//   if (body.entry?.[0]?.changes?.[0]?.field === 'media') {
//     console.log('Instagram media update detected. Revalidating cache...')
//     await revalidateTag('instagram-media')
//   }

//   return new NextResponse('OK', { status: 200 })
// }
