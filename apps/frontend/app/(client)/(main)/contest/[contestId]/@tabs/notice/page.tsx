import { getTranslate } from '@/tolgee/server'

export default async function ContestNotice() {
  const t = await getTranslate()
  return <div>{t('temporary_notice_tab')}</div>
}
