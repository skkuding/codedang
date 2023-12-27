import Cover from '@/components/Cover'

export default function Notice() {
  return (
    <div className="flex w-full flex-col justify-center">
      <Cover
        title="Notice"
        description="Events and announcements of SKKU Coding Platform"
      />
      <main className="w-full max-w-7xl p-5">notice</main>
    </div>
  )
}
