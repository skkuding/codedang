import { SignUpHeader } from '@/components/auth/SignUpPage/SignUpHeader'
import codedangLogoWhite from '@/public/logos/codedang-with-text-white.svg'
import Image from 'next/image'
import { HeaderTitleProvider } from '../(main)/_contexts/HeaderTitleContext'

export default function SignUpLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <HeaderTitleProvider>
      <div className="flex min-h-dvh w-full flex-col items-center overflow-x-hidden">
        <SignUpHeader />
        <main className="relative flex min-h-dvh w-full max-w-[1920px] flex-1 pt-[60px] xl:px-[30px]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/signup/background.png')" }}
          />
          <div className="relative z-10 flex w-full flex-1">
            <section className="relative hidden flex-1 lg:block">
              <div className="fixed left-[254px] top-[414px] flex w-[260px] flex-col items-center gap-[15px]">
                <Image
                  src={codedangLogoWhite}
                  alt="Codedang"
                  width={260}
                  height={56}
                  className="h-auto w-full"
                  priority
                />
                <p className="text-sub3_sb_16 text-white">
                  온라인 코딩 교육 &amp; 대회 플랫폼
                </p>
              </div>
            </section>

            <section className="flex flex-1 items-start justify-end pb-10 pr-[117px] pt-10">
              {children}
            </section>
          </div>
        </main>
      </div>
    </HeaderTitleProvider>
  )
}
