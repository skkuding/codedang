import { Button } from '@/components/shadcn/button'
import exitIcon from '@/public/icons/exit.svg'
import Image from 'next/image'
import Link from 'next/link'
import type { ErrorResponse } from '../../../_libs/apis/types'
import EditorSkeleton from './EditorSkeleton'

interface ProblemEditorLayoutErrorFallbackProps {
  error: ErrorResponse
}

export async function ProblemEditorLayoutErrorFallback({
  error
}: ProblemEditorLayoutErrorFallbackProps) {
  let message = 'Something went wrong!'

  if (error.statusCode === 404) {
    message = 'Problem does not exist!'
  }

  return (
    <>
      <EditorSkeleton />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 text-white backdrop-blur-md">
        <div className="text-center">
          <h1 className="mb-8 font-mono text-2xl">{message}</h1>
          <Link href={'/problem'}>
            <Button
              size="icon"
              className="ml-4 h-10 w-24 shrink-0 gap-[5px] rounded-[4px] bg-blue-500 font-sans hover:bg-blue-700"
            >
              <Image src={exitIcon} alt="exit" width={20} height={20} />
              Exit
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
