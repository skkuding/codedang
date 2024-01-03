import Footer from './_components/Footer'
import Header from './_components/Header'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex w-full max-w-7xl flex-1 flex-col items-center px-5">
        {children}
      </main>
      <Footer />
    </>
  )
}
