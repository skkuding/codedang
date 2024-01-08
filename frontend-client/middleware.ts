import { getToken } from 'next-auth/jwt'
// import { withAuth } from 'next-auth/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// export default withAuth({
//   callbacks: {
//     authorized({ token }) {
//       return token?.role === 'Admin'
//     }
//   }
// })
// export const config = {
//   matcher: ['/admin/:path*']
// }

export const middleware = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const res = NextResponse.next()
  if (token && (Date.now() >= token.refreshTokenExpires || !token.username)) {
    // If refresh token is expired
    res.cookies.delete('next-auth.session-token')
    res.cookies.delete('__Secure-next-auth.session-token')
  }
  if (
    req.nextUrl.pathname.startsWith('/admin') &&
    (!token || token.role !== 'Admin')
  )
    return NextResponse.redirect(new URL('/', req.url))
  return res
}
