import Footer from './_components/Footer'
import Header from './_components/Header'
import Provider from './providers'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh w-screen flex-col items-center overflow-x-hidden">
      <Header />
      <main className="flex w-full max-w-7xl flex-1 flex-col items-center px-5">
        <Provider>{children}</Provider>
      </main>
      <Footer />
    </div>
  )
}
