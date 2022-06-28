<script setup lang="ts">
import MyComponent from '@/notice/components/MyComponent.vue'
</script>

<template>
  <div>This is notice list page</div>
  <MyComponent msg="notice list!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'NoticeList',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
