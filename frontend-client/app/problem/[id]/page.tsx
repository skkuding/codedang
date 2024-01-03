import MainResizablePanel from './_components/MainResizablePanel'

export default async function ProblemEditor() {
  return (
    <div className="flex h-dvh w-full flex-col bg-slate-700 text-white">
      <header className="h-12 shrink-0 bg-slate-800"></header>
      <main className="flex h-full flex-col border border-slate-600">
        <div className="h-12 shrink-0 border-b border-b-slate-600"></div>
        <MainResizablePanel />
      </main>
    </div>
  )
}
