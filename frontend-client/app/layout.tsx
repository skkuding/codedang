import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
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
        <div className="w-screen overflow-hidden">
          <Header />
          {children}
        </div>
      </body>
    </html>
  )
}
