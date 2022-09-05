<script setup lang="ts">
import PageTitle from '../../../common/components/Atom/PageTitle.vue'
import { ref } from 'vue'
import Badge from '../../../common/components/Molecule/Badge.vue'
import Tab from '../../../common/components/Molecule/Tab.vue'
import top from '../../components/top.vue'
import problem from '../../components/problem.vue'
import ranking from '../../components/ranking.vue'
import notice from '../../components/notice.vue'
import { onBeforeUnmount } from 'vue'

const currentTime = ref(new Date().toLocaleString('ko'))
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString()
}
const updateTimeInterval = setInterval(updateCurrentTime, 1000)
onBeforeUnmount(() => {
  clearInterval(updateTimeInterval)
})
</script>

<template>
  <div class="mx-auto mt-10 h-[760px] w-10/12">
    <div class="mb-5 flex justify-between">
      <PageTitle text="SKKU Coding Platform 2차 모의대회" />
      <Badge color="green">{{ currentTime }}</Badge>
    </div>
    <Tab :items="['top', 'problem', 'notice', 'standings']">
      <template #top><top /></template>
      <template #notice><notice /></template>
      <template #problem><problem /></template>
      <template #ranking><ranking /></template>
    </Tab>
  </div>
</template>
