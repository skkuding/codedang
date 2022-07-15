<script setup lang="ts">
import Button from '../Atom/Button.vue'
import Search from '~icons/carbon/search'
import { ref } from 'vue'

defineProps<{
  placeholder?: string
}>()

defineEmits(['search'])
const data = ref('')
</script>

<template>
  <div class="flex w-fit">
    <input
      v-model="data"
      class="border-gray-dark rounded-l-lg border-2 px-2 focus:outline-0"
      type="text"
      :placeholder="placeholder"
      @keyup.enter="$emit('search', data)"
    />
    <Button
      color="gray-dark"
      class="border-gray-dark rounded-l-none rounded-r-lg border-2 border-l-0"
      @click="$emit('search', data)"
    >
      <Search />
    </Button>
  </div>
</template>

<style>
path {
  fill: white;
}
</style>
