import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { metaBaseUrl } from '@/lib/vars'
import type { Metadata, Viewport } from 'next'
import { Manrope, Noto_Sans_KR, Ubuntu_Mono } from 'next/font/google'
import './globals.css'

// TODO: 추후에 페이지 별로 revalidate 시간 논의 및 조정 필요
export const revalidate = 5

const noto = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-noto'
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope'
})

const mono = Ubuntu_Mono({
  subsets: ['latin'],
  weight: ['400'],
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
    <html
      lang="en"
      className={cn(noto.variable, manrope.variable, mono.variable)}
    >
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
