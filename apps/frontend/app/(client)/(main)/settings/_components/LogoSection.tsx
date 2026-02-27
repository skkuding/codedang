import codedangSymbol from '@/public/logos/codedang-editor.svg'
import Image from 'next/image'

export function LogoSection() {
  return (
    <div
      className="hidden h-svh max-h-[846px] w-full flex-col items-center justify-center gap-3 rounded-2xl md:flex"
      style={{
        background: `var(--banner,
            linear-gradient(325deg, rgba(79, 86, 162, 0.00) 28.16%, rgba(79, 86, 162, 0.50) 93.68%),
            linear-gradient(90deg, #3D63B8 0%, #0E1322 100%)
          )`
      }}
    >
      <div className="flex items-center gap-3">
        <Image src={codedangSymbol} alt="codedang" width={65} />
        <p className="text-head1_b_40 font-mono text-white">CODEDANG</p>
      </div>
      <p className="text-body1_m_16 text-white">
        Online Judge Platform for SKKU
      </p>
    </div>
  )
}
