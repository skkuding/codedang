'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { languages, levels } from '@/libs/constants'
import type { Language, Solution, Template } from '@generated/graphql'
import { useEffect } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { CheckboxSelect } from './CheckboxSelect'

export function InfoForm() {
  const {
    watch,
    control,
    getValues,
    formState: { errors },
    setValue
  } = useFormContext()

  const watchedLanguages: Language[] = watch('languages')

  useEffect(() => {
    if (watchedLanguages) {
      const templates: Template[] = [] // temp array to store templates
      const solutions: Solution[] = [] // temp array to store solutions
      const savedTemplates: Template[] = getValues('template') // templates saved in form
      const savedSolutions: Solution[] = getValues('solution') // solutions saved in form
      watchedLanguages.map((language) => {
        const tempTemplates = savedTemplates.filter(
          (template) => template.language === language
        )
        const tempSolutions = savedSolutions.filter(
          (solution) => solution.language === language
        )
        if (tempTemplates.length !== 0) {
          templates.push(tempTemplates[0])
        } else {
          // push dummy template to array
          templates.push({
            language,
            code: [
              {
                id: -1,
                text: '',
                locked: false
              }
            ]
          })
        }
        if (tempSolutions.length !== 0) {
          solutions.push(tempSolutions[0])
        } else {
          // push dummy solution to array
          solutions.push({
            language,
            code: ''
          })
        }
      })
      templates.map((template, index) => {
        setValue(`template.${index}`, {
          language: template.language,
          code: [
            {
              id: index,
              text: template.code[0].text ?? '',
              locked: false
            }
          ]
        })
      })
      solutions.map((solution, index) => {
        setValue(`solution.${index}`, {
          language: solution.language,
          code: solution.code ?? ''
        })
      })
    }
  }, [watchedLanguages])

  const { field: difficultyField } = useController({
    name: 'difficulty',
    control,
    defaultValue: ''
  })

  const { field: languagesField } = useController({
    name: 'languages',
    control,
    defaultValue: []
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CheckboxSelect
          title="Language"
          options={languages}
          onChange={(selectedLanguages) => {
            languagesField.onChange(selectedLanguages)
          }}
          defaultValue={languagesField.value as string[]}
        />
        {errors.languages && <ErrorMessage />}
      </div>

      <div className="flex flex-col gap-1">
        <OptionSelect
          options={levels}
          value={difficultyField.value as string}
          onChange={difficultyField.onChange}
          className="w-full"
        />
        {errors.difficulty && <ErrorMessage />}
      </div>
    </div>
  )
}
