import type { DocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import type { MaybeRef } from 'vue'
import { ref, computed, type Ref } from 'vue'
import { useToast } from './toast'

/**
 * Single item of the list
 * @param id: unique identifier of the item
 */
interface Item {
  id: unknown
}

interface Response<T> {
  [key: string]: T[]
}

/**
 * @param query GraphQL query
 * @param variable GraphQL variables
 * @param option Custom options { take: number; pagesPerSlot: number }
 */
export const useListGraphQL = <T extends Item>(
  query: DocumentNode,
  variable: { [key: string]: MaybeRef<unknown> },
  option?: { take?: number; pagesPerSlot?: number }
) => {
  const take = option?.take ?? 20
  const pagesPerSlot = option?.pagesPerSlot ?? 5

  const currentPage = ref(1)
  /** Total number of pages (increase if there are more data than slots) */
  const totalPages = ref(1)
  /** Group of pages in current pagination
   * (ex: <page 1, 2, 3, 4, 5> = <slot 1>) */
  const currentSlot = computed(() =>
    Math.ceil(currentPage.value / pagesPerSlot)
  )
  /** Items of current page */
  const items = ref<T[]>([]) as Ref<T[]>
  /** Items of current slot */
  const slotItems = ref<T[]>([]) as Ref<T[]>
  /** Last item of current slot */
  const cursor = ref(0)
  /** Cursors of previous slots. (work as stack) */
  const previousCursors = ref<number[]>([])

  const { loading, refetch, onResult } = useQuery<Response<T>>(
    query,
    { ...variable, take: take * pagesPerSlot + 1 },
    { errorPolicy: 'all', notifyOnNetworkStatusChange: true }
  )

  // When data is fetched,
  onResult((res) => {
    if (res.errors) {
      const toast = useToast()
      for (const error of res.errors) {
        toast({ type: 'error', message: error.message })
      }
      return
    }

    for (const key in res.data) {
      const data = res.data[key]

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
    }

    // Update items of current page
    items.value = slotItems.value.slice(
      ((currentPage.value - 1) % pagesPerSlot) * take,
      ((currentPage.value - 1) % pagesPerSlot) * take + take
    )
  })

  const changePage = async (page: number) => {
    const oldSlot = currentSlot.value
    currentPage.value = page // updates currentSlot automatically (computed)
    if (currentSlot.value > oldSlot) {
      previousCursors.value.push(cursor.value)
      cursor.value = Number(slotItems.value.at(-1)?.id)
      await refetch({ cursor: cursor.value || null })
    } else if (currentSlot.value < oldSlot) {
      cursor.value = Number(previousCursors.value.pop())
      await refetch({ cursor: cursor.value || null })
    } else {
      items.value = slotItems.value.slice(
        ((currentPage.value - 1) % pagesPerSlot) * take,
        ((currentPage.value - 1) % pagesPerSlot) * take + take
      )
    }
  }

  return {
    items,
    totalPages,
    changePage,
    loading
  }
}
