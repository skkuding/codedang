'use client'

import checkBlue from '@/public/icons/check-blue.svg'
import checkGray from '@/public/icons/check-gray.svg'
import type { Assignment } from '@/types/type'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function OngoingAssignments() {
  const [ongoings, setOngoings] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const response = await new Promise<Assignment[]>((resolve) =>
          setTimeout(
            () =>
              resolve([
                {
                  id: 1,
                  title: 'HelloWorld.java',
                  startTime: new Date('2025-01-12'),
                  endTime: new Date('2024-01-22'),
                  group: { id: 'G1', groupName: 'Group A' },
                  isGraded: true,
                  status: 'ongoing'
                },
                {
                  id: 2,
                  title: 'HelloWorld.java',
                  startTime: new Date('2025-01-12'),
                  endTime: new Date('2024-01-22'),
                  group: { id: 'G1', groupName: 'Group A' },
                  isGraded: false,
                  status: 'ongoing'
                }
              ]),
            1000
          )
        )
        setOngoings(response)
      } catch (err) {
        setError('Failed to fetch assignments')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  return (
    <div className="p-10">
      <h3 className="mb-10 text-lg font-bold">On-going Assignments</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 font-medium">Title</th>
            <th className="px-4 py-2 font-medium">Start Date</th>
            <th className="px-4 py-2 font-medium">End Date</th>
            <th className="px-4 py-2 font-medium">Submission</th>
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
              <td className="px-4 py-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
