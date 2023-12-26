import type { ContestStatus } from './Card'

const badgeVariants = {
  ongoing: 'bg-[#b6eb8d]',
  upcoming: 'bg-[#feb144]',
  finished: 'bg-[#737d81]'
}

export default function Badge({ status }: { status: ContestStatus }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-3xl bg-white px-3 py-1">
      <div className={`h-4 w-4 rounded-full ${badgeVariants[status]}`}></div>
      <div className="text-gray-500">{status}</div>
    </div>
  )
}
