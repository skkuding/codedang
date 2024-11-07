import codedangSymbol from '@/public/codedang-editor.svg'
import Image from 'next/image'

export default function LogoSection() {
  return (
    <div
      className="flex h-svh max-h-[846px] w-full flex-col items-center justify-center gap-3 rounded-2xl"
      style={{
        background: `var(--banner,
            linear-gradient(325deg, rgba(79, 86, 162, 0.00) 28.16%, rgba(79, 86, 162, 0.50) 93.68%),
            linear-gradient(90deg, #3D63B8 0%, #0E1322 100%)
          )`
      }}
    >
      <div className="flex items-center gap-3">
        <Image src={codedangSymbol} alt="codedang" width={65} />
        <p className="font-mono text-[40px] font-bold text-white">CODEDANG</p>
      </div>
      <p className="font-medium text-white">Online Judge Platform for SKKU</p>
    </div>
  )
}
