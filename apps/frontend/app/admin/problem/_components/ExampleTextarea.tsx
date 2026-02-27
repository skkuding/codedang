import { Textarea } from '@/components/shadcn/textarea'
import { cn } from '@/libs/utils'
import { getTranslate } from '@/tolgee/server'

interface ExampleTextareaProps {
  onRemove: () => void
  inputName: string
  outputName: string
  className?: string
  // TODO: any를 다른 type으로 대체
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  blockEdit?: boolean
}
export async function ExampleTextarea({
  onRemove,
  inputName,
  outputName,
  className,
  register,
  blockEdit
}: ExampleTextareaProps) {
  const t = await getTranslate()

  return (
    <div
      className={cn(
        'relative flex min-h-[164px] w-full justify-between gap-2 bg-white font-mono',
        className
      )}
    >
      {/* {!blockEdit && (
        <button
          type="button"
          className="absolute right-2 top-2 w-3 p-0 text-gray-400"
          onClick={onRemove}
        >
          <RxCross2 />
        </button>
      )} */
      /* <Textarea
        disabled={blockEdit}
        placeholder="Input"
        className="resize-none border-0 px-0 py-0 shadow-none focus-visible:ring-0"
        {...register(inputName)}
      />
      <Textarea
        disabled={blockEdit}
        placeholder="Output"
        className="min-h-[120px] rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 shadow-none focus-visible:ring-0"
        {...register(outputName)}
      /> */}
      <div className="shadow-2xs relative flex min-h-[164px] w-full justify-between gap-2 rounded-xl border border-[#D8D8D8] bg-white px-6 py-4 font-mono">
        <Textarea
          disabled={blockEdit}
          placeholder={t('input_textarea_placeholder')}
          className="resize-none border-0 px-0 py-0 shadow-none focus-visible:ring-0"
          {...register(inputName)}
        />
      </div>
      <div className="shadow-2xs relative flex min-h-[164px] w-full justify-between gap-2 rounded-xl border border-[#D8D8D8] bg-white px-6 py-4 font-mono">
        <Textarea
          disabled={blockEdit}
          placeholder={t('output_textarea_placeholder')}
          className="resize-none border-0 px-0 py-0 shadow-none focus-visible:ring-0"
          {...register(outputName)}
        />
      </div>
    </div>
  )
}
