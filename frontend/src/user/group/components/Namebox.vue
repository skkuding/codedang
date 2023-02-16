<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'

interface User {
  id: number
  username: string
  studentId: string
  role: string
}

const props = defineProps<{
  title: string
  creator: number
  userList: User[]
}>()

const isCreator = (id: number) => {
  if (id === props.creator) return 'text-green'
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <PageSubtitle :text="title" />
    <ul
      class="border-gray grid grid-cols-1 gap-3.5 rounded-md border p-6 text-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="{ id, username, studentId } in userList"
        :key="id"
        :class="isCreator(id)"
      >
        {{ username + ' (' + studentId + ')' }}
      </li>
    </ul>
  </section>
</template>
