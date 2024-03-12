import { Input } from './ui/input'

interface DataTableAdminSearchbarProps {
  table: any
}

export default function DataTableAdminSearchbar({
  table
}: DataTableAdminSearchbarProps) {
  return (
    <Input
      placeholder="Search"
      value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
      onChange={(event) =>
        table.getColumn('title')?.setFilterValue(event.target.value)
      }
      className="h-10 w-[150px] lg:w-[250px]"
    />
  )
}
