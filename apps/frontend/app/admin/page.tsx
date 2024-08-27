import welcomeLogo from '@/public/welcome.svg'
import Image from 'next/image'

export default function Page() {
  return (
    <main className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
      <Image
        className="pb-10"
        src={welcomeLogo}
        alt="welcome"
        width={454}
        height={262}
      />
      <p className="text-center font-['IBM_Plex_Mono'] text-[40px] font-bold leading-[46px] text-[#0760EF]">
        Thanks for using CODEDANG!
      </p>
      <p className="text-slate-[#000] gap-6 text-center font-light leading-[50px]">
        Easily manage problems and contests on the management page.
      </p>
    </main>
  )
}
