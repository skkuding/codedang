'use client'

import { getJWTExpire } from '@/libs/auth/getJWTExpire'
import { baseUrl } from '@/libs/constants'
import type { User } from '@/types/type'
import { signIn, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function SocialLoginHandler() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
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
        if (result?.error) {
          return
        }
        // 콜백 라우트는 보여줄 내용이 없으므로 벗어난다.
        // 그 밖의 페이지(30분 재확립)에서는 현재 위치를 유지한다.
        if (pathname === '/auth/social-callback') {
          router.replace('/')
        }
        router.refresh()
      } catch (error) {
        console.error('Failed to establish social login session:', error)
      }
    }

    establishSocialSession()
  }, [status, session, router, pathname])

  return null
}
