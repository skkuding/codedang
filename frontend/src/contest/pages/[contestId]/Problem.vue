<script setup lang="ts">
import MyComponent from '@/contest/components/MyComponent.vue'
defineProps<{
  contestId: number
}>()
</script>

<template>
  <div>This is contest problem page : id = {{ contestId }}</div>
  <MyComponent msg="contest problem!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'ContestProblem',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
