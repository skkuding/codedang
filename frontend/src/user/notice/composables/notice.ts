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

  const currentNotice = ref<Item>()
  const previousNotice = ref<Item>()
  const nextNotice = ref<Item>()
  const adjacentNotices = ref<Item[]>([])

  const router = useRouter()

  function goDetail({ id }: Item) {
    router.push({
      name: 'notice-id',
      params: { id }
    })
  }

  async function getNotice(id: number) {
    await axios.get('/api/notice/' + id).then((res) => {
      console.log(res.data)
      currentNotice.value = res.data.current
      currentNotice.value.createTime = useDateFormat(
        currentNotice.value.createTime,
        'YYYY-MM-DD'
      ).value
      currentNotice.value.updateTime = useDateFormat(
        currentNotice.value.updateTime,
        'YYYY-MM-DD'
      ).value
      previousNotice.value = res.data.prev
      nextNotice.value = res.data.next
    })
    if (previousNotice.value) {
      previousNotice.value.icon = IconAngleUp
      previousNotice.value.name = 'prev'
      adjacentNotices.value.push(markRaw(previousNotice.value))
    }
    if (nextNotice.value) {
      nextNotice.value.icon = IconAngleDown
      nextNotice.value.name = 'next'
      adjacentNotices.value.push(markRaw(nextNotice.value))
    }
  }

  return {
    notices,
    currentNotice,
    adjacentNotices,
    goDetail,
    getNotice
  }
}
