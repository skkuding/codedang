import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CollaborationPage, type Collaborator } from './CollaborationPage'

vi.mock('@/public/icons/info-gray.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />
}))

vi.mock('@/public/icons/icon-info-blue.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />
}))

const pendingRequest: Collaborator = {
  id: 'request-1',
  name: 'Bob',
  email: 'bob@example.com',
  role: 'Viewer'
}

const activeParticipant: Collaborator = {
  id: 'participant-1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'Viewer'
}

afterEach(cleanup)

describe('CollaborationPage', () => {
  it('기본 화면에서 협업 요청 빈 상태를 보여준다', () => {
    render(<CollaborationPage />)

    expect(screen.getByRole('heading', { name: '협업자 초대' })).toBeTruthy()
    expect(screen.getByText('총 0건')).toBeTruthy()
    expect(screen.getByText('받은 협업 요청이 없습니다.')).toBeTruthy()
  })

  it('이메일이 비어 있거나 형식이 올바르지 않으면 오류를 보여준다', () => {
    render(<CollaborationPage />)

    fireEvent.click(screen.getByRole('button', { name: '협업자 초대하기' }))
    expect(screen.getByText('이메일을 입력해주세요.')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
      target: { value: 'not-an-email' }
    })
    fireEvent.click(screen.getByRole('button', { name: '협업자 초대하기' }))
    expect(screen.getByText('유효하지 않은 이메일입니다.')).toBeTruthy()
  })

  it('유효한 이메일을 초대하면 활성화된 참여자에 즉시 추가한다', () => {
    render(<CollaborationPage />)

    fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
      target: { value: 'new-editor@example.com' }
    })
    fireEvent.click(screen.getByRole('button', { name: '협업자 초대하기' }))

    expect(screen.getByText('new-editor@example.com')).toBeTruthy()
    expect(screen.getByText('총 1건')).toBeTruthy()
    expect(
      screen
        .getByRole('tab', { name: '활성화된 참여자' })
        .getAttribute('data-state')
    ).toBe('active')
  })

  it('외부 협업 요청을 승인하거나 거절할 수 있다', () => {
    const { rerender } = render(
      <CollaborationPage initialRequests={[pendingRequest]} />
    )

    fireEvent.click(screen.getByRole('button', { name: '승인하기' }))
    expect(screen.getByText('받은 협업 요청이 없습니다.')).toBeTruthy()

    fireEvent.mouseDown(screen.getByRole('tab', { name: '활성화된 참여자' }), {
      button: 0,
      ctrlKey: false
    })
    expect(screen.getByText('bob@example.com')).toBeTruthy()

    rerender(
      <CollaborationPage key="reject-case" initialRequests={[pendingRequest]} />
    )
    fireEvent.click(screen.getByRole('button', { name: '거절하기' }))
    expect(screen.getByText('받은 협업 요청이 없습니다.')).toBeTruthy()
  })

  it('활성화된 참여자를 확인 후 삭제한다', () => {
    render(<CollaborationPage initialParticipants={[activeParticipant]} />)

    fireEvent.mouseDown(screen.getByRole('tab', { name: '활성화된 참여자' }), {
      button: 0,
      ctrlKey: false
    })
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))

    expect(
      screen.getByRole('heading', {
        name: '사용자 권한을 삭제하시겠습니까?'
      })
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '삭제할래요' }))

    expect(
      screen.getByText('활성화된 참여자가 존재하지 않습니다.')
    ).toBeTruthy()
  })

  it('활성화된 참여자의 권한을 확인 후 변경한다', () => {
    render(<CollaborationPage initialParticipants={[activeParticipant]} />)

    fireEvent.mouseDown(screen.getByRole('tab', { name: '활성화된 참여자' }), {
      button: 0,
      ctrlKey: false
    })
    fireEvent.click(screen.getByRole('button', { name: '권한 변경' }))

    expect(
      screen.getByRole('heading', {
        name: '사용자 권한을 변경하시겠습니까?'
      })
    ).toBeTruthy()

    expect(
      screen.getByRole('radio', {
        name: 'Viewer (보기 권한)'
      })
    ).toHaveProperty('checked', true)

    fireEvent.click(screen.getByRole('radio', { name: 'Editor (편집 권한)' }))
    fireEvent.click(screen.getByRole('button', { name: '변경할래요' }))

    expect(screen.getByLabelText('Alice 현재 권한: Editor')).toBeTruthy()
  })
})
