import CheckboxSelect from '@/components/CheckboxSelect'
import OptionSelect from '@/components/OptionSelect'
import TagsSelect from '@/components/TagsSelect'
import { languages, levels } from '@/lib/constants'
import type { Tag } from '@/types/type'
import { useFormContext, useController } from 'react-hook-form'
import ErrorMessage from './ErrorMessage'

export default function InfoForm({ tags }: { tags: Tag[] }) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

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

  const { field: tagsField } = useController({
    name: 'tags.create',
    control,
    defaultValue: []
  })

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-1">
        <OptionSelect
          options={levels}
          value={difficultyField.value as string}
          onChange={difficultyField.onChange}
        />
        {errors.difficulty && <ErrorMessage />}
      </div>

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
        <TagsSelect
          options={tags}
          onChange={tagsField.onChange}
          defaultValue={tagsField.value}
        />
        {errors.tags && <ErrorMessage />}
      </div>
    </div>
  )
}
