export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full justify-center">
      <main className="w-full max-w-7xl p-5">{children}</main>
    </div>
  )
}
