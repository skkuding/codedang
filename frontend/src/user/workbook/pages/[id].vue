<script setup lang="ts">
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import IconCheck from '~icons/fa6-regular/circle-check'
import WorkbookTitle from '../components/WorkbookTitle.vue'
import { useWorkbook } from '../composables/workbook'

const props = defineProps<{
  id: string
}>()

const showTags = ref(false)
const fields = computed(() =>
  showTags.value
    ? [{ key: 'id', label: '#' }, { key: 'title' }, { key: 'tags' }]
    : [{ key: 'id', label: '#' }, { key: 'title' }]
)

// TODO: use API to get workbook-problem list of initial page

// TODO: implement change-page function to reset workbookProblemList using API when click pagination buttons

const TITLE_COLOR: ('green' | 'gray' | 'blue' | 'red')[] = [
  'gray',
  'green',
  'red',
  'blue'
]

const router = useRouter()
const { workbook, getWorkbook } = useWorkbook()

// TODO: show each problem tags separtely
// Since various tags can be assigned to single problem,
// tags are returned as array of strings from a server.
// ex1) `["Brute Force"]` => `Brute Force`
// ex2) `["String", "Graph"]` => `String` `Graph`

onMounted(async () => {
  try {
    await getWorkbook(parseInt(props.id))
  } catch (err) {
    router.replace('/404')
  }
})
</script>

<template>
  <div class="my-10">
    <WorkbookTitle
      :text="workbook?.title || ''"
      :color="TITLE_COLOR[parseInt(id) % 4]"
      class="mb-2"
    />
    <PaginationTable
      :fields="fields"
      :items="workbook?.problems || []"
      :number-of-pages="1"
      no-search-bar
      @row-clicked="({ id }) => $router.push('/problem/' + id)"
    >
      <template #option>
        <Switch v-model="showTags" label="Tags" />
      </template>

      <template #title="{ row }">
        <div class="flex items-center gap-2">
          {{ row.title }}
          <IconCheck v-if="row.result === 'accepted'" class="text-green" />
        </div>
      </template>
    </PaginationTable>
  </div>
</template>
