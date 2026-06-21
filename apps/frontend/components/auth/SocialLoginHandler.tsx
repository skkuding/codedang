'use client'

import { getJWTExpire } from '@/libs/auth/getJWTExpire'
import { baseUrl } from '@/libs/constants'
import type { User } from '@/types/type'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Establishes a NextAuth session for users who just logged in via Kakao redirect.
 * The BE sets the refresh_token cookie and redirects straight to '/', but that cookie
 * is httpOnly and path-scoped to /auth/reissue, so NextAuth's session never gets created
 * automatically. This calls /auth/reissue directly from the browser (same-origin in
 * stage/prod, so the cookie is sent automatically) to mint a session.
 */
export function SocialLoginHandler() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const attempted = useRef(false)

  useEffect(() => {
    if (status !== 'unauthenticated' || session || attempted.current) {
      return
    }
    attempted.current = true

    const establishSocialSession = async () => {
      try {
        const reissueRes = await fetch(`${baseUrl}/auth/reissue`, {
          credentials: 'include'
        })
        if (!reissueRes.ok) {
          return
        }

        const accessToken = reissueRes.headers.get('authorization')
        if (!accessToken) {
          return
        }

        const accessTokenExpires = getJWTExpire(accessToken)

        const userRes = await fetch(`${baseUrl}/user`, {
          headers: { Authorization: accessToken }
        })
        if (!userRes.ok) {
          return
        }

        const user: User = await userRes.json()

        const result = await signIn('social', {
          username: user.username,
          role: user.role,
          accessToken,
          accessTokenExpires: String(accessTokenExpires),
          redirect: false
        })

        if (!result?.error) {
          router.refresh()
        }
      } catch (error) {
        console.error('Failed to establish social login session:', error)
      }
    }

    establishSocialSession()
  }, [status, session, router])

  return null
}
