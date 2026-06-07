export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-30 px-29 inline-flex w-full max-w-[1440px] flex-col">
      {children}
    </div>
  )
}
