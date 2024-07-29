import { Textarea } from '@/components/ui/textarea'
import type { Language } from '@/types/type'
import { useFormContext } from 'react-hook-form'
import Label from '../../_components/Label'

export default function TemplateField() {
  const { register, watch } = useFormContext()
  const watchedLanguages: Language[] = watch('languages')
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
