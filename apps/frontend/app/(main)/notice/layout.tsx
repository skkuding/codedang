import Cover from '@/components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover
        title="NOTICE"
        description="Events and announcements of CODEDANG"
      />
      <div className="flex w-full max-w-5xl flex-col gap-5 p-5 py-8">
        {children}
      </div>
    </>
  )
}
