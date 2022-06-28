<script setup lang="ts">
import MyComponent from '@/group/components/MyComponent.vue'
defineProps<{
  groupId: number
}>()
</script>

<template>
  <div>This is group member page : id = {{ groupId }}</div>
  <MyComponent msg="group member!" />
</template>

<script lang="ts">
// setup()을 제외한 나머지 script code를 작성해주세요.
export default {
  name: 'GroupMember',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
