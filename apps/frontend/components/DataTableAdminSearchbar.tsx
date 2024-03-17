import { Input } from './ui/input'

interface DataTableAdminFilterProps {
  table: any
}

export default function DataTableAdminFilter({
  table
}: DataTableAdminFilterProps) {
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
