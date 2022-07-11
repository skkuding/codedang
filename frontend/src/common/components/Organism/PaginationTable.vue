<script setup lang="ts">
import { computed } from 'vue'
import SearchBar from '../Molecule/SearchBar.vue'
import Pagination from '../Molecule/Pagination.vue'

const props = defineProps<{
  fields?: Array
  items?: Array
  perPage?: number
  currentPage?: number
  text?: string
  noHeader?: boolean
  noBorder?: boolean
}>()

const emit = defineEmits(['row-clicked'])

const startIndex = computed(() => {
  return (props.currentPage - 1) * props.perPage
})

const endIndex = computed(() => {
  return props.currentPage * props.perPage - 1
})

const clickEvent = (row) => {
  const data = row
  emit('row-clicked', data)
}

const capitalize = (key) => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}
</script>

<template>
  <div class="flex justify-end">
    <SearchBar placeholder="keywords" class="mb-5"></SearchBar>
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
      <template v-for="(row, index) in items" v-else>
        <tr
          v-if="index >= startIndex && index <= endIndex"
          :key="index"
          class="hover:bg-gray-light border-gray cursor-pointer border-b"
          @click="clickEvent(row)"
        >
          <td v-for="(field, idx) in fields" :key="idx" class="p-2.5 pl-4">
            <slot :name="field.key" :row="row" :index="index"></slot>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
  <Pagination :number-of-pages="5" />
</template>
