<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Badge from '@/common/components/Molecule/Badge.vue'
import Tab from '@/common/components/Molecule/Tab.vue'
import { useDateFormat, useNow } from '@vueuse/core'
import axios from 'axios'
import { ref } from 'vue'
import Notice from '../components/Notice.vue'
import Problem from '../components/Problem.vue'
// import Ranking from '../components/Ranking.vue'
import Top from '../components/Top.vue'

const props = defineProps<{
  id: string
}>()

const contest = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: ''
})
const formatter = ref('YYYY-MM-DD HH:mm:ss')
const time = useDateFormat(useNow(), formatter)

axios.get(`/api/contest/${props.id}`).then((res) => {
  contest.value = res.data
})
</script>

<template>
  <div class="mt-10">
    <div class="mb-5 flex justify-between">
      <PageTitle :text="contest.title" class="mb-14" />
      <Badge
        :color="
          contest.startTime > time || contest.endTime > time ? 'green' : 'red'
        "
      >
        {{ time }}
      </Badge>
    </div>
    <!-- <Tab :items="['top', 'problem', 'notice', 'ranking']" class="font-bold"> -->
    <Tab :items="['top', 'problem', 'notice']" class="font-bold">
      <template #top><Top :text="contest.description" /></template>
      <template #notice><Notice :id="Number(id)" /></template>
      <template #problem><Problem :id="Number(id)" /></template>
      <!-- <template #ranking><Ranking :id="Number(id)" /></template> -->
    </Tab>
  </div>
</template>
