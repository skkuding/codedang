import useAuthStore from '@/stores/auth'
import SignIn from './SignIn'
import SignUp from './SignUp'

export default function Auth() {
  const { currentModal } = useAuthStore((state) => state)
  return currentModal === 'signIn' ? <SignIn /> : <SignUp />
}
