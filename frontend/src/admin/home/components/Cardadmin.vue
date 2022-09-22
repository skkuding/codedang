<script setup lang="ts">
import BiLock from '~icons/bi/lock'
defineProps<{
  href: string
  items: {
    title: string
    href: string
  }[]
}>()
</script>

<template>
  <section class="border-gray/25 w-full rounded-lg border-2 p-5 shadow-xl">
    <div class="mb-4 flex justify-between text-xl">
      <span class="flex items-center">
        <slot name="title" />
      </span>
      <div class="flex">
        <BiLock class="text-black" />
        private
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <router-link
        v-for="item in items"
        :key="item.title"
        :to="item.href"
        class="hover:bg-gray/25 active:bg-gray/50 flex cursor-pointer items-center rounded p-1"
      >
        <span class="ml-2 mr-auto">> {{ item.title }}</span>
      </router-link>
    </div>
  </section>
</template>
