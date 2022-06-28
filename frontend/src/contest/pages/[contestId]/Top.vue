<script setup lang="ts">
import MyComponent from '@/contest/components/MyComponent.vue'
defineProps<{
  contestId: number
}>()
</script>

<template>
  <div>This is contest top page : id = {{ contestId }}</div>
  <MyComponent msg="contest top page!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'ContestTop',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
