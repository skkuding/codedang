import axios from 'axios'
import { ref, computed } from 'vue'

interface Item {
  id: number
}

export const useListAPI = <T extends Item>(model: string, take = 20) => {
  const items = ref<T[]>([])
  const slotItems = ref<T[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const slot = computed(() => Math.ceil(currentPage.value / 5))
  const cursor = ref()
  const previousCursors = ref<number[]>([])

  const getList = async () => {
    const { data } = await axios.get(`/api/${model}`, {
      params: {
        take: take * 5 + 1,
        cursor: cursor.value
      }
    })
    if (data.length > take * 5) {
      totalPages.value = slot.value * 5 + 1
      slotItems.value = data.slice(0, take * 5)
    } else {
      totalPages.value = (slot.value - 1) * 5 + Math.ceil(data.length / take)
      slotItems.value = data
    }
  }

  const changePage = async (page: number) => {
    const oldSlot = slot.value
    currentPage.value = page
    if (slot.value > oldSlot) {
      previousCursors.value.push(cursor.value)
      cursor.value = slotItems.value[slotItems.value.length - 1].id
      await getList()
    } else if (slot.value < oldSlot) {
      cursor.value = previousCursors.value.pop()
      currentPage.value = page
      await getList()
    } else {
      currentPage.value = page
    }
    items.value = slotItems.value.slice(
      ((currentPage.value - 1) % 5) * take,
      ((currentPage.value - 1) % 5) * take + take
    )
  }

  // Load initial data
  // Do not use await here, because it will block the UI (top-level await)
  getList().then(() => {
    items.value = slotItems.value.slice(
      (currentPage.value - 1) % 5,
      ((currentPage.value - 1) % 5) + take
    )
  })

  return {
    items,
    totalPages,
    changePage
  }
}
