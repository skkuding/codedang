import { afterAll, beforeAll, vi } from 'vitest'

vi.mock('@/app/admin/_components/TextEditor', () => ({
  TextEditor: ({
    defaultValue,
    onChange
  }: {
    defaultValue: string
    onChange: (value: string) => void
  }) => (
    <textarea
      aria-label="Description"
      value={defaultValue}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}))

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  HTMLElement.prototype.scrollIntoView = vi.fn()
})
afterAll(() => vi.unstubAllGlobals())
