import { GradeAccordion } from '../_components/GradeAccordion'

interface GradeProps {
  params: {
    courseId: string
  }
}

export default function Grade({ params }: GradeProps) {
  const { courseId } = params

  return (
    <div className="mt-20 w-full px-6 pb-4">
      <p className="text-2xl font-semibold">Grade</p>
      <GradeAccordion courseId={courseId} />
    </div>
  )
}
