import { Button } from '@/components/shadcn/button'
import welcome from '@/public/logos/welcome.png'
import { useAuthModalStore } from '@/stores/authModal'
import Image from 'next/image'

export function SignUpWelcome() {
  const { hideModal } = useAuthModalStore((state) => state)
  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image src={welcome} alt={'welcome'} height={220} width={220} />
        <div className="mt-[25px] text-center">
          <p className="text-xl font-medium">Welcome to Codedang!</p>
          <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
            Your account has been created.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        onClick={hideModal}
      >
        Start the Codedang
      </Button>
    </div>
  )
}
