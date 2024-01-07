import { withAuth } from 'next-auth/middleware'

export { withAuth } from 'next-auth/middleware'
export default withAuth({
  callbacks: {
    authorized({ token }) {
      console.log('authorized', token)
      if (token?.role === 'Admin') return true
      return false
    }
  }
})
export const config = {
  matcher: ['/admin']
}
