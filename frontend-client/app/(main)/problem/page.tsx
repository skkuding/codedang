import { Switch } from '@/components/ui/switch'
import { baseUrl } from '@/lib/vars'
import ProblemTable from './_components/ProblemTable'
import SearchBar from './_components/SearchBar'

export default async function Page({
  searchParams
}: {
  searchParams?: { search?: string | undefined }
}) {
  const search = searchParams?.search ?? ''
  const searchRes = await fetch(baseUrl + '/problem?take=15&search=' + search)
  const searchData = await searchRes.json()
  console.log(searchData)
  // const [isTagChecked, setIsTagChecked] = useState(false)
  const problems = searchData ?? []
  return (
    <>
      <div className="flex text-gray-500">
        <div className="flex flex-1 items-center gap-1 text-xl font-extrabold">
          All
          <p className="text-primary">{problems.length}</p>
        </div>
        <div className="flex items-center gap-1">
          <Switch />
          <p className="font-bold"> Tags</p>
          <div className="flex items-center py-4">
            <SearchBar />
          </div>
        </div>
      </div>
      <ProblemTable data={problems} isLoading={!problems} isTagChecked={true} />
      {/*<Paginator page={paginator.page} slot={paginator.slot} setUrl={setUrl} />*/}
    </>
  )
}
