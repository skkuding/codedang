import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'

export const middleware = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (
    req.nextUrl.pathname.startsWith('/admin') &&
    (!token || token.role !== 'Admin')
  )
    return NextResponse.redirect(new URL('/', req.url))
  return NextResponse.next()
}
