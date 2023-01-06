<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchBar from '../Molecule/SearchBar.vue'
import Pagination from '../Molecule/Pagination.vue'

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
  items: {
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }[]
  placeholder?: string
  numberOfPages: number
  text?: string // show if there's no data in item
  noHeader?: boolean
  noSearchBar?: boolean
  noPagination?: boolean
  mode?: 'light' | 'dark'
}>()

const emit = defineEmits(['row-clicked', 'change-page', 'search'])

const subhead = computed(() => {
  return props.fields.reduce((prev: SubfieldType[], cur: FieldType) => {
    return prev.concat(cur.subfields || [])
  }, [])
})

const entries = computed(() => {
  return props.fields.reduce(
    (prev: (SubfieldType | FieldType)[], cur: FieldType) => {
      return prev.concat(cur.subfields || cur)
    },
    []
  )
})

const entryStyle = (key: string) => {
  let field = props.fields.find((x) => x.key === key)
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

watch(currentPage, (value) => {
  emit('change-page', value)
})
</script>

<template>
  <div>
    <div class="mb-5 flex justify-end">
      <slot name="option"></slot>
      <SearchBar
        v-if="!noSearchBar"
        :placeholder="placeholder"
        class="ml-5"
        :class="!mode || mode === 'light' ? '' : 'text-white'"
        @search="search"
      ></SearchBar>
    </div>
    <div class="min-w-full overflow-x-scroll">
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
        <tbody>
          <tr v-if="items.length === 0">
            <td
              :colspan="entries.length"
              class="p-2.5 pl-4"
              :class="{ 'text-white': mode !== 'light' }"
            >
              {{ text || 'No Data' }}
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, index) in items"
              :key="index"
              class="border-gray cursor-pointer border-y"
              :class="rowColor[mode || 'light']"
              @click="$emit('row-clicked', row)"
            >
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
          </template>
        </tbody>
      </table>
    </div>
    <div class="flex justify-center">
      <Pagination
        v-if="!noPagination"
        v-model="currentPage"
        class="mt-8"
        :number-of-pages="numberOfPages"
        :mode="mode"
      />
    </div>
  </div>
</template>
