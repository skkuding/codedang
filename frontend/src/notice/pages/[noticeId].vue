<script setup lang="ts">
import MyComponent from '@/notice/components/MyComponent.vue'
defineProps<{
  noticeId: number
}>()
</script>

<template>
  <div>This is notice detail page : id = {{ noticeId }}</div>
  <MyComponent msg="notice detail!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'NoticeDetail',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
