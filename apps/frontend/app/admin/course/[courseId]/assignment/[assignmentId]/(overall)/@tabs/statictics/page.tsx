interface StatisticsProps {
  params: { courseId: string; assignmentId: string }
}

export default function Statistics({ params }: StatisticsProps) {
  return (
    <main className="flex flex-col gap-6 px-20 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">Statistics</span>
        </div>
      </div>
    </main>
  )
}
