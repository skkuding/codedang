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
  <div>
    <PageSubtitle :text="title" />
    <div
      class="border-gray grid grid-cols-1 gap-y-3.5 rounded-md border p-6 text-center sm:grid-cols-3 lg:grid-cols-5"
    >
      <div v-for="user in userList" :key="user.id" :class="isCreator(user.id)">
        {{ user.username + '(' + user.studentId + ')' }}
      </div>
    </div>
  </div>
</template>
