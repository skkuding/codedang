'use client'

import { useParams } from 'next/navigation'
import { ParticipantTable } from './_components/ParticipantTable'

export default function Assessment() {
  const { courseId } = useParams() // 경로에서 params 가져오기
  const { assignmentId } = useParams() // 경로에서 params 가져오기
  return (
    <div>
      <ParticipantTable
        groupId={Number(courseId)}
        assignmentId={Number(assignmentId)}
      />
    </div>
  )
}
