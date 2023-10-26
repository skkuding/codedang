<script setup lang="ts" generic="T extends Record<string, any>">
import { useSortable } from '@vueuse/integrations/useSortable'
import { computed, ref, toRefs } from 'vue'
import Fa6SolidEquals from '~icons/fa6-solid/equals'
import Pagination from '../Molecule/Pagination.vue'
import SearchBar from '../Molecule/SearchBar.vue'

type SubfieldType = {
  key: string
  label?: string
}

type FieldType = SubfieldType & {
  width?: string
  subfields?: SubfieldType[]
}

const props = defineProps<{
  fields: FieldType[]
  items: T[]
  placeholder?: string
  numberOfPages: number
  text?: string // show if there's no data in item
  noHeader?: boolean
  pageSlot?: number
  noSearchBar?: boolean
  noPagination?: boolean
  mode?: 'light' | 'dark'
  editing?: boolean
}>()
const { fields, items } = toRefs(props)

const emit = defineEmits<{
  (e: 'rowClicked', row: T): void
  (e: 'changePage', page: number): void
  (e: 'search', input: string): void
  (e: 'update:items'): void
}>()

const subhead = computed(() => {
  return fields.value.reduce((prev: SubfieldType[], cur: FieldType) => {
    return prev.concat(cur.subfields || [])
  }, [])
})

const entries = computed(() => {
  return fields.value.reduce(
    (prev: (SubfieldType | FieldType)[], cur: FieldType) => {
      return prev.concat(cur.subfields || cur)
    },
    []
  )
})

const entryStyle = (key: string) => {
  let field = fields.value.find((x) => x.key === key)
  if (field && field.width) return 'width: ' + field.width
  else return ''
}

const headerColor = {
  light: 'text-text-title bg-[#F9F9F9]',
  dark: 'bg-transparent text-white'
}

const rowColor = {
  light: 'hover:bg-gray-light active:bg-gray/40',
  dark: 'hover:bg-white/20 active:bg-white/40 text-white'
}

const responsiveStyle = (index: number) => {
  return subhead.value.length === 0 && index > 2 ? 'hidden md:table-cell' : ''
}

const currentPage = ref(1)

const search = (inputData: string) => {
  currentPage.value = 1
  emit('search', inputData)
}

const el = ref<HTMLElement>()
useSortable(el, items, {
  handle: '.handle',
  animation: 200
})
</script>

<template>
  <div>
    <div class="mb-5 flex justify-end">
      <slot name="option" />
      <SearchBar
        v-if="!noSearchBar"
        :placeholder="placeholder"
        class="ml-5"
        :class="!mode || mode === 'light' ? '' : 'text-white'"
        @search="search"
      />
    </div>
    <div class="min-w-full overflow-x-scroll md:overflow-x-auto">
      <table
        class="table-fixed break-normal md:w-full md:break-all"
        :class="!noSearchBar ? 'mt-5' : ''"
      >
        <thead v-if="!noHeader">
          <tr
            :class="[
              { 'border-gray border-b-2': subhead.length === 0 },
              headerColor[mode || 'light']
            ]"
          >
            <th v-if="editing" class="w-1" />
            <th
              v-for="(field, index) in fields"
              :key="index"
              class="p-2.5 pl-4 text-left"
              :class="responsiveStyle(index)"
              :rowspan="field.subfields ? undefined : 2"
              :colspan="field.subfields ? field.subfields.length : undefined"
              :style="field.width ? 'width:' + field.width : ''"
            >
              <span v-if="Object.keys(field).includes('label')">
                {{ field.label }}
              </span>
              <span v-else class="capitalize">
                {{ field.key }}
              </span>
            </th>
          </tr>
          <!-- additional head row for subhead -->
          <tr
            v-if="subhead.length > 0"
            class="border-gray border-b-2 text-sm"
            :class="headerColor[mode || 'light']"
          >
            <th
              v-for="(subfield, index) in subhead"
              :key="index"
              class="p-2.5 pl-4 text-left"
            >
              <span v-if="Object.keys(subfield).includes('label')">
                {{ subfield.label }}
              </span>
              <span v-else class="capitalize">
                {{ subfield.key }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody ref="el">
          <tr v-if="items.length === 0">
            <td
              :colspan="entries.length"
              class="p-2.5 pl-4"
              :class="{ 'text-white': mode !== 'light' }"
            >
              {{ text || 'No Data' }}
            </td>
          </tr>
          <tr
            v-for="row in items"
            :key="row.id"
            class="border-gray cursor-pointer border-y"
            :class="rowColor[mode || 'light']"
            @click="$emit('rowClicked', row)"
          >
            <td v-if="editing" class="handle p-2.5 pl-4">
              <Fa6SolidEquals class="text-slate-300" />
            </td>
            <td
              v-for="(entry, idx) in entries"
              :key="idx"
              class="p-2.5 pl-4"
              :class="responsiveStyle(idx)"
              :style="entryStyle(entry.key)"
            >
              <slot :name="entry.key" :row="row">{{ row[entry.key] }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-center">
      <Pagination
        v-if="!noPagination"
        v-model="currentPage"
        class="mt-8"
        :page-slot="pageSlot"
        :number-of-pages="numberOfPages"
        :mode="mode"
        @change-page="(page: number) => emit('changePage', page)"
      />
    </div>
  </div>
</template>
