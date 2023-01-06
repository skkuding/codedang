import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

export interface Field {
  key: string
  width?: string
  label?: string
  custom?: boolean
}

export interface Item {
  icon?: Component
  title: string
  date?: string
  name?: string
  id: number | string
}

export const useNoticeList = () => {
  const router = useRouter()

  const goDetail = ({ id }: Item) => {
    router.push({
      name: 'notice-id',
      params: { id }
    })
  }

  const noticeField: Field[] = [{ key: 'title', width: '70%' }, { key: 'date' }]
  const noticeItem: Item[] = [
    {
      title: '111111',
      date: '2022-05-06',
      id: 1
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 2
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 3
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 4
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 5
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 6
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 7
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 8
    },
    {
      title: '222222',
      date: '2022-05-07',
      id: 9
    }
  ]

  const perPage = 5
  const shownPages = ref(
    noticeItem.length % perPage === 0
      ? noticeItem.length / perPage
      : Math.floor(noticeItem.length / perPage) + 1
  )
  const shownItems = ref(noticeItem)
  const currentPage = ref(1)

  const currentItems = computed(() =>
    shownItems.value.slice(
      (currentPage.value - 1) * perPage,
      currentPage.value * perPage
    )
  )

  const search = (keyword: string) => {
    const total = noticeItem.filter((i) => i.title.includes(keyword))
    shownItems.value = total
    shownPages.value = shownItems.value.length / perPage
    currentPage.value = 1
  }

  const changeItems = (page: number) => {
    currentPage.value = page
  }

  return {
    goDetail,
    noticeField,
    currentItems,
    shownPages,
    search,
    changeItems
  }
}
