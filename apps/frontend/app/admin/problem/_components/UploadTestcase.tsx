import { Button } from '@/components/shadcn/button'
import { UPLOAD_TESTCASE_ZIP } from '@/graphql/problem/mutations'
import { GET_TESTCASE } from '@/graphql/problem/queries'
import { useQuery, useMutation } from '@apollo/client'
import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

interface UploadTestcaseProps {
  problemId: number
}

export function UploadTestcase({ problemId }: UploadTestcaseProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const { refetch } = useQuery(GET_TESTCASE, { variables: { problemId } })
  const { setValue } = useFormContext()

  const [uploadTestcaseZip] = useMutation(UPLOAD_TESTCASE_ZIP, {
    onCompleted: async () => {
      toast.success('File uploaded successfully')

      const { data } = await refetch()
      setValue('testcases', data.testcases)

      if (data.testcases.some((testcase) => testcase.isTruncated)) {
        toast.warning(
          'Some testcases are over 5KB and have been truncated from this browser.',
          { duration: 60 * 1000 }
        )
      }
    },
    onError: () => {
      toast.error('File upload failed')
    }
  })

  const openFileBrowser = () => {
    fileRef.current?.click()
  }

  const uploadFile = async () => {
    if (!fileRef.current?.files) {
      return
    }
    const selectedFile = fileRef.current.files[0]
    await uploadTestcaseZip({
      variables: {
        input: {
          file: selectedFile,
          problemId
        }
      }
    })
  }

  return (
    <>
      <input
        hidden
        type="file"
        ref={fileRef}
        onChange={uploadFile}
        accept=".zip"
      />
      <Button variant="default" type="button" onClick={openFileBrowser}>
        Upload (.zip)
      </Button>
    </>
  )
}
