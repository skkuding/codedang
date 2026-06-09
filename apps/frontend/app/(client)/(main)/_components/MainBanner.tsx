import { Button } from '@/components/shadcn/button'
import mobileMainBannerImg from '@/public/banners/mobile_main_banner.svg'
import Image from 'next/image'
import Link from 'next/link'

export function MainBanner() {
  return (
    <div className="relative my-1 w-full max-w-[1380px] overflow-hidden rounded-[8px] px-10 lg:rounded-[20px]">
      {/* Desktop View */}
      <div className="hidden h-[440px] flex-col items-center justify-center md:flex">
        <div className="absolute inset-0 bg-[url(/banners/main_banner.png)] bg-cover bg-center blur-[6px]" />

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-head1_b_40 flex flex-col items-center text-black md:text-nowrap">
            <span>코드당과 함께 오늘의 코드를</span>
            <span>내일의 커리어로 만들어보세요</span>
          </p>
          <p className="text-title2_m_20 text-color-cool-neutral-40 mt-3 flex flex-col items-center whitespace-pre-line">
            <span>
              성균관대학교 소프트웨어학과의 공식 학습 플랫폼 코드당에서
            </span>
            <span>한 단계 더 스마트해진 코딩 라이프를 시작하세요.</span>
          </p>
          <Button className="mt-10 h-[46px] w-[145px] rounded-[1000px] bg-[#21273C] px-6 py-3 text-white">
            <Link
              href={`https://what-is-codedang.framer.website`}
              className="flex cursor-pointer items-center"
            >
              <span className="text-[16px] font-medium tracking-[-0.03em]">
                코드당 시작하기
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile View (render all slides and control visibility by facade) */}
      <div className="mt-[10px] px-[20px] md:hidden">
        <div className="relative h-[164px] w-full overflow-hidden rounded-[8px]">
          <Image
            src={mobileMainBannerImg}
            alt="Mobile Main Banner"
            fill
            className="object-cover"
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
  )
}
