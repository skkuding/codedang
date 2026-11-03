'use client'

import { useState } from 'react'
import { QuantityForm } from '../admin/course/_components/QuantityForm'

export default function Page() {
  const [value, setValue] = useState(1)

  return (
    <section className="m-6">
      <QuantityForm
        value={value}
        maxValue={10}
        minValue={1}
        onChange={setValue}
      />
    </section>
  )
}
