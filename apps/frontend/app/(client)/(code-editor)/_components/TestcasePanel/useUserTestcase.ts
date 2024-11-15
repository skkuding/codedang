import type { TestcaseItem } from '@/types/type'
import { useEffect, useState } from 'react'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

interface EditableTestcaseItem extends TestcaseItem {
  originalInput: string
  originalOutput: string
}

const isEdited = (item: EditableTestcaseItem) =>
  item.input !== item.originalInput || item.output !== item.originalOutput

export const useUserTestcase = () => {
  const userTestcases = useTestcaseStore((state) => state.userTestcases)
  const setUserTestcases = useTestcaseStore((state) => state.setUserTestcases)

  const [testcases, setTestcases] = useState<EditableTestcaseItem[]>(
    userTestcases.map((item) => ({
      ...item,
      originalInput: item.input,
      originalOutput: item.output
    }))
  )

  const addTestcase = (testcase: TestcaseItem) => {
    setTestcases((state) =>
      state.concat({
        ...testcase,
        originalInput: testcase.input,
        originalOutput: testcase.output
      })
    )
  }

  const editTestcase = (testcase: TestcaseItem) => {
    setTestcases((state) =>
      state.map((item) =>
        item.id === testcase.id
          ? {
              ...item,
              input: testcase.input,
              output: testcase.output
            }
          : item
      )
    )
  }

  const deleteTestcase = (id: number) => {
    setTestcases((state) => state.filter((testcase) => testcase.id !== id))
  }

  const saveUserTestcases = () => {
    setUserTestcases(
      testcases.map((testcase) => ({
        // NOTE: testcase가 수정된 경우 이전 테스트 결과를 초기화하기 위해 새로운 아이디를 부여합니다.
        id: isEdited(testcase) ? new Date().getTime() : testcase.id,
        input: testcase.input,
        output: testcase.output
      }))
    )
  }

  useEffect(() => {
    setTestcases(
      userTestcases.map((item) => ({
        ...item,
        originalInput: item.input,
        originalOutput: item.output
      }))
    )
  }, [userTestcases])

  return {
    testcases,
    addTestcase,
    editTestcase,
    deleteTestcase,
    saveUserTestcases
  }
}
