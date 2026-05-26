import { Button } from '@/components/shadcn/button'
import mainBannerImg from '@/public/banners/main_banner.png'
import mobileMainBannerImg from '@/public/banners/mobile_main_banner.svg'
import Link from 'next/link'
import Image from 'next/image'

export function MainBanner() {
  return (
    <div className="relative my-1 w-full max-w-[1380px] overflow-hidden rounded-[8px] lg:rounded-[20px]">
      {/* Desktop View */}
      <div className="hidden h-[440px] md:flex">
        <Image
          src={mainBannerImg}
          alt="Main Banner"
          height={440}
          width={1380}
          className="z-0 object-cover"
          priority
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[96px] tracking-[-0.03em]">
          <div className="flex flex-col items-center">
            <div className="text-head1_b_40 flex flex-col items-center text-black md:text-nowrap">
              <h1>코드당과 함께 오늘의 코드를</h1>
              <h1>내일의 커리어로 만들어보세요</h1>
            </div>
            <div className="text-title2_m_20 text-color-cool-neutral-40 mt-3 flex flex-col items-center whitespace-pre-line">
              <h2>성균관대학교 소프트웨어학과의 공식 학습 플랫폼 코드당에서</h2>
              <h2>한 단계 더 스마트해진 코딩 라이프를 시작하세요.</h2>
            </div>
            <Button className="mt-10 h-[46px] w-[145px] rounded-[1000px] bg-[#21273C] px-6 py-3 text-white">
              <Link
                href={`https://what-is-codedang.framer.website`}
                className="flex items-center"
              >
                <span className="font-pretendard text-[16px] font-medium tracking-[-0.03em]">
                  코드당 시작하기
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile View (render all slides and control visibility by facade) */}
      <div className="mt-[10px] px-[20px] md:hidden">
        <div className="relative h-[164px] w-full">
          <div className="relative h-[164px] w-full overflow-hidden rounded-[8px]">
            <Image
              src={mobileMainBannerImg}
              alt="Mobile Main Banner"
              fill
              className="z-0 object-cover"
              unoptimized
              priority
            />
            <div className="font-pretendard absolute left-[17px] top-[24px] z-10 inline-flex h-[73px] w-[222px] flex-col items-start gap-[4px] text-white">
              <p className="text-[20px] font-medium leading-[130%] tracking-[-0.6px]">
                Your Coding Journey <br />
                Starts Here
              </p>
              <p className="text-color-neutral-90 text-xs font-normal leading-[140%] tracking-[-0.36px]">
                Compete. Grow. SKKU Coding
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
