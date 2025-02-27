import type { Assignment } from '@/types/type'
import { AssignmentModal } from './_components/AssignmentModal'

export const sampleAssignment: Assignment = {
  id: 1,
  title: 'Midterm Exam',
  startTime: new Date('2025-03-10T09:00:00Z'),
  endTime: new Date('2025-03-10T11:00:00Z'),
  group: {
    id: 'g1',
    groupName: 'Computer Science 101'
  },
  enableCopyPaste: false,
  isJudgeResultVisible: true,
  week: 5,
  status: 'ongoing', // Assuming AssignmentStatus is an enum or type
  description: 'This is the midterm exam covering chapters 1-5.',
  isRegistered: true,
  problemNumber: 5,
  submittedNumber: 20
}

export default function Grade() {
  return <AssignmentModal assignment={sampleAssignment} />
}
