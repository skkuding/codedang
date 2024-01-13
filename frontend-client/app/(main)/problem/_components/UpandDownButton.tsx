import React from 'react'
import { RxTriangleDown, RxTriangleUp } from 'react-icons/rx'

interface UpAndDownButtonProps {
  state: boolean | 'asc' | 'desc'
}

export default function UpAndDownButton({ state }: UpAndDownButtonProps) {
  return (
    <div>
      {state === 'asc' && (
        <>
          <RxTriangleUp className=" relative top-1.5 h-5 w-5 text-gray-500" />
          <RxTriangleDown className="relative bottom-1.5 h-5 w-5 text-gray-300" />
        </>
      )}
      {state === 'desc' && (
        <>
          <RxTriangleUp className="relative top-1.5 h-5 w-5 text-gray-300" />
          <RxTriangleDown className="relative bottom-1.5 h-5 w-5 text-gray-500" />
        </>
      )}
      {state === false && (
        <>
          <RxTriangleUp className="relative top-1.5  h-5 w-5 text-gray-300" />
          <RxTriangleDown className="relative bottom-1.5 h-5 w-5 text-gray-300" />
        </>
      )}
    </div>
  )
}
