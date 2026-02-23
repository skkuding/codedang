'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { GET_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/queries'
import { useLazyQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { useEffect, useMemo, useState } from 'react'
import { FaCommentDots } from 'react-icons/fa'

function htmlToText(html: string) {
  if (!html) {
    return ''
  }
  const div = document.createElement('div')
  div.innerHTML = html
  return div.innerText.trim()
}

export function CommentCell({
  groupId,
  assignmentId,
  userId,
  problemId
}: {
  groupId: number
  assignmentId: number
  userId: number
  problemId: number
}) {
  const [open, setOpen] = useState(false)

  const [loadComment, { data, loading, error, called, refetch }] = useLazyQuery(
    GET_ASSIGNMENT_PROBLEM_RECORD,
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true
    }
  )

  useEffect(() => {
    if (open) {
      loadComment({
        variables: { groupId, assignmentId, userId, problemId }
      })
    }
  }, [open, loadComment, groupId, assignmentId, userId, problemId])

  useEffect(() => {
    if (open && called && refetch) {
      refetch({ groupId, assignmentId, userId, problemId })
    }
  }, [open, called, refetch, groupId, assignmentId, userId, problemId])

  const raw = data?.getAssignmentProblemRecord?.comment ?? ''
  const plain = htmlToText(raw)

  const { t } = useTranslate()

  const displayText = useMemo(() => {
    if (!plain) {
      return t('enter_a_comment')
    }
    return plain.length > 500 ? `${plain.slice(0, 500)}…` : plain
  }, [plain, t])

  let body = null
  if (loading) {
    body = <p className="italic text-gray-400">{t('loading')}</p>
  } else if (error) {
    body = (
      <p className="italic text-red-500">
        {t('failed_to_load_comment', { errorMessage: error.message })}
      </p>
    )
  } else if (plain) {
    body = <p className="whitespace-pre-wrap">{displayText}</p>
  } else {
    body = <p className="italic text-gray-400">{displayText}</p>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('view_comment')}
          className="hover:text-primary text-gray-500"
        >
          <FaCommentDots className="h-4 w-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="max-w-sm text-sm">{body}</PopoverContent>
    </Popover>
  )
}
