import type { DocumentNode } from '@apollo/client/core'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
// import type {
//   ExecutableDefinitionNode,
//   FieldNode,
//   FragmentSpreadNode
// } from 'graphql/language'
import { ref, computed, type Ref } from 'vue'

/**
 * Single item of the list
 * @param id: unique identifier of the item
 */
interface Item {
  id: unknown
}
/**
 * @param path: url path to call (ex: 'user', () => `group/${id}/user`)
 * @param take: number of items to take per page
 * @param pagesPerSlot: number of pages per slot
 */
export const useListAPI = <T extends Item>(
  path: DocumentNode,
  variable: () => { [key: string]: unknown },
  // take = 20,
  pagesPerSlot = 5
) => {
  interface ResponseType {
    [key: string]: T[]
  }
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
  const cursor = ref<number>(variable().cursor as number)
  /** Number of items on each page */
  const take: number = variable().take as number
  /** Cursors of previous slots. (work as stack) */
  const previousCursors = ref<number[]>([])
  /** GraphQL variables */
  const newVariable = computed(() => {
    return cursor.value
      ? {
          ...variable(),
          cursor: cursor.value,
          take: take * pagesPerSlot + 1
        }
      : {
          ...variable(),
          take: take * pagesPerSlot + 1
        }
  })

  /** Call list API from server */
  const { result, loading, error, refetch } = useQuery<ResponseType>(
    gql`
      ${path}
    `,
    variable,
    { errorPolicy: 'all' }
  )

  const setValue = (data: ResponseType) => {
    const apiName = path.definitions[0].selectionSet.selections[0].name.value // as OperationDefinitionNode | FragmentDefinitionNode
    const res: T[] = data[apiName]

    if (res.length > take * pagesPerSlot) {
      totalPages.value = currentSlot.value * pagesPerSlot + 1
      slotItems.value = res.slice(0, take * pagesPerSlot)
    } else {
      totalPages.value = Math.max(
        (currentSlot.value - 1) * pagesPerSlot + Math.ceil(res.length / take),
        1
      )
      slotItems.value = res
    }
  }

  const getList = async () => {
    if (error.value) {
      console.log(error.value)
      return
    }
    if (variable() === newVariable.value && result.value) {
      result.value = undefined
    } else {
      await refetch(newVariable.value)?.then(({ data }) => {
        setValue(data)
      })
    }
  }

  const changePage = async (page: number) => {
    const oldSlot = currentSlot.value
    currentPage.value = page // updates currentSlot as well
    if (currentSlot.value > oldSlot) {
      previousCursors.value.push(cursor.value as number)
      cursor.value = slotItems.value[slotItems.value.length - 1].id as number
      await getList()
    } else if (currentSlot.value < oldSlot) {
      cursor.value = previousCursors.value.pop() as number
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
