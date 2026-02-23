import codedangSymbol from '@/public/logos/codedang-editor.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export function LogoSection() {
  const { t } = useTranslate()
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
        <Image src={codedangSymbol} alt={t('codedang_logo_alt')} width={65} />
        <p className="font-mono text-[40px] font-bold text-white">CODEDANG</p>
      </div>
      <p className="font-medium text-white">{t('online_judge_platform')}</p>
    </div>
  )
}
