'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CREATE_PROBLEM } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateProblemInput } from '@generated/graphql'
import { useRouter } from 'next/navigation'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

interface CreateProblemAlertDialogProps {
  open: boolean
  onClose: () => void
}

export default function CreateProblemAlertDialog({
  open,
  onClose
}: CreateProblemAlertDialogProps) {
  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()
  const methods = useFormContext<CreateProblemInput>()

  const [createProblem, { loading }] = useMutation(CREATE_PROBLEM, {
    onError: () => {
      toast.error('Failed to create problem')
    },
    onCompleted: () => {
      setShouldSkipWarning(true)
      toast.success('Problem created successfully')
      router.push('/admin/problem')
      router.refresh()
    }
  })

  const onSubmit = async () => {
    const input = methods.getValues()
    await createProblem({
      variables: {
        groupId: 1,
        input
      }
    })
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="p-8">
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle>Create Problem?</AlertDialogTitle>
          <AlertDialogDescription>
            Once this problem is included in a contest and a user submit any
            <br />
            code in the contest, testcases or time/memory limit{' '}
            <span className="underline">cannot</span> be
            <br />
            modified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            className="rounded-md px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" disabled={loading} onClick={onSubmit}>
              Create
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
