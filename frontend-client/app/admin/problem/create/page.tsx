'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Tiptap from '../../_components/Tiptap'

export default function Page() {
  const formSchema = z.object({
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters.' })
      .max(1000, { message: 'Description can be at most 1000 characters.' })
      .trim()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      description: ''
    }
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="Write description"
          render={() => (
            <FormItem className="gap-0">
              <FormLabel className="text-base">
                Description<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Tiptap placeholder="Enter description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
