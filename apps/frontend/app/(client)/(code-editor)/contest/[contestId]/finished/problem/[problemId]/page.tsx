import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { Button } from '@/components/shadcn/button'
import { fetcher } from '@/libs/utils'
import exitIcon from '@/public/icons/exit2.svg'
import visitIcon from '@/public/icons/visit.svg'
import Image from 'next/image'
import Link from 'next/link'

export default async function ContestFinishedPage({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { problemId, contestId } = params

  const isProblemPubliclyAvailable =
    (await fetcher.head(`problem/${problemId}`)).status === 200
  return (
    <>
      <EditorSkeleton />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 text-white backdrop-blur-md">
        <div className="text-center">
          <h1 className="mb-8 text-4xl font-bold">The contest has finished!</h1>
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
            <div className="text-[#B0B0B0]">
              <p className="mb-2 text-xl font-light">
                These problems are no longer available since the contest has
                finished.
              </p>
              <p className="mb-10 text-xl font-light">
                Click the button below to go to the leaderboard.
              </p>
            </div>
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
          <Link href={`/contest/${contestId}/leaderboard`}>
            <Button
              size="icon"
              className="ml-4 h-[46px] w-[209px] shrink-0 gap-[6px] rounded-[10000px] bg-blue-500 text-base hover:bg-blue-700"
            >
              <Image src={exitIcon} alt="exit" width={20} height={20} />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
