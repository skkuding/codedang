import comingSoonLogo from '@/public/logos/coming-soon.png'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex flex-col items-center justify-center py-[218px]">
        <Image
          className="pb-10"
          src={comingSoonLogo}
          alt="coming-soon"
          width={300}
          height={300}
        />
        <div className="flex flex-col items-center">
          <h2 className="text-title1_sb_20 pb-2">COMING SOON!</h2>
          <p className="text-body3_r_16 text-center text-neutral-500">
            This page is being prepared.
            <br /> We will provide an update as soon as possible.
          </p>
        </div>
      </div>
    </div>
  )
}
