import { AuthProvider } from '@/components/auth/AuthProvider'
import { Toaster } from '@/components/shadcn/sonner'
import { auth } from '@/libs/auth'
import { metaBaseUrl } from '@/libs/constants'
import { getBootstrapData } from '@/libs/posthog.server'
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './globals.css'
import { PostHogProvider } from './posthog'

// TODO: 추후에 페이지 별로 revalidate 시간 논의 및 조정 필요
export const revalidate = 5

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Codedang 코드당',
  description: 'Codedang, Online Judge for SKKU',
  metadataBase: metaBaseUrl
    ? new URL(
        !metaBaseUrl.startsWith('http') ? `https://${metaBaseUrl}` : metaBaseUrl
      )
    : null
}

export const viewport: Viewport = {
  themeColor: '#3581FA'
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const bootstrapData = await getBootstrapData()
  const session = await auth()
  // ✅ 1. 환경 변수를 변수에 할당합니다.
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" className={mono.variable}>
      <body>
        <PostHogProvider bootstrap={bootstrapData}>
          {/**NOTE: remove comment if you want to track page view of users */}
          {/* <PostHogPageView /> */}
          <AuthProvider session={session}>{children}</AuthProvider>
          <Toaster
            richColors
            position="top-center"
            closeButton={true}
            duration={2000}
          />
        </PostHogProvider>

        {/* ✅ 2. gaId가 존재할 때만 GoogleAnalytics 컴포넌트를 렌더링합니다. */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  )
}
