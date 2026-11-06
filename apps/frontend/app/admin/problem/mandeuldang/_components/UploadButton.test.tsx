import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UploadButton } from './UploadButton'

vi.mock('@/public/icons/file_gray.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />
}))

vi.mock('@/public/icons/upload.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />
}))

vi.mock('@/public/icons/x.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />
}))

const uploadTargetTexts = ['statement.md// 문제 본문']

afterEach(cleanup)

describe('UploadButton', () => {
  it('disabled가 false이면 버튼을 누를 수 있고 업로드 다이얼로그가 열린다', () => {
    render(
      <UploadButton disabled={false} upload_target_texts={uploadTargetTexts} />
    )

    const button = screen.getByRole('button', { name: '문제 업로드' })

    expect((button as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(button)

    expect(
      screen.getByRole('heading', {
        name: '문제를 업로드 하시겠습니까?'
      })
    ).toBeTruthy()
    expect(screen.getByText(uploadTargetTexts[0])).toBeTruthy()
  })

  it('disabled가 true이면 버튼이 비활성화되고 다이얼로그가 열리지 않는다', () => {
    render(
      <UploadButton disabled={true} upload_target_texts={uploadTargetTexts} />
    )

    const button = screen.getByRole('button', { name: '문제 업로드' })

    expect((button as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(button)

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
