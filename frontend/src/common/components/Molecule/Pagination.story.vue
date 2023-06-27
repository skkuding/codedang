<script setup lang="ts">
import { ref } from 'vue'
import Pagination from './Pagination.vue'

const currentPage = ref(1)
</script>

<template>
  <Story>
    <Variant title="light">
      <template #default>
        <Pagination v-model="currentPage" :number-of-pages="19" mode="light" />
      </template>
      <!-- [workaround] use `source` slot to show v-model -->
      <template #source>
        <textarea v-pre>
          <Pagination v-model="currentPage" :number-of-pages="19" />
        </textarea>
      </template>
    </Variant>
    <Variant title="dark">
      <template #default>
        <Pagination v-model="currentPage" :number-of-pages="19" mode="dark" />
      </template>
      <!-- [workaround] use `source` slot to show v-model -->
      <template #source>
        <textarea v-pre>
          <Pagination v-model="currentPage" :number-of-pages="19" mode="dark" />
        </textarea>
      </template>
    </Variant>
  </Story>
</template>
