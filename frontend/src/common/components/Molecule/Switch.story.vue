<script setup lang="ts">
import Switch from './Switch.vue'
import { ref } from 'vue'

const data = ref(false)
</script>

<template>
  <Story>
    <Switch v-model="data" label="Toggle me!" />
    <p>Current value: {{ data }}</p>
    <!-- [workaround] use `source` slot to show v-model -->
    <template #source>
      <textarea v-pre>
        <Switch v-model="data" label="Toggle me!" />
      </textarea>
    </template>
  </Story>
</template>
