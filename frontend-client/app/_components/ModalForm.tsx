'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ModalForm({
  goNext,
  formData,
  setFormData,
  data
}: {
  goNext: any
  formData: any
  setFormData: any
  data: any
  final?: boolean
}) {
  const { handleSubmit, register } = useForm()

  const onSubmit = (data: any) => {
    setFormData({ ...formData, ...data })
    console.log('final is ', { ...formData, ...data })

    // 다음으로
    goNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {data.map(
        (el: {
          id: number
          placeholder: string
          type: string
          name: string
          button: boolean
        }) => (
          <>
            <Input
              key={el.id}
              placeholder={el.placeholder}
              type={el.type}
              {...register(el.name)}
            />
            {el.button && (
              <Button onClick={() => console.log('username is unique')} />
            )}
          </>
        )
      )}

      <Button type="submit">Save</Button>
    </form>
  )
}
