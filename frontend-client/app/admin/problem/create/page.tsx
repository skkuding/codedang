'use client'

import CheckboxSelect from '@/components/CheckboxSelect'
import OptionSelect from '@/components/OptionSelect'
import TagsSelect from '@/components/TagsSelect'

// dummy data
const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']
// dummy data
const languageOptions = ['C', 'C++', 'Java', 'Python']
// dummy data
const tags = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree']

export default function page() {
  return (
    <>
      <OptionSelect levels={levels} />
      <CheckboxSelect title="Language" options={languageOptions} />
      <TagsSelect options={tags} />
    </>
  )
}
