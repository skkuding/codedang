import Cover from '@/components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover title="CONTEST" description="Contests of CODEDANG" />
      <div className="flex w-full max-w-5xl flex-col gap-5 p-5">{children}</div>
    </>
  )
}
