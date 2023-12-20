import ButtonWithModal from '@/components/ButtonWithModal'
import Signin from '@/components/Signin'

export default function Home() {
  return (
    <main>
      <ButtonWithModal buttonText="Sign in" buttonVariant={'outline'}>
        <Signin />
      </ButtonWithModal>
    </main>
  )
}
