<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
</script>

<template>
  <div>This is contest list page</div>
  <MyComponent msg="contest list!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'ContestList',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
