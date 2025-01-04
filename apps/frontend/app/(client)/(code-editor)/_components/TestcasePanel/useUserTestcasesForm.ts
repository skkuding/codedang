import type { TestcaseItem } from '@/types/type'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

interface EditableTestcaseItem extends TestcaseItem {
  originalInput: string
  originalOutput: string
}

const isEdited = (item: EditableTestcaseItem) =>
  item.input !== item.originalInput || item.output !== item.originalOutput

const getEmptyTestcase = () => ({
  id: new Date().getTime(),
  input: '',
  output: '',
  originalInput: '',
  originalOutput: ''
})

const getDefaultTestcases = (userTestcases: TestcaseItem[]) => {
  if (userTestcases.length > 0) {
    return userTestcases.map((item) => ({
      ...item,
      originalInput: item.input,
      originalOutput: item.output
    }))
  }
  return [getEmptyTestcase()]
}

export const useUserTestcasesForm = (options: { onSubmit?: () => void }) => {
  const userTestcases = useTestcaseStore((state) => state.userTestcases)
  const setUserTestcases = useTestcaseStore((state) => state.setUserTestcases)

  const form = useForm<{
    testcases: EditableTestcaseItem[]
  }>({
    defaultValues: {
      testcases: getDefaultTestcases(userTestcases)
    }
  })

  const {
    fields: testcases,
    append,
    remove
  } = useFieldArray({
    control: form.control,
    name: 'testcases'
  })

  const addTestcase = () => {
    append(getEmptyTestcase())
  }

  const removeTestcase = (index: number) => {
    remove(index)
  }

  const onSubmit = form.handleSubmit(({ testcases }) => {
    let baseId = new Date().getTime()
    setUserTestcases(
      testcases.map((testcase) => ({
        // NOTE: testcase가 수정된 경우 이전 테스트 결과를 초기화하기 위해 새로운 아이디를 부여합니다.
        id: isEdited(testcase) ? baseId++ : testcase.id,
        input: testcase.input,
        output: testcase.output
      }))
    )
    options.onSubmit?.()
  })

  const reset = () => {
    form.reset({ testcases: getDefaultTestcases(userTestcases) })
  }

  useEffect(() => {
    form.setValue('testcases', getDefaultTestcases(userTestcases))
  }, [userTestcases])

  return {
    formState: form.formState,
    testcases,
    reset,
    onSubmit,
    register: form.register,
    addTestcase,
    removeTestcase
  }
}
