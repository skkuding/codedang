<script setup lang="ts">
import PageSubtitle from '@/client/src/common/components/Atom/PageSubtitle.vue'

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
    <ul
      class="border-gray grid grid-cols-1 gap-4 rounded border py-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <li
        v-for="{ id, username, studentId } in userList"
        :key="id"
        :class="id === creator ? 'text-green' : ''"
        class="flex items-center justify-center gap-1 px-8 py-2"
      >
        <span class="font-medium">{{ username }}</span>
        <span class="text-xs">({{ studentId }})</span>
      </li>
    </ul>
  </section>
</template>
