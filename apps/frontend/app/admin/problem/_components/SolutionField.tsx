'use client'

import type { Language, Solution } from '@generated/graphql'
import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { CodeForm } from './CodeForm'

export function SolutionField() {
  const { unregister, watch, setValue, getValues } = useFormContext()
  const watchedLanguages: Language[] = watch('languages') ?? []
  const watchedSolutions: Solution[] = watch('solution') ?? []
  const previousLanguagesRef = useRef<Language[]>([])

  useEffect(() => {
    const previousLanguages = previousLanguagesRef.current ?? []
    const removedCount =
      previousLanguages.length - watchedLanguages.length > 0
        ? previousLanguages.length - watchedLanguages.length
        : 0

    // Unregister solutions that are no longer associated with existing languages
    for (let i = 0; i < removedCount; i++) {
      const index = previousLanguages.length - 1 - i
      unregister(`solution.${index}`)
    }

    // Filter out any empty solution objects
    // Note: Even after unregistering, some solutions may remain as empty objects
    const filteredSolutions = watchedSolutions.filter((solution) => {
      return Object.keys(solution).length > 0
    })

    setValue('solution', filteredSolutions)

    previousLanguagesRef.current = watchedLanguages
  }, [watchedLanguages, unregister])

  return (
    <div className="flex flex-col gap-6">
      {watchedLanguages &&
        watchedLanguages.map((language, index) => (
          <div key={index} className="flex gap-4">
            {language && (
              <CodeForm
                name={`solution.${index}.code`}
                language={language}
                hasValue={getValues(`solution.${index}.code`) || false}
                variant="solution"
              />
            )}
          </div>
        ))}
    </div>
  )
}
