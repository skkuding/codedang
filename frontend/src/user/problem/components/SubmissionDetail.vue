<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'

defineProps<{
  lang?: 'cpp' | 'python' | 'javascript' | 'java'
}>()
const code = ref('ee')
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
