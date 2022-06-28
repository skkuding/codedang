<script setup lang="ts">
import MyComponent from '@/problem/components/MyComponent.vue'
defineProps<{
  problemId: number
}>()
</script>

<template>
  <div>This is problem detail page : id = {{ problemId }}</div>
  <MyComponent msg="problem detail!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'ProblemDetail',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
