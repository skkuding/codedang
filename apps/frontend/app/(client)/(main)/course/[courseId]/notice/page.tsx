import { getTranslate } from '@/tolgee/server'

export default async function Notice() {
  const t = await getTranslate()
  return (
    <div className="rounded-xs mt-6 w-full bg-gray-100 p-4">
      {t('notice_message')}
    </div>
  )
}
