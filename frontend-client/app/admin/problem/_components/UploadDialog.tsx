import { gql } from '@generated'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useMutation } from '@apollo/client'
import { UploadIcon, UploadCloudIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RiFileExcel2Fill } from 'react-icons/ri'
import { useDrop } from 'react-use'
import { toast } from 'sonner'

const UPLOAD_PROBLEMS = gql(`
  mutation uploadProblems ($groupId: Int!, $input: UploadFileInput!) {
    uploadProblems(groupId: $groupId, input: $input) {
      id
    }
  }
`)

export default function UploadDialog() {
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const state = useDrop({
    onFiles: (files) => {
      if (files.length > 1) {
        toast.error('Only one file is allowed')
      }
      const file = files[0]
      if (file.name.endsWith('.xlsx')) {
        setFile(files[0])
      } else {
        toast.error('Only .xlsx files are allowed')
      }
    }
  })

  const openFileBrowser = () => {
    fileRef.current?.click()
  }

  const setFileFromInput = () => {
    if (fileRef.current?.files) {
      setFile(fileRef.current.files[0])
    }
  }

  const resetFile = () => {
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const [uploadProblems, { error }] = useMutation(UPLOAD_PROBLEMS)
  const uploadFile = async () => {
    await uploadProblems({
      variables: {
        groupId: 1,
        input: {
          file
        }
      }
    })
    // resetFile()
    if (error) {
      toast.error('Failed to upload file')
    } else {
      toast.success('File uploaded successfully')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[24rem] w-[32rem] flex-col">
        <h1 className="my-2 text-2xl font-bold">Upload Problem</h1>
        <p className="text-sm">
          Please upload Excel file containing problem data. If you are looking
          for the required schema, you can download{' '}
          <a href="/sample.xlsx" download className="text-primary underline">
            the sample file here.
          </a>
        </p>
        <input
          hidden
          type="file"
          ref={fileRef}
          accept=".xlsx"
          onChange={setFileFromInput}
        />
        {file ? (
          <section className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="flex min-w-60 items-center justify-center gap-2 border-4 border-dotted p-8 text-sm">
              <RiFileExcel2Fill size={20} className="text-[#1D6F42]" />
              {file.name}
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={resetFile}>
                Reset
              </Button>
              <Button variant="default" size="sm" onClick={uploadFile}>
                Upload
              </Button>
            </div>
          </section>
        ) : (
          <section className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-slate-100">
            <UploadCloudIcon className="h-16 w-16 text-slate-800" />
            <p className="text-sm font-semibold">Drag and Drop</p>
            <p className="text-sm">or</p>
            <Button
              variant="outline"
              className="mt-2 text-sm"
              size="sm"
              onClick={openFileBrowser}
            >
              Browse
            </Button>
          </section>
        )}
        {state.over &&
          typeof window === 'object' &&
          createPortal(
            <div className="fixed left-0 top-0 z-50 grid h-dvh w-dvw place-items-center bg-slate-500/50 text-5xl font-bold backdrop-blur">
              Drop file here
            </div>,
            document.body
          )}
      </DialogContent>
    </Dialog>
  )
}
