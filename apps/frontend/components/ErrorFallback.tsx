import { RiAlertFill } from 'react-icons/ri'

export default function ErrorFallback({
  title = 'Failed to load data!',
  description = 'Please try again'
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex w-full flex-col items-center py-6">
      <RiAlertFill className="text-gray-300" size={42} />
      <p className="text-2xl font-bold">{title}</p>
      <p>{description}</p>
    </div>
  )
}
