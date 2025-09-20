import { Label } from '@/app/admin/_components/Label'

export function AssignmentProblemListLabel() {
  return (
    <div className="flex items-center gap-2">
      <Label required={false}>Problem List</Label>
      <p className="text-[11px] text-[#9B9B9B]">
        You can add or remove problems using the buttons on the left.
      </p>
    </div>
  )
}
