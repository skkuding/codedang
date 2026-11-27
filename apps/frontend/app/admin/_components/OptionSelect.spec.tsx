import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OptionSelect } from './OptionSelect'

vi.mock('@/public/icons/arrow-bottom-thin.svg', () => ({ default: () => null }))
vi.mock('@/public/icons/arrow-top.svg', () => ({ default: () => null }))

afterEach(cleanup)

describe('Course option select reuse', () => {
  it('keeps existing Course string options and disabled state without extra props', () => {
    render(
      <OptionSelect
        options={['1', '2']}
        value="2"
        onChange={vi.fn()}
        disabled
        prefix="Week"
      />
    )
    const trigger = screen.getByRole<HTMLButtonElement>('combobox')
    expect(trigger.textContent).toBe('Week2')
    expect(trigger.disabled).toBe(true)
  })

  it('accepts labeled values and associates a reused field with its error', () => {
    render(
      <>
        <label htmlFor="problem-order">Order</label>
        <OptionSelect
          options={[{ value: '1', label: 'A' }]}
          value="1"
          onChange={vi.fn()}
          triggerProps={{
            id: 'problem-order',
            'aria-invalid': true,
            'aria-describedby': 'order-error'
          }}
        />
        <p id="order-error">Choose another order</p>
      </>
    )
    const trigger = screen.getByRole('combobox', { name: 'Order' })
    expect(trigger.textContent).toBe('A')
    expect(trigger.getAttribute('aria-invalid')).toBe('true')
    expect(trigger.getAttribute('aria-describedby')).toBe('order-error')
  })
})
