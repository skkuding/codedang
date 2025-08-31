import { fetchInstagramMedia } from '@/libs/instagram'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await fetchInstagramMedia()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
