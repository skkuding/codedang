import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import Footer from './_components/Footer'
import Header from './_components/Header'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '600', '700'] })

export const metadata: Metadata = {
  title: 'Codedang 코드당',
  description: 'Codedang, Online Judge for SKKU'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <div className="h-dvh flex w-screen flex-col overflow-hidden">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
