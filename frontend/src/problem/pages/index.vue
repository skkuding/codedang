<script setup lang="ts">
import MyComponent from '@/problem/components/MyComponent.vue'
</script>

<template>
  <div>This is problem list page</div>
  <MyComponent msg="problem list!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'ProblemList',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
