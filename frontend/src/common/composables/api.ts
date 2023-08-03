import axios from 'axios'
import { ref, computed } from 'vue'

/**
 * Single item of the list
 * @param id: unique identifier of the item
 */
interface Item {
  id: unknown
}

/**
 * @param path: url path to call (ex: 'user', 'group/1/user')
 * @param take: number of items to take per page
 * @param pagesPerSlot: number of pages per slot
 */
export const useListAPI = <T extends Item>(
  path: string,
  take = 20,
  pagesPerSlot = 5
) => {
  const currentPage = ref(1)
  /** Total number of pages (increase if there are more data than slots) */
  const totalPages = ref(1)
  /** Group of pages in current pagination
   * (ex: <page 1, 2, 3, 4, 5> = <slot 1>) */
  const currentSlot = computed(() =>
    Math.ceil(currentPage.value / pagesPerSlot)
  )
  /** Items of current page */
  const items = ref<T[]>([])
  /** Items of current slot */
  const slotItems = ref<T[]>([])
  /** Last item of current slot */
  const cursor = ref()
  /** Cursors of previous slots. (work as stack) */
  const previousCursors = ref<number[]>([])

  /** Call list API from server */
  const getList = async () => {
    const { data } = await axios.get(`/api/${path}`, {
      params: {
        take: take * pagesPerSlot + 1,
        cursor: cursor.value
      }
    })
    if (data.length > take * pagesPerSlot) {
      totalPages.value = currentSlot.value * pagesPerSlot + 1
      slotItems.value = data.slice(0, take * pagesPerSlot)
    } else {
      totalPages.value = Math.max(
        (currentSlot.value - 1) * pagesPerSlot + Math.ceil(data.length / take),
        1
      )
      slotItems.value = data
    }
  }

  const changePage = async (page: number) => {
    const oldSlot = currentSlot.value
    currentPage.value = page // updates currentSlot as well
    if (currentSlot.value > oldSlot) {
      previousCursors.value.push(cursor.value)
      cursor.value = slotItems.value[slotItems.value.length - 1].id
      await getList()
    } else if (currentSlot.value < oldSlot) {
      cursor.value = previousCursors.value.pop()
      await getList()
    }
    items.value = slotItems.value.slice(
      ((currentPage.value - 1) % pagesPerSlot) * take,
      ((currentPage.value - 1) % pagesPerSlot) * take + take
    )
  }

  // Load initial data
  // Do not use await here, because it will block the UI (top-level await)
  getList().then(() => {
    items.value = slotItems.value.slice(
      (currentPage.value - 1) % pagesPerSlot,
      ((currentPage.value - 1) % pagesPerSlot) + take
    )
  })
  console.log('did you get the data is ', items)

  return {
    items,
    totalPages,
    changePage
  }
}
