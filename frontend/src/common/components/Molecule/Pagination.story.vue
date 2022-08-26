<script setup lang="ts">
import { ref } from 'vue'
import Pagination from './Pagination.vue'

const currentPage = ref(1)
</script>

<template>
  <Story>
    <Variant>
      <template #default>
        <Pagination v-model="currentPage" :number-of-pages="10" />
      </template>
      <!-- [workaround] use `source` slot to show v-model -->
      <template #source>
        <textarea v-pre>
          <Pagination v-model="currentPage" :number-of-pages="10" />
        </textarea>
      </template>
    </Variant>
  </Story>
</template>
