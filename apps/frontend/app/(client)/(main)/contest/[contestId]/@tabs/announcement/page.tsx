import { fetcher } from '@/libs/utils'
import { getTranslate } from '@/tolgee/server'
import type { ContestAnnouncement } from '@/types/type'
import { AnnouncementTable } from './_components/AnnouncementTable'

interface ContestAnnouncementProps {
  params: Promise<{ contestId: string }>
}

export default async function ContestAnnouncement(
  props: ContestAnnouncementProps
) {
  const { contestId } = await props.params
  const contestAnnouncements: ContestAnnouncement[] = await fetcher
    .get('announcement', {
      searchParams: {
        contestId
      }
    })
    .json()
  const t = await getTranslate()
  return (
    <div className="pb-[120px]">
      <p className="my-20 text-left text-2xl font-semibold">
        {t('announcement_title')}
      </p>
      <AnnouncementTable contestAnnouncements={contestAnnouncements} />
    </div>
  )
}
