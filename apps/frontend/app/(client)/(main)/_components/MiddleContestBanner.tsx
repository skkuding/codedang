import { Button } from '@/components/shadcn/button'
import RightIcon from '@/public/icons/arrow-right-white.svg'
import Image from 'next/image'
import Link from 'next/link'

export function MiddleContestBanner() {
  return (
    <div className="relative flex max-h-[578px] w-full max-w-[1860px]">
      <TextBox className={'z-10'} />
      <ImageBox />
    </div>
  )
}

function TextBox({ className }: { className: String }) {
  return (
    <div
      className={`flex w-full max-w-[707px] items-center rounded-l-[20px] bg-[#182E56] ${className}`}
    >
      {/* 글자 + 버튼 */}
      <div className="text-background ms-[86px] flex h-full max-h-[264px] w-full max-w-[446px] flex-col justify-between">
        {/* 글자 부분 */}
        <div className="flex h-full max-h-[164px] flex-col justify-between">
          <Text className="max-h-[96px] text-[40px] font-semibold leading-[120%]">
            <p>
              {' '}
              TAKE PART IN REAL-TIME
              <br />
              CODING CONTEST
            </p>
          </Text>
          <Text className="text-background-alternative max-h-[48px] text-[16px] font-normal leading-[150%]">
            <p>
              Check your skills, and try to compete in the rankings.
              <br />
              Make it more fun and immersive with real-time rankings!
            </p>
          </Text>
        </div>
        {/* 버튼 부분 */}
        <BarButton />
      </div>
    </div>
  )
}

function Text({
  children,
  className
}: {
  children: JSX.Element
  className: String
}) {
  return (
    <div
      className={`sans vertical-align: middle; tracking-[-0.03em] ${className}`}
    >
      {children}
    </div>
  )
}

function BarButton() {
  return (
    <Button
      variant={'outline'}
      className="h-full max-h-[54px] w-full max-w-[291px] p-0"
    >
      <Link
        // TODO : 버튼 누르면 어디로 이동해야 하죠?
        href={'/'}
        className="flex h-full w-full items-center justify-between px-[4px] py-0"
      >
        <Text className="ms-[26px] max-h-[28px] max-w-[191px] text-[20px] font-medium leading-[140%] text-black">
          <p>How to host a Contest</p>
        </Text>
        <div className="flex h-full max-h-[46px] w-full max-w-[46px] items-center justify-center rounded-full bg-black">
          <div className="text-background relative flex size-[30px] items-center justify-center">
            <Image src={RightIcon} alt="Right" fill />
          </div>
        </div>
      </Link>
    </Button>
  )
}

function ImageBox() {
  return (
    <>
      <ImageMask className="h-full max-h-[183px] w-full max-w-[1153px]" />
      <Image
        src={'/banners/banner_mockup.png'}
        alt="middle_banner"
        width={1153}
        height={928}
        style={{
          objectFit: 'cover'
        }}
        className="-z-10 rounded-r-[20px] sm:relative sm:bottom-0 sm:left-0 sm:pl-0"
      />
    </>
  )
}

function ImageMask({ className }: { className: String }) {
  return (
    <div
      className={`from-background/50 to-background/0 absolute right-0 top-[-48px] bg-gradient-to-b ${className}`}
    ></div>
  )
}
