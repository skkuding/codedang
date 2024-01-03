import useAuthStore from '@/stores/auth'
import { Transition } from '@headlessui/react'
import SignIn from './SignIn'
import SignUp from './SignUp'

export default function Auth() {
  const { currentModal } = useAuthStore((state) => state)
  return (
    <>
      <Transition
        show={currentModal === 'signIn'}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <SignIn />
      </Transition>
      <Transition
        show={currentModal === 'signUp'}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <SignUp />
      </Transition>
    </>
  )
}
