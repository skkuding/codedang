import { EditorDescription } from '@/app/(client)/(code-editor)/_components/EditorDescription'
import { ChannelIO } from '@/components/ChannelIO'

export default function ContestProblemPage() {
  return (
    <>
      <EditorDescription isContest={true} />
      <ChannelIO />
    </>
  )
}
