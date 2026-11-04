import { Button } from '@/components/shadcn/button'
import UploadGrayIcon from '@/public/icons/upload-gray.svg'
import UploadWhiteIcon from '@/public/icons/upload-white.svg'
import { useRef, type ChangeEvent } from 'react'

interface FileUploadButtonProps {
  disabled: boolean
  onSelect: (file: File) => void
}

export function FileUploadButton({
  disabled,
  onSelect
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      onSelect(file)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        size="middle"
        className="text-sub3_sb_16 bg-primary-strong hover:bg-primary-heavy rounded-[10px]"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        {disabled ? (
          <UploadGrayIcon className="size-5" />
        ) : (
          <UploadWhiteIcon className="size-5" />
        )}
        <span className="translate-y-px">파일 업로드</span>
      </Button>
    </>
  )
}
