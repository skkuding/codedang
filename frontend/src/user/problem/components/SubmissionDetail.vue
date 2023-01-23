<script setup lang="ts">
import { ref, watch } from 'vue'
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'

const code = ref('')
defineProps<{
  modelValue: string
  lang?: 'cpp' | 'python' | 'javascript' | 'java'
}>()
const emit = defineEmits(['update:modelValue'])

watch(code, (value) => {
  emit('update:modelValue', value)
})
</script>

<template>
  <div>
    <CodeEditor v-model="code" :lang="lang"></CodeEditor>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
