<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  placeholder: string
  required: boolean
  shadow: boolean
}>()

defineEmits(['update:data'])
const data = ref('')

function setShadow() {
  return props.shadow
    ? 'drop-shadow-input focus:drop-shadow-inputfocus'
    : 'border-gray border focus:border-green focus:ring-green focus:ring-1'
}
function setRequired() {
  return props.required ? 'block' : 'hidden'
}
</script>

<template>
  <input
    v-model="data"
    :placeholder="placeholder"
    :class="setShadow()"
    class="w-full rounded-lg py-2.5 px-5 text-base font-bold focus:outline-none"
    @input="$emit('update:data', data)"
  />
  <div :class="setRequired()" class="text-red pt-1 text-xs font-bold">
    {{ placeholder + ' is required' }}
  </div>
</template>
