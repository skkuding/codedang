import { getTranslate } from '@/tolgee/server'

export default async function Member() {
  const t = await getTranslate()
  return (
    <div className="rounded-xs mt-6 w-full bg-gray-100 p-4">
      {t('member_title')}
    </div>
  )
}
