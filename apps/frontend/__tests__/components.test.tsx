import ContestCard from '@/app/(main)/_components/ContestCard'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

test('ContestCard', () => {
  render(
    <ContestCard
      contest={{
        enableCopyPaste: true,
        id: 1,
        title: 'test',
        status: 'ongoing',
        startTime: new Date(),
        endTime: new Date(),
        group: {
          id: '1',
          groupName: 'test'
        },
        participants: 1
      }}
    />
  )
  expect(screen.getByText('test')).toBeDefined()
  expect(screen.getByText('ongoing')).toBeDefined()
})
