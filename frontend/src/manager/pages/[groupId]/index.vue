<script setup lang="ts">
import { useGroupStore } from '@/common/store/group'

// write script code
const props = defineProps<{
  groupId: string
}>()

const store = useGroupStore()
store.setGroup(parseInt(props.groupId))
</script>

<template>
  <div>write template code</div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
