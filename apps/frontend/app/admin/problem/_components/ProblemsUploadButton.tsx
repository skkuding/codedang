'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { UPLOAD_PROBLEMS } from '@/graphql/problem/mutations'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useApolloClient, useMutation } from '@apollo/client'
import { UploadCloudIcon, UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RiFileExcel2Fill } from 'react-icons/ri'
import { useDrop } from 'react-use'
import { toast } from 'sonner'

export function ProblemsUploadButton() {
  const client = useApolloClient()
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
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  const [uploadProblems, { loading }] = useMutation(UPLOAD_PROBLEMS)
  const uploadFile = async () => {
    try {
      await uploadProblems({
        variables: {
          input: {
            file
          }
        }
      })
      toast.success('File uploaded successfully')
      document.getElementById('closeDialog')?.click()
      resetFile()
      client.refetchQueries({
        include: [GET_PROBLEMS]
      })
    } catch {
      toast.error('Failed to upload file')
    }
  }

  return (
    <Modal
      size={'sm'}
      type={'custom'}
      title="Upload Problems"
      trigger={
        <Button variant="outline" className="w-[120px]">
          <UploadIcon className="mr-2 h-5 w-5" />
          <span className="text-sub2_m_18">Upload</span>
        </Button>
      }
    >
      <span className="text-body4_r_14 w-full text-center text-[#737373]">
        {`Please upload Excel file containing problem data. If you are looking for the required schema, you can download `}
        <a href="/sample.xlsx" download className="text-primary underline">
          {`the sample file here.`}
        </a>
      </span>
      <input
        hidden
        type="file"
        ref={fileRef}
        accept=".xlsx"
        onChange={setFileFromInput}
      />
      {file ? (
        <section className="relative flex h-full w-full flex-col items-center justify-center gap-4">
          <div className="text-body4_r_14 flex min-w-60 items-center justify-center gap-2">
            <RiFileExcel2Fill size={20} className="text-[#1D6F42]" />
            {file.name}
          </div>
          <div className="flex w-full justify-center gap-[4px]">
            <Button
              onClick={resetFile}
              disabled={loading}
              className="text-body3_r_16 h-[46px] w-full"
              variant="outline"
            >
              Reset
            </Button>
            <Button
              onClick={uploadFile}
              disabled={loading}
              className="text-body3_r_16 h-[46px] w-full"
              variant="default"
            >
              Upload
            </Button>
          </div>
          {loading && (
            <div className="absolute left-0 top-0 h-full w-full bg-white/20">
              <div className="" /> {/* spinner */}
            </div>
          )}
        </section>
      ) : (
        <section className="flex items-center justify-center gap-3 rounded-lg">
          <UploadCloudIcon className="h-16 w-16 text-slate-800" />
          <p className="text-sub4_sb_14">Drag and Drop or</p>
          <Button
            variant="outline"
            className="text-body4_r_14"
            onClick={openFileBrowser}
          >
            Browse
          </Button>
        </section>
      )}
      {state.over &&
        typeof window === 'object' &&
        createPortal(
          <div className="backdrop-blur-xs fixed left-0 top-0 z-50 grid h-dvh w-dvw place-items-center bg-slate-500/50 text-5xl font-bold">
            Drop file here
          </div>,
          document.body
        )}
    </Modal>
  )
}
