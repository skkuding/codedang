<script setup lang="ts">
import SubmissionList from '../components/SubmissionList.vue'

defineProps<{
  id: number
}>()
</script>

<template>
  <div>This is problem detail page : id = {{ id }}</div>
  <SubmissionList></SubmissionList>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
