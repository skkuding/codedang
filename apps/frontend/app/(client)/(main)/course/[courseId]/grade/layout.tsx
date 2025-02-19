import { GradeTab } from './_components/GradeTab'

export default function Layout({ tabs }: { tabs: React.ReactNode }) {
  return (
    <div className="mt-28 flex flex-col">
      <nav>
        <GradeTab courseId={'4'} />
      </nav>
      <article>
        <div>{tabs}</div>
      </article>
    </div>
  )
}
