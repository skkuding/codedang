import axios from 'axios'
import { ref, computed, type ComputedRef, toValue } from 'vue'

/**
 * Single item of the list
 * @param id: unique identifier of the item
 */
interface Item {
  id: unknown
}

/**
 * Utility to get cursor-pagination API data.
 * `slot` means a group of pages in pagination component.
 * For example, if there are 3 pages per slot, [1, 2, 3] is slot 1, [4, 5, 6] is slot 2, and so on.
 *
 * @param path: url path to call (ex: 'user', () => `group/${id}/user`)
 * @param take: number of items to take per page
 * @param pagesPerSlot: number of pages per slot
 */
export const useListAPI = <T extends Item>(
  path: string | ComputedRef<string>,
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
  /** Data is being loaded */
  const loading = ref(false)

  /**
   * Call list API from server.
   * Get (all data of current slot + 1), to verify if there are more data to load in next slot.
   * For example, if number of items per page is 20 and pages per slot is 5, take 101 items.
   * If 101 items are returned, next slot exists. If not, current slot is the last.
   */
  const getList = async () => {
    loading.value = true
    const { data } = await axios.get(`/api/${toValue(path)}`, {
      params: {
        take: take * pagesPerSlot + 1,
        cursor: cursor.value
      }
    })
    // When current slot is not the last,
    if (data.length > take * pagesPerSlot) {
      totalPages.value = currentSlot.value * pagesPerSlot + 1
      slotItems.value = data.slice(0, take * pagesPerSlot)
    }
    // When current slot is the last,
    else {
      totalPages.value =
        (currentSlot.value - 1) * pagesPerSlot + Math.ceil(data.length / take)
      slotItems.value = data
    }
    loading.value = false
  }

  const changePage = async (page: number) => {
    const oldSlot = currentSlot.value
    currentPage.value = page // updates currentSlot automatically (computed)
    if (currentSlot.value > oldSlot) {
      previousCursors.value.push(cursor.value)
      cursor.value = slotItems.value.at(-1)?.id
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

  return {
    items,
    totalPages,
    changePage,
    loading
  }
}
