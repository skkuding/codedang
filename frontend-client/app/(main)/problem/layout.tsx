import Cover from '@/components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover
        title="Problem"
        description="All the problems by CODEDANG"
        bgColor="bg-gray-500"
      />
      <div className="flex w-full max-w-5xl flex-col gap-5 p-5 py-8 md:py-12">
        {children}
      </div>
    </>
  )
}
