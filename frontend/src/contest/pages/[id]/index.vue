<script setup lang="ts">
import PageTitle from '../../../common/components/Atom/PageTitle.vue'
import { computed } from 'vue'
import Badge from '../../../common/components/Molecule/Badge.vue'
import Tab from '../../../common/components/Molecule/Tab.vue'
import top from '../../components/top.vue'
import problem from '../../components/problem.vue'
import ranking from '../../components/ranking.vue'
import notice from '../../components/notice.vue'
import { useTimestamp } from '@vueuse/core'

const timestamp = useTimestamp()
const currentTime = computed(() => new Date(timestamp.value))
</script>

<template>
  <div class="mx-auto mt-10 h-[760px] w-10/12">
    <div class="mb-5 flex justify-between">
      <PageTitle text="SKKU Coding Platform 2차 모의대회" class="mb-14" />
      <Badge color="green">{{ currentTime }}</Badge>
    </div>
    <Tab :items="['top', 'problem', 'notice', 'ranking']" class="!font-bold">
      <template #top><top /></template>
      <template #notice><notice /></template>
      <template #problem><problem /></template>
      <template #ranking><ranking /></template>
    </Tab>
  </div>
</template>
