<script setup lang="ts">
import { ref, watch } from 'vue'
import SearchBar from '../Molecule/SearchBar.vue'
import Pagination from '../Molecule/Pagination.vue'

defineProps<{
  fields: {
    key: string
    label?: string
  }[]
  items: {
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }[]
  placeholder?: string
  numberOfPages: number
  text?: string // show if there's no data in item
  noHeader?: boolean
  noSearchBar?: boolean
  noPagination?: boolean
}>()

const emit = defineEmits(['row-clicked', 'change-page', 'search'])

const currentPage = ref(1)

const search = (inputData: string) => {
  currentPage.value = 1
  emit('search', inputData)
}

watch(currentPage, (value) => {
  emit('change-page', value)
})

const capitalize = (key: string) => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}
</script>

<template>
  <div>
    <div class="mb-5 flex justify-end">
      <slot name="option"></slot>
      <SearchBar
        v-if="!noSearchBar"
        :placeholder="placeholder"
        class="ml-5"
        @search="search"
      ></SearchBar>
    </div>
    <table class="w-full table-auto">
      <thead v-if="!noHeader">
        <tr class="text-text-title border-gray border-b-2 bg-[#F9F9F9]">
          <th
            v-for="(field, index) in fields"
            :key="index"
            class="p-2.5 pl-4 text-left"
          >
            <span v-if="Object.keys(field).includes('label')">
              {{ field.label }}
            </span>
            <span v-else>{{ capitalize(field.key) }}</span>
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
            class="hover:bg-gray-light border-gray cursor-pointer border-y"
            @click="$emit('row-clicked', row)"
          >
            <td v-for="(field, idx) in fields" :key="idx" class="p-2.5 pl-4">
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
      />
    </div>
  </div>
</template>
