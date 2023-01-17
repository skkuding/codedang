import { useRouter } from 'vue-router'
import { ref, shallowRef, type Component } from 'vue'

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
  date?: string
  update?: string
  content?: string
}

export const useNotice = () => {
  const notices: Item[] = [
    {
      id: 1,
      title: '111111',
      date: '2022-05-06'
    },
    {
      id: 2,
      title: '222222',
      date: '2022-05-07'
    },
    {
      id: 3,
      title: '333333',
      date: '2022-05-07'
    },
    {
      id: 4,
      title: '444444',
      date: '2022-05-07'
    },
    {
      id: 5,
      title: '555555',
      date: '2022-05-07'
    },
    {
      id: 6,
      title: '666666',
      date: '2022-05-07'
    },
    {
      id: 7,
      title: '777777',
      date: '2022-05-07'
    },
    {
      id: 8,
      title: '888888',
      date: '2022-05-07'
    },
    {
      id: 9,
      title: '999999',
      date: '2022-05-07'
    }
  ]

  const currentNotice = ref<Item | object>({})
  const adjacentNotices = shallowRef<Item[]>([])

  const router = useRouter()
  function goDetail({ id }: Item) {
    router.push({
      name: 'notice-id',
      params: { id }
    })
  }

  function getNotice(id: number) {
    currentNotice.value = notices.find((x: Item) => x.id === id) || {}
    if (Object.keys(currentNotice.value).length === 0) {
      router.push('/404')
      return
    }
    adjacentNotices.value = notices.filter(
      (x: Item) => x.id === id - 1 || x.id === id + 1
    )
  }

  return {
    notices,
    currentNotice,
    adjacentNotices,
    goDetail,
    getNotice
  }
}
