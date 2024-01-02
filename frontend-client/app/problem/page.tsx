import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { baseUrl } from '@/lib/vars'
import { FiSearch } from 'react-icons/fi'
import Table from './_components/Table'

export default async function Problem() {
  const res = await fetch(baseUrl + '/problem?take=15')
  const data = await res.json()

  return (
    <>
      <div className="flex text-gray-500">
        <div className="flex flex-1 items-center gap-1 text-xl font-extrabold">
          All
          <p className="text-primary">244{/*추후 숫자 수정*/}</p>
        </div>
        <div className="flex items-center gap-1">
          <Switch />
          <p className="font-bold"> Tags</p>
          <div className="flex items-center py-4">
            <button>
              <FiSearch className="relative left-7 top-2 h-5 w-5 -translate-y-1/2 transform font-bold text-gray-300" />
            </button>
            <Input
              className="max-w-sm border-2 pl-10 font-bold placeholder:font-normal placeholder:text-gray-300"
              placeholder="Keyword..."
            />
          </div>
        </div>
      </div>
      <Table data={data} currentPage={1} />
    </>
  )
}
