<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'

interface User {
  id: number
  username: string
  studentId: string
  role: string
}

defineProps<{
  title: string
  creator: number
  userList: User[]
}>()
</script>

<template>
  <section class="flex flex-col items-center gap-6">
    <PageSubtitle :text="title" />
    <ul class="border-gray flex flex-col gap-4 rounded border py-4">
      <li
        v-for="{ id, username, studentId } in userList"
        :key="id"
        class="flex items-center justify-center gap-1 py-2 px-8"
        :style="id === creator ? 'color: green' : ''"
      >
        <span class="font-medium">{{ username }}</span>
        <span class="text-xs">({{ studentId }})</span>
      </li>
    </ul>
  </section>
</template>
