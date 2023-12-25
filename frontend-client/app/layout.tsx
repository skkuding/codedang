import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const noto = Noto_Sans({ subsets: ['latin'], weight: ['400', '700'] })

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
      <body className={noto.className}>
        <nav className="flex gap-3 p-3">
          <Link href="/">Main</Link>
          <Link href="/notice">Notice</Link>
          <Link href="/contest">Contest</Link>
          <Link href="/group">Group</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
