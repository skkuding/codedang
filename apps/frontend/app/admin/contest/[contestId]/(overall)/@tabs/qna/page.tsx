import { Button } from '@/components/shadcn/button'
import comingSoonLogo from '@/public/logos/coming-soon.png'
import Image from 'next/image'
import { QnaDetailButton } from './_components/QnaDetailButton'

export default function AdminContestQna() {
  return (
    <div className="flex flex-col items-center justify-center py-[218px]">
      <Image
        className="pb-10"
        src={comingSoonLogo}
        alt="coming-soon"
        width={300}
        height={300}
      />
      <div className="flex flex-col items-center">
        <h2 className="pb-2 text-xl font-semibold">COMING SOON!</h2>
        <p className="text-center text-base text-neutral-500">
          This page is being prepared.
          <br /> We will provide an update as soon as possible.
        </p>
        <QnaDetailButton
          trigger={<Button>Go to qna detail page</Button>}
          qnaId="2"
        />
      </div>
    </div>
  )
}
