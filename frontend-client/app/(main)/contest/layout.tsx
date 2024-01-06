import Cover from '@/components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover
        title="Contest"
        description="Contests of SKKU Coding Platform"
        bgColor="bg-gray-800"
      />
      <div className="flex w-full max-w-5xl flex-col gap-5 p-5 py-8 md:py-12">
        {children}
      </div>
    </>
  )
}
