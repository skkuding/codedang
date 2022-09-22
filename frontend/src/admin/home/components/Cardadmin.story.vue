<script setup lang="ts">
import Cardadmin from './Cardadmin.vue'

const groupItems1 = [
  {
    title: 'npc 초급반 학생들이 있는 곳',
    href: '/'
  },
  {
    title: 'member: 20명',
    href: '/'
  }
]
const groupItems2 = [
  {
    title: 'npc 중급반 학생들이 있는 곳',
    href: '/'
  },
  {
    title: 'member: 23명',
    href: '/'
  }
]
const groupItems3 = [
  {
    title: 'npc 고급반 학생들이 있는 곳',
    href: '/'
  },
  {
    title: 'member: 20명',
    href: '/'
  }
]
</script>

<template>
  <Story>
    <Variant title="GroupList">
      <Cardadmin href="#" :items="groupItems1" class="ml-20 w-1/3">
        <template #title>NPC 초급반</template>
      </Cardadmin>
    </Variant>
  </Story>
</template>
