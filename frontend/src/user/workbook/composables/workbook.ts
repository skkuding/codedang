import axios from 'axios'
import { ref } from 'vue'

export interface Workbook {
  id: number
  title: string
  description: string
  updateTime: string
  problems: {
    id: string
    title: string
    tags: string[]
    result: string
  }[]
}

export const useWorkbook = () => {
  // TODO: workbookList에서 마지막 item 있는지 판별하기
  const containLastItem = ref(false)
  const workbookList = ref<Workbook[]>([])
  const workbook = ref<Workbook>()

  const getWorkbooks = async () => {
    const res = await axios.get('/api/workbook', { params: { take: 4 } })
    if (res.data.length < 4) containLastItem.value = true
    workbookList.value = res.data
  }

  const getMoreWorkbooks = async (take: number) => {
    const res = await axios.get('/api/workbook', {
      params: {
        cursor: workbookList.value[workbookList.value.length - 1].id,
        take
      }
    })
    if (res.data.length < take) containLastItem.value = true
    workbookList.value.push(...res.data)
  }

  const getWorkbook = async (id: number) => {
    const res = await axios.get('/api/workbook/' + id)
    workbook.value = res.data
  }

  return {
    containLastItem,
    workbook,
    workbookList,
    getWorkbooks,
    getMoreWorkbooks,
    getWorkbook
  }
}
