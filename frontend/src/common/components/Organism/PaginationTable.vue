<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchBar from '../Molecule/SearchBar.vue'
import Pagination from '../Molecule/Pagination.vue'

defineProps<{
  fields: {
    key: string
    label?: string
    width?: string
  }[]
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
    <table
      class="w-full table-fixed break-all"
      :class="!noSearchBar ? 'mt-5' : ''"
    >
      <thead v-if="!noHeader">
        <tr
          class="border-gray border-b-2"
          :class="headerColor[mode || 'light']"
        >
          <th
            v-for="(field, index) in fields"
            :key="index"
            class="p-2.5 pl-4 text-left"
            :class="index > 2 ? 'hidden md:table-cell' : ''"
            :style="field.width ? 'width:' + field.width : ''"
          >
            <span v-if="Object.keys(field).includes('label')">
              {{ field.label }}
            </span>
            <span v-else>
              {{ field.key.charAt(0).toUpperCase() + field.key.slice(1) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="items.length === 0">
          <td class="p-2.5 pl-4">{{ text }}</td>
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
              v-for="(field, idx) in fields"
              :key="idx"
              class="p-2.5 pl-4"
              :class="idx > 2 ? 'hidden md:table-cell' : ''"
            >
              <slot :name="field.key" :row="row">{{ row[field.key] }}</slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
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
