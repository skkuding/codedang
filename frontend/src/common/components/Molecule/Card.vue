<script setup lang="ts">
defineProps<{
  href: string
  items: {
    title: string
    date?: string
    href?: string
    state?: string
  }[]
}>()
</script>

<template>
  <section class="border-gray/25 w-full rounded-lg border-2 p-5 shadow-xl">
    <div class="mb-4 flex justify-between text-xl font-bold">
      <span class="flex items-center">
        <slot name="title" />
      </span>
      <slot name="titleIcon" />
      <slot name="cardStatus" />
    </div>
    <div class="flex flex-col gap-1">
      <template v-for="(item, index) in items">
        <router-link
          v-if="item.href"
          :key="item.title"
          :to="item.href"
          class="hover:bg-gray/25 active:bg-gray/50 flex cursor-pointer items-center rounded p-1"
        >
          <span><slot name="icon" :item="item.state" /></span>
          <span class="ml-2 mr-auto">{{ item.title }}</span>
          <span class="text-right">{{ item.date }}</span>
        </router-link>
        <div v-else :key="index" class="flex items-center rounded p-1">
          <span><slot name="icon" :item="item.state" /></span>
          <span class="ml-2 mr-auto">{{ item.title }}</span>
          <span class="text-right">{{ item.date }}</span>
        </div>
      </template>
    </div>
  </section>
</template>
