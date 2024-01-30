import useAuthModalStore from '@/stores/authModal'
import SignIn from './SignIn'
import SignUp from './SignUp'

export default function AuthModal() {
  const { currentModal } = useAuthModalStore((state) => state)
  return <>{currentModal === 'signIn' ? <SignIn /> : <SignUp />}</>
}
