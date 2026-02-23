'use client'

// import checkBlue from '@/public/icons/check-blue.svg'
// import checkGray from '@/public/icons/check-gray.svg'
import type { Assignment } from '@/types/type'
import { useTranslate } from '@tolgee/react'
// import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function OngoingAssignments() {
  const { t } = useTranslate()
  const [ongoings, setOngoings] = useState<Assignment[]>([])

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await new Promise<Assignment[]>((resolve) =>
          setTimeout(
            () =>
              resolve([
                // {
                //   id: 1,
                //   title: 'HelloWorld.java',
                //   startTime: new Date('2025-01-12'),
                //   endTime: new Date('2024-01-22'),
                //   group: { id: 'G1', groupName: 'Group A' },
                //   enableCopyPaste: true,
                //   isJudgeResultVisible: true,
                //   week: 16,
                //   status: 'ongoing',
                //   description: 'This is a description',
                //   isRegistered: true
                // },
                // {
                //   id: 1,
                //   title: 'HelloWorld.java',
                //   startTime: new Date('2025-01-12'),
                //   endTime: new Date('2024-01-22'),
                //   group: { id: 'G1', groupName: 'Group A' },
                //   enableCopyPaste: true,
                //   isJudgeResultVisible: true,
                //   week: 16,
                //   status: 'ongoing',
                //   description: 'This is a description',
                //   isRegistered: true
                // }
              ]),
            1000
          )
        )
        setOngoings(response)
      } catch (err) {
        toast.error(`Failed to fetch assignments: ${err}`)
      }
    }
    fetchAssignments()
  }, [])

  return (
    <div className="p-10">
      <h3 className="mb-10 text-lg font-bold">{t('on_going_assignments')}</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 font-medium">{t('title_header')}</th>
            <th className="px-4 py-2 font-medium">{t('start_date_header')}</th>
            <th className="px-4 py-2 font-medium">{t('end_date_header')}</th>
            <th className="px-4 py-2 font-medium">{t('submission_header')}</th>
          </tr>
        </thead>
        <tbody>
          {ongoings.map((assignment) => (
            <tr key={assignment.id} className="border-b text-center">
              <td className="px-4 py-2">{assignment.title}</td>
              <td className="px-4 py-2">
                {assignment.startTime.toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                {assignment.endTime.toLocaleDateString()}
              </td>
              {/* TODO: API 완성되면 isSubmitted로 대체 */}
              {/* <td className="px-4 py-2">
                {assignment.isGraded ? (
                  <Image
                    src={checkBlue}
                    alt="graded"
                    width={24}
                    height={24}
                    className="mr-2 inline-block"
                  />
                ) : (
                  <Image
                    src={checkGray}
                    alt="not graded"
                    width={24}
                    height={24}
                    className="mr-2 inline-block"
                  />
                )}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
