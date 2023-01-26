import { useRouter } from 'vue-router'
import { ref, markRaw, type Component } from 'vue'
import IconAngleUp from '~icons/fa6-solid/angle-up'
import IconAngleDown from '~icons/fa6-solid/angle-down'
import axios from 'axios'
import { findColumn } from '@codemirror/state'
import { useDateFormat, useNow } from '@vueuse/core'

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
  update?: string
  content?: string
}

export const useNotice = () => {
  const notices = ref<Item[]>([])
  async function getNoticeList(currentPage: number) {
    await axios
      .get('/api/notice', {
        params: { offset: (currentPage - 1) * 10 + 1 }
      })
      .then((res) => {
        notices.value = res.data
        notices.value.map((notice) => {
          notice.createTime = useDateFormat(
            notice.createTime,
            'YYYY-MM-DD'
          ).value
        })
      })
  }
  // TODO: number of pages api로 받아오기
  const numberOfPages = 2
  const currentNotice = ref<Item>()
  const adjacentNotices = ref<Item[]>([])

  const router = useRouter()

  function goDetail({ id }: Item) {
    router.push({
      name: 'notice-id',
      params: { id }
    })
  }
  // TODO: api 연결
  function getNotice(id: number) {
    currentNotice.value = notices.value.find((x) => x.id === id)
    const previousNotice = notices.value.find((x) => x.id === id - 1)
    const nextNotice = notices.value.find((x) => x.id === id + 1)
    if (previousNotice) {
      previousNotice.icon = IconAngleUp
      previousNotice.name = 'prev'
      adjacentNotices.value.push(markRaw(previousNotice))
    }
    if (nextNotice) {
      nextNotice.icon = IconAngleDown
      nextNotice.name = 'next'
      adjacentNotices.value.push(markRaw(nextNotice))
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
