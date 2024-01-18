import React from 'react'
import { RxTriangleDown, RxTriangleUp } from 'react-icons/rx'

interface UpAndDownButtonProps {
  state: string
  name: string
}

export default function UpAndDownButton({ state, name }: UpAndDownButtonProps) {
  return (
    <div>
      {state === `${name}-asc` && (
        <>
          <RxTriangleUp className=" relative top-1.5 h-5 w-5 text-gray-500" />
          <RxTriangleDown className="relative bottom-1.5 h-5 w-5 text-gray-300" />
        </>
      )}
      {state === `${name}-desc` && (
        <>
          <RxTriangleUp className="relative top-1.5 h-5 w-5 text-gray-300" />
          <RxTriangleDown className="relative bottom-1.5 h-5 w-5 text-gray-500" />
        </>
      )}
      {state !== `${name}-asc` && state !== `${name}-desc` && (
        <>
          <RxTriangleUp className="relative top-1.5 h-5 w-5 text-gray-300" />
          <RxTriangleDown className="relative bottom-1.5 h-5 w-5 text-gray-300" />
        </>
      )}
    </div>
  )
}
