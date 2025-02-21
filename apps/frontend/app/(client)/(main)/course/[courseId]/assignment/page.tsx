import { auth } from '@/libs/auth'
import { AssignmentTable } from '../_components/AssignmentTable'

export default async function Assignment() {
  const session = await auth()
  return (
    <div className="mt-[67px] flex flex-col">
      <div>
        <div className="mb-12 w-full">
          <AssignmentTable session={session} />
        </div>
      </div>
    </div>
  )
}
