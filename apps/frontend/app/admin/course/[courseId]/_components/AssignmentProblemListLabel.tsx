import { Label } from '@/app/admin/_components/Label'
import { getTranslate } from '@/tolgee/server'

export async function AssignmentProblemListLabel() {
  const t = await getTranslate()
  return (
    <div className="flex items-center gap-2">
      <Label required={false}>{t('problem_list_label')}</Label>
      <p className="text-[11px] text-[#9B9B9B]">{t('problem_list_info')}</p>
    </div>
  )
}
