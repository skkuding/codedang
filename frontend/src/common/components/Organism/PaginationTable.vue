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
  placeholder?: string
  numberOfPages: number
  text?: string // show if there's no data in item
  noHeader?: boolean
  noSearchBar?: boolean
  noPagination?: boolean
}>()

defineEmits(['row-clicked'])

const capitalize = (key: string) => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}
</script>

<template>
  <div>
    <div class="flex justify-end">
      <SearchBar
        v-if="!noSearchBar"
        :placeholder="placeholder"
        class="mb-5"
        v-bind="$attrs"
      ></SearchBar>
    </div>
    <table class="mb-8 w-full table-auto">
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
              <slot :name="field.key" :row="row" :index="index"></slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <div class="flex justify-end">
      <Pagination
        v-if="!noPagination"
        v-bind="$attrs"
        :number-of-pages="numberOfPages"
      />
    </div>
  </div>
</template>
