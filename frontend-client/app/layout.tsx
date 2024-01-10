import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Manrope, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const noto = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '600'],
  adjustFontFallback: false,
  variable: '--font-noto'
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: false,
  variable: '--font-manrope'
})

export const metadata: Metadata = {
  title: 'Codedang 코드당',
  description: 'Codedang, Online Judge for SKKU'
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
    <html lang="en" className={cn(noto.variable, manrope.variable)}>
      <body>{children}</body>
    </html>
  )
}
