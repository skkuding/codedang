<script setup lang="ts">
import Card from './Card.vue'
import GridiconsNoticeOutline from '~icons/gridicons/notice-outline'
</script>

<template>
  <Story>
    <Card
      :noticelist="[
        { title: 'SKKUDING', date: '2020-03-03' },
        { title: 'SKKUDING', date: '2020-03-03' }
      ]"
    >
      <GridiconsNoticeOutline class="text-text-title text-xl" />
      <span class="ml-2">Notice</span>
    </Card>
  </Story>
</template>
