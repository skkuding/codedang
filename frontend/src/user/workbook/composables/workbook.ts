import axios from 'axios'
import { ref } from 'vue'

export interface Workbook {
  id: number
  title: string
  description: string
  updateTime: string
}

export function useWorkbook() {
  const workbookList = ref<Workbook[]>([])
  const workbook = ref<Workbook>()

  const getWorkbooks = async () => {
    const res = await axios.get('/api/workbook')
    workbookList.value = res.data
  }

  // TODO: workbook 요청 개수만큼 추가로 받아오는 getMoreWorkbooks 구현 #344
  const getMoreWorkbooks = (cursor: number, limit: number) => {
    workbookList.value.push(
      {
        id: cursor + 1,
        title: '다섯째 돼지 워크북',
        description: '꿀꿀꿀꿀꿀 배신해서 늑대랑 같은 편 먹었어요',
        updateTime: '2023-01-01T09:30:00.000Z'
      },
      {
        id: cursor + 2,
        title: '여섯째 돼지 워크북',
        description: '꿀꿀 정의로운 여섯째는 동생들을 모아서',
        updateTime: '2023-01-01T09:30:00.000Z'
      }
    )
    if (limit > 2)
      workbookList.value.push(
        {
          id: cursor + 3,
          title: '일곱째 돼지 워크북',
          description: '꿀꿀꿀 럭키가이 일곱 돼지는 슈퍼마리오',
          updateTime: '2023-01-01T09:30:00.000Z'
        },
        {
          id: cursor + 1,
          title: '여덟째 돼지 워크북',
          description: '꿀꿀꿀 아무말 적는 중입니다 하하',
          updateTime: '2023-01-01T09:30:00.000Z'
        }
      )
  }

  const getWorkbook = async (id: number) => {
    const res = await axios.get('/api/workbook/' + id)
    workbook.value = res.data
  }

  return { workbook, workbookList, getWorkbooks, getMoreWorkbooks, getWorkbook }
}
