import { Button } from '@/components/ui/button'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'

export default function FindUserId() {
  const { nextModal } = useRecoverAccountModalStore((state) => state)
  return (
    <>
      <div>FindUserId</div>
      <Button className="w-full" onClick={() => nextModal()}>
        Next
      </Button>
    </>
  )
}
