import { Button } from '@/components/ui/button'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'

export default function ResetPassword() {
  const { nextModal } = useRecoverAccountModalStore((state) => state)
  return (
    <>
      <div>ResetPassword</div>
      <Button className="w-full" onClick={() => nextModal()}>
        Next
      </Button>
    </>
  )
}
