import { Toaster } from '@/components/ui/sonner'
import Footer from './_components/Footer'
import Header from './_components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center overflow-x-hidden">
      <Header />
      <main className="flex w-full max-w-7xl flex-1 flex-col items-center px-5">
        {children}
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  )
}
