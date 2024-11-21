import { Button } from '@/components/shadcn/button'
import { fetcher } from '@/libs/utils'
import exitIcon from '@/public/icons/exit.svg'
import visitIcon from '@/public/icons/visit.svg'
import Image from 'next/image'
import Link from 'next/link'
import ContestEditorSkeleton from './_components/ContestEditorSkeleton'

export default async function ContestFinishedPage({
  params
}: {
  params: { problemId: number; contestId: number }
}) {
  const { problemId, contestId } = params

  const isProblemPubliclyAvailable =
    (await fetcher.head(`problem/${problemId}`)).status === 200
  return (
    <>
      <ContestEditorSkeleton></ContestEditorSkeleton>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 text-white backdrop-blur-md">
        <div className="text-center">
          <h1 className="mb-8 font-mono text-2xl">The contest has finished!</h1>
          {isProblemPubliclyAvailable ? (
            <>
              <p className="mb-2 font-sans font-light">
                You can solve the public problem regardless of scoring,
              </p>
              <p className="mb-10 font-sans font-light">
                or click the exit button below to exit the page.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 font-sans font-light">
                This problem is now unavailable to students.
              </p>
              <p className="mb-10 font-sans font-light">
                Click the button below to exit the page.
              </p>
            </>
          )}
          {isProblemPubliclyAvailable && (
            <Link href={`/problem/${problemId}`}>
              <Button
                size="icon"
                className="h-10 w-48 shrink-0 gap-[5px] rounded-[4px] border border-blue-500 bg-blue-100 font-sans text-blue-500 hover:bg-blue-300"
              >
                <Image src={visitIcon} alt="exit" width={20} height={20} />
                Visit Public Problem
              </Button>
            </Link>
          )}
          <Link href={`/contest/${contestId}/problem`}>
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
