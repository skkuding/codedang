'use client'

import { Textarea } from '@/components/ui/textarea'
import type { Template, Language } from '@generated/graphql'
import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from '../../_components/Label'

export default function TemplateField() {
  const { register, unregister, watch, getValues, setValue } = useFormContext()
  const watchedLanguages: Language[] = watch('languages') ?? []
  const watchedTemplates: Template[] = watch('template') ?? []
  const previousLanguagesRef = useRef<Language[]>([])

  useEffect(() => {
    const previousLanguages = previousLanguagesRef.current ?? []
    const removedCount =
      previousLanguages.length - watchedLanguages.length > 0
        ? previousLanguages.length - watchedLanguages.length
        : 0

    // Unregister templates that are no longer associated with existing languages
    for (let i = 0; i < removedCount; i++) {
      const index = previousLanguages.length - 1 - i
      unregister(`template.${index}`)
    }

    // Filter out any empty template objects
    // Note: Even after unregistering, some templates may remain as empty objects
    const filteredTemplates = watchedTemplates.filter((template) => {
      return Object.keys(template).length > 0
    })

    setValue('template', filteredTemplates)

    previousLanguagesRef.current = watchedLanguages
  }, [watchedLanguages, unregister, getValues])

  return (
    <div className="flex flex-col gap-6">
      {watchedLanguages &&
        watchedLanguages.map((language, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Label required={false}>{language} Template</Label>
              </div>
              {language && (
                <Textarea
                  placeholder={`Enter a ${language} template...`}
                  className="h-[180px] w-[480px] bg-white"
                  {...register(`template.${index}.code.0.text`)}
                />
              )}
            </div>
          </div>
        ))}
    </div>
  )
}
