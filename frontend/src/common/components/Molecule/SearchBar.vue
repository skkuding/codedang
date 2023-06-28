<script setup lang="ts">
import { ref } from 'vue'
import IconMagnifyingGlass from '~icons/fa6-solid/magnifying-glass'
import Button from '../Atom/Button.vue'

defineProps<{
  placeholder?: string
}>()

defineEmits<{
  (e: 'search', value: string): void
}>()

const data = ref('')
</script>

<template>
  <div class="flex w-fit">
    <input
      v-model="data"
      class="border-gray-dark focus:border-green peer h-9 rounded-l-lg border-2 bg-transparent px-2 focus:ring-0"
      type="text"
      :placeholder="placeholder"
      @keyup.enter="$emit('search', data)"
    />
    <Button
      color="gray-dark"
      class="border-gray-dark peer-focus:bg-green peer-focus:border-green rounded-l-none rounded-r-lg border-2 border-l-0"
      @click="$emit('search', data)"
    >
      <IconMagnifyingGlass class="text-white" />
    </Button>
  </div>
</template>
