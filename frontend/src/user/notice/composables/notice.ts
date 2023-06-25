import { useRouter } from 'vue-router'
import { ref, markRaw, type Component } from 'vue'
import IconAngleUp from '~icons/fa6-solid/angle-up'
import IconAngleDown from '~icons/fa6-solid/angle-down'
import axios from 'axios'
import { useDateFormat } from '@vueuse/core'

export interface Field {
  key: string
  width?: string
  label?: string
}

export interface Item {
  icon?: Component
  name?: 'prev' | 'next'
  id: number
  title: string
  createTime?: string
  updateTime?: string
  content?: string
}

export const useNotice = () => {
  const notices = ref<Item[]>([])
  async function getNoticeList(currentPage: number) {
    const res = await axios.get('/api/notice', {
      params: { offset: (currentPage - 1) * 10 + 1 }
    })
    notices.value = res.data
    notices.value.map((notice) => {
      notice.createTime = useDateFormat(notice.createTime, 'YYYY-MM-DD').value
    })
  }
  // TODO: number of pages api로 받아오기
  const numberOfPages = 2
  const currentNotice = ref<Item>()
  const previousNotice = ref<Item>()
  const nextNotice = ref<Item>()
  const adjacentNotices = ref<Item[]>([])

  const router = useRouter()

  const goDetail = async ({ id }: Item) => {
    await router.push({
      name: 'notice-id',
      params: { id }
    })
  }

  async function getNotice(id: number) {
    const res = await axios.get('/api/notice/' + id)

    res.data.current.createTime = useDateFormat(
      res.data.current.createTime,
      'YYYY-MM-DD'
    ).value
    res.data.current.updateTime = useDateFormat(
      res.data.current.updateTime,
      'YYYY-MM-DD'
    ).value
    currentNotice.value = res.data.current
    previousNotice.value = res.data.prev
    nextNotice.value = res.data.next
    adjacentNotices.value = []

    if (previousNotice.value) {
      previousNotice.value.icon = markRaw(IconAngleUp)
      previousNotice.value.name = 'prev'
      adjacentNotices.value.push(markRaw(previousNotice.value))
    }
    if (nextNotice.value) {
      nextNotice.value.icon = markRaw(IconAngleDown)
      nextNotice.value.name = 'next'
      adjacentNotices.value.push(markRaw(nextNotice.value))
    }
  }

  return {
    notices,
    numberOfPages,
    currentNotice,
    adjacentNotices,
    getNoticeList,
    goDetail,
    getNotice
  }
}
