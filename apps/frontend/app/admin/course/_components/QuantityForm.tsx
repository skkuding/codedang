import { MinusIcon, PlusIcon } from 'lucide-react'
import { useEffect } from 'react'

interface QuantityFormProps {
  value: number
  maxValue?: number
  minValue?: number
  onChange: (value: number) => void
}

export function QuantityForm({
  value,
  maxValue = Number.MAX_SAFE_INTEGER,
  minValue = 0,
  onChange
}: QuantityFormProps) {
  useEffect(() => {
    if (minValue > maxValue) {
      console.warn('QuantityInput: Invalid range.')
    }

    if (value < minValue || value > maxValue) {
      console.warn('QuantityInput: Value is out of range.')
    }
  }, [value, minValue, maxValue])

  const decrease = () => {
    onChange(Math.max(minValue, Math.min(maxValue, value - 1)))
  }

  const increase = () => {
    onChange(Math.min(maxValue, Math.max(minValue, value + 1)))
  }

  return (
    <div className="w-30 border-line bg-color-neutral-99 flex h-10 items-center justify-center overflow-hidden rounded-[4px] border">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrease}
        className="text-color-neutral-60 bg-color-common-100 active:bg-color-neutral-95 flex h-10 w-10 items-center justify-center"
      >
        <MinusIcon className="h-6 w-6" />
      </button>
      <span className="text-color-neutral-30 text-sub1_sb_18 flex h-10 w-10 items-center justify-center">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increase}
        className="text-color-neutral-60 bg-color-common-100 active:bg-color-neutral-95 flex h-10 w-10 items-center justify-center"
      >
        <PlusIcon />
      </button>
    </div>
  )
}
