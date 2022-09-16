<script setup lang="ts">
import Card from '@/user/home/components/Card.vue'
import Sidebar from '@/common/components/Organism/Sidebar.vue'

const groupItems1 = [
  {
    title: 'npc 초급반 학생들이 있는 곳',
    href: '#'
  },
  {
    title: 'member: 20명',
    href: '#'
  }
]
const groupItems2 = [
  {
    title: 'npc 중급반 학생들이 있는 곳',
    href: '#'
  },
  {
    title: 'member: 23명',
    href: '#'
  }
]
const groupItems3 = [
  {
    title: 'npc 고급반 학생들이 있는 곳',
    href: '#'
  },
  {
    title: 'member: 20명',
    href: '#'
  }
]
</script>

<template>
  <Sidebar class="fixed left-0"></Sidebar>
  <Card href="#" :items="groupItems1" class="ml-20 w-1/3">
    <template #title>NPC 초급반</template>
  </Card>

  <Card href="#" :items="groupItems2" class="ml-80 w-1/3">
    <template #title>NPC 중급반</template>
  </Card>

  <Card href="#" :items="groupItems3" class="ml-20 w-1/3">
    <template #title>NPC 고급반</template>
  </Card>
</template>
