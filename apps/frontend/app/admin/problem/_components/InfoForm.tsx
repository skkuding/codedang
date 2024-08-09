import CheckboxSelect from '@/components/CheckboxSelect'
import OptionSelect from '@/components/OptionSelect'
import { languages, levels } from '@/lib/constants'
import type { Template } from '@generated/graphql'
import type { Language } from '@generated/graphql'
import { useEffect } from 'react'
import { useFormContext, useController } from 'react-hook-form'
import ErrorMessage from '../../_components/ErrorMessage'

export default function InfoForm() {
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
      const savedTemplates: Template[] = getValues('template') // templates saved in form
      watchedLanguages.map((language) => {
        const temp = savedTemplates!.filter(
          (template) => template.language === language
        )
        if (temp.length !== 0) {
          templates.push(temp[0])
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

  // const { field: tagsField } = useController({
  //   name: tagName,
  //   control,
  //   defaultValue: []
  // })

  return (
    <div className="flex gap-4">
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
        />
        {errors.difficulty && <ErrorMessage />}
      </div>

      {/* <div className="flex flex-col gap-1">
        <TagsSelect
          options={tags}
          onChange={tagsField.onChange}
          defaultValue={tagsField.value}
        />
        {errors.tags && <ErrorMessage />}
      </div> */}
    </div>
  )
}
