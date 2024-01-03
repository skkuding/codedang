import { useState } from 'react'
import SignIn from './SignIn'
import SignUp from './SignUp'

interface Props {
  initialIndex: number
}
export default function Auth({ initialIndex }: Props) {
  const [authIndex, setAuthIndex] = useState<number>(initialIndex)
  const switchModal = () => {
    setAuthIndex(1 - authIndex)
  }
  return authIndex === 0 ? (
    <SignIn switchModal={switchModal} />
  ) : (
    <SignUp switchModal={switchModal} />
  )
}
