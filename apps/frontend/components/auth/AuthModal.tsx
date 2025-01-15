import { useAuthModalStore } from '@/stores/authModal'
import { Transition } from '@headlessui/react'
import { RecoverAccount } from './RecoverAccount/RecoverAccount'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp/SignUp'

export function AuthModal() {
  const { currentModal } = useAuthModalStore((state) => state)
  return (
    <>
      <Transition
        as="div"
        show={currentModal === 'signIn'}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <SignIn />
      </Transition>
      <Transition
        as="div"
        show={currentModal === 'signUp'}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <SignUp />
      </Transition>
      <Transition
        as="div"
        show={currentModal === 'recoverAccount'}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <RecoverAccount />
      </Transition>
    </>
  )
}
