import MainResizablePanel from './_components/MainResizablePanel'

export default async function ProblemEditor() {
  return (
    <div className="h-dvh w-full flex-col bg-slate-700 text-white">
      <header className="h-[50px] bg-slate-800"></header>
      <div className="h-[50px] border-b border-b-slate-600"></div>
      <main className="h-full border border-slate-600">
        <MainResizablePanel />
      </main>
    </div>
  )
}
