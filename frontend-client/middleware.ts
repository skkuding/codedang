import { withAuth } from 'next-auth/middleware'

export { withAuth } from 'next-auth/middleware'
export default withAuth({
  callbacks: {
    authorized({ token }) {
      return token?.role === 'Admin'
    }
  }
})
export const config = {
  matcher: ['/admin/:path*']
}
