import { GradeAccordion } from '../_components/GradeAccordion'

export default function Grade() {
  return (
    <div className="mt-6 w-full px-6 py-4">
      <p className="text-2xl font-semibold">Grade</p>
      <GradeAccordion courseId="2" />
    </div>
  )
}
