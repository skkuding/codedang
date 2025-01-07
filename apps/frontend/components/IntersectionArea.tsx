import { useEffect, type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

interface IntersectionAreaProps {
  children: ReactNode
  disabled: boolean
  onIntersect: () => void
}

export default function IntersectionArea({
  children,
  disabled,
  onIntersect
}: IntersectionAreaProps) {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && !disabled) {
      onIntersect()
    }
  }, [inView, disabled])

  return (
    <>
      {children}
      <div ref={ref} />
    </>
  )
}
