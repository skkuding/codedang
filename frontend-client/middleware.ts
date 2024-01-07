import { withAuth } from 'next-auth/middleware'

export { withAuth } from 'next-auth/middleware'
export default withAuth({
  callbacks: {
    authorized({ token }) {
      if (token?.role === 'admin') return true
      return false
    }
  }
})
export const config = {
  matcher: ['/admin']
}
