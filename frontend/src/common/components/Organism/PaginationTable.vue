<script setup lang="ts">
import SearchBar from '../Molecule/SearchBar.vue'
import Pagination from '../Molecule/Pagination.vue'

defineProps<{
  fields: {
    key: string
    label?: string
  }[]
  items: {
    [key: string]: any
  }[]
  perPage?: number
  // currentPage?: number
  text?: string // show text if there's no data in item
  noHeader?: boolean
  noSearchBar?: boolean
  noPagination?: boolean
}>()

defineEmits(['row-clicked'])

// const startIndex = computed(() => {
//   return (props.currentPage - 1) * props.perPage
// })

// const endIndex = computed(() => {
//   return props.currentPage * props.perPage - 1
// })

const capitalize = (key: string) => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}
</script>

<template>
  <div class="flex justify-end">
    <SearchBar
      v-if="!noSearchBar"
      placeholder="keywords"
      class="mb-5"
    ></SearchBar>
  </div>
  <table class="mb-5 w-full table-auto">
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
      <template v-for="(row, index) in items" v-else :key="index">
        <!-- <tr
          v-if="index >= startIndex && index <= endIndex"
          :key="index"
          class="hover:bg-gray-light border-gray cursor-pointer border-b"
          @click="clickEvent(row)"
        > -->
        <tr
          class="hover:bg-gray-light border-gray cursor-pointer border-b"
          @click="$emit('row-clicked', row)"
        >
          <td v-for="(field, idx) in fields" :key="idx" class="p-2.5 pl-4">
            <slot :name="field.key" :row="row" :index="index"></slot>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
  <Pagination v-if="!noPagination" :number-of-pages="5" />
</template>
