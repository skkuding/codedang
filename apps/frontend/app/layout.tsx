import { Toaster } from '@/components/ui/sonner'
import { metaBaseUrl } from '@/libs/constants'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './globals.css'

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

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        {children}
        <Toaster
          richColors
          position="top-center"
          closeButton={true}
          duration={2000}
        />
      </body>
    </html>
  )
}
