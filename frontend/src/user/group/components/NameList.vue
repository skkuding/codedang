<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'

defineProps<{
  title: string
  userList: string[]
}>()
</script>

<template>
  <section class="flex flex-col items-center gap-6">
    <PageSubtitle :text="title" />
    <ul
      class="border-gray grid grid-cols-1 gap-4 rounded border py-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <li
        v-for="item in userList"
        :key="item"
        class="flex items-center justify-center gap-1 px-8 py-2"
      >
        <span class="font-medium">{{ item }}</span>
      </li>
    </ul>
  </section>
</template>
