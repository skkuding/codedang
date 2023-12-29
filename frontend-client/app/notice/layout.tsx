import Cover from '@/components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center">
      <Cover
        title="Notice"
        description="Events and announcements of SKKU Coding Platform"
      />
      <div className="flex w-full max-w-5xl flex-col gap-5 p-5 py-8 md:py-12">
        {children}
      </div>
    </div>
  )
}
