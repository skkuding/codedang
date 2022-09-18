<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchBar from '../Molecule/SearchBar.vue'
import Pagination from '../Molecule/Pagination.vue'

type subfieldType = {
  key: string
  label?: string
}

type fieldType = subfieldType & {
  width?: string
  subfields?: subfieldType[]
}

const props = defineProps<{
  fields: fieldType[]
  items: {
    [key: string]: unknown
  }[]
  placeholder?: string
  numberOfPages: number
  text?: string // show if there's no data in item
  noHeader?: boolean
  noSearchBar?: boolean
  noPagination?: boolean
  mode?: 'light' | 'secondary' | 'dark'
}>()

const emit = defineEmits(['row-clicked', 'change-page', 'search'])

const subhead = computed(() => {
  return props.fields.reduce((prev: subfieldType[], cur: fieldType) => {
    return prev.concat(cur.subfields || [])
  }, [])
})

const entries = computed(() => {
  return props.fields.reduce(
    (prev: (subfieldType | fieldType)[], cur: fieldType) => {
      return prev.concat(cur.subfields || cur)
    },
    []
  )
})

const headerColor = {
  light: 'text-text-title bg-[#F9F9F9]',
  secondary: 'bg-transparent text-white',
  dark: 'bg-transparent text-white'
}

const rowColor = {
  light: 'hover:bg-gray-light',
  secondary: 'hover:bg-[#204A60] text-white',
  dark: 'hover:bg-[#212529] text-white'
}

const responsiveStyle = (index: number) => {
  return subhead.value.length > 0 ? '' : index > 2 ? 'hidden md:table-cell' : ''
}

const capitalize = (key: string) => {
  return key.charAt(0).toUpperCase() + key.slice(1)
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
    <div class="flex justify-end">
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
              <span v-else>
                {{ capitalize(field.key) }}
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
              <span v-else>
                {{ capitalize(subfield.key) }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td class="p-2.5 pl-4" :class="{ 'text-white': mode !== 'light' }">
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
