import { Footer } from './_components/Footer'
import { Header } from './_components/Header'
import { HeaderTitleProvider } from './_contexts/HeaderTitleContext'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <HeaderTitleProvider>
      <div className="flex min-h-dvh w-full flex-col items-center overflow-x-hidden">
        <Header />
        {/* NOTE: 새로 바뀐 GNB,캐러셀 디자인으로 mt-14 제거 -> 다른 페이지에 일괄 적용되므로 팀원들과 상의 */}
        <main className="flex w-full max-w-[1920px] flex-1 flex-col items-center px-0 xl:px-[30px]">
          {children}
        </main>
        <Footer />
      </div>
    </HeaderTitleProvider>
  )
}
