import { baseUrl } from '@/lib/vars'
import ProblemTable from './_components/ProblemTable'
import SearchBar from './_components/SearchBar'
import TagSwitch from './_components/TagSwitch'

export default async function Page({
  searchParams
}: {
  searchParams?: { search?: string; tag?: string }
}) {
  const search = searchParams?.search ?? ''
  const searchRes = await fetch(
    baseUrl +
      '/problem?' +
      new URLSearchParams({
        take: '15',
        search: search ?? ''
      })
  ) /* take 값 조정 필요*/
  const searchData = await searchRes.json()
  const problems = searchData ?? []

  return (
    <>
      <div className="flex text-gray-500">
        <div className="flex flex-1 items-center gap-1 text-xl font-extrabold">
          All
          <p className="text-primary">{problems.length}</p>
        </div>
        <div className="flex items-center gap-1">
          <TagSwitch />
          <p className="font-bold"> Tags</p>
          <div className="flex items-center py-4">
            <SearchBar />
          </div>
        </div>
      </div>
      <ProblemTable
        data={problems}
        isLoading={!problems}
        isTagChecked={searchParams?.tag === 'tag'}
      />
      {/*<Paginator page={paginator.page} slot={paginator.slot} setUrl={setUrl} />*/}
    </>
  )
}
