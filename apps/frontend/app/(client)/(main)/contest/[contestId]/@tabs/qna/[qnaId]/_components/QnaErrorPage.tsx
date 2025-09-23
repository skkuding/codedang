import errorImage from '@/public/logos/error.webp'
import Image from 'next/image'

export function ErrorPage({
  errorRes
}: {
  errorRes: { message: string; statusCode: number }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-[218px]">
      <Image
        className="pb-10"
        src={errorImage}
        alt="coming-soon"
        width={300}
        height={300}
      />
      <div className="flex flex-col items-center">
        <h2 className="pb-2 text-xl font-semibold">{errorRes.message}</h2>
        <p className="text-center text-base text-neutral-500">
          {`${errorRes.statusCode ?? 'Unknown'} Error`}
        </p>
      </div>
    </div>
  )
}
