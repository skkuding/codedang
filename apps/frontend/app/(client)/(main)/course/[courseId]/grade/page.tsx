import { GradeAccordion } from '../_components/GradeAccordion'

interface GradeProps {
  params: {
    courseId: string
  }
}

export default function Grade({ params }: GradeProps) {
  const { courseId } = params

  return (
    <div className="mt-6 w-full px-6 py-4">
      <p className="text-2xl font-semibold">Grade</p>
      <GradeAccordion courseId={courseId} />
    </div>
  )
}
