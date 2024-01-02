import { baseUrl } from '@/lib/vars'
import Table from './_components/Table'

export default async function Problem() {
  const res = await fetch(baseUrl + '/problem?take=15')
  const data = await res.json()

  return (
    <>
      <Table data={data} currentPage={1} />
    </>
  )
}
