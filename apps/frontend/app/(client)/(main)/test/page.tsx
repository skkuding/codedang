import { cn } from '@/libs/utils'

export default function TextPage() {
  return (
    <div className="mt-20 flex flex-col gap-2">
      <p className="text-color-red-40">color</p>
      <p className="text-head1_b_40">font token</p>
      <p className="text-head1_b_40 text-color-red-40">font token + color</p>
      <p className={cn('text-head1_b_40 text-color-red-40')}>
        font token + custom color using cn
      </p>
      <p className={cn('text-head1_b_40 text-gray-500')}>
        font token + tailwind color using cn
      </p>
      <p
        className={cn(
          { 'text-head1_b_40': true },
          { 'text-color-red-40': true }
        )}
      >
        font token + color using cn_1
      </p>
      <p className={cn('text-head1_b_40', { 'text-color-red-40': true })}>
        font token + color using cn_2
      </p>
    </div>
  )
}
