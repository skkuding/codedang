import { authOptions } from '@/libs/auth/authOptions'
import NextAuth from 'next-auth'
import type { NextRequest } from 'next/server'

interface RouteHandlerContext {
  params: { nextauth: string[] }
}

const handler = async (req: NextRequest, res: RouteHandlerContext) => {
  return NextAuth(req, res, authOptions)
}

export { handler as GET, handler as POST }
