import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Manrope, Noto_Sans_KR } from 'next/font/google'
import Footer from './_components/Footer'
import Header from './_components/Header'
import './globals.css'

const noto = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '600'],
  adjustFontFallback: false,
  variable: '--font-noto'
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600'],
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
      <body>
        <div className="flex min-h-dvh w-screen flex-col items-center overflow-x-hidden">
          <Header />
          <main className="flex w-full max-w-7xl flex-1 flex-col items-center px-5">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="top-center" />
        </div>
      </body>
    </html>
  )
}
