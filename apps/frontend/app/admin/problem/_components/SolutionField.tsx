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

    // 디버깅을 위한 로그 추가
    console.log('watchedLanguages:', watchedLanguages)
    console.log('current solutions before update:', getValues('solution'))

    // Set language for each solution and ensure proper structure
    watchedLanguages.forEach((language, index) => {
      console.log(`Setting solution ${index} language to:`, language)

      // 항상 language와 code를 명시적으로 설정
      setValue(`solution.${index}.language`, language)

      const currentCode = getValues(`solution.${index}.code`)
      if (!currentCode) {
        setValue(`solution.${index}.code`, '')
      }
    })

    // 전체 solution 배열을 다시 구성
    const newSolutions = watchedLanguages.map((language, index) => ({
      language,
      code: getValues(`solution.${index}.code`) || ''
    }))

    setValue('solution', newSolutions)

    console.log('final solutions after update:', getValues('solution'))

    previousLanguagesRef.current = watchedLanguages
  }, [watchedLanguages, setValue, getValues, unregister])

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
