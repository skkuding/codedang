<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import { onMounted, ref } from 'vue'
import Badge from '@/common/components/Molecule/Badge.vue'
import Tab from '@/common/components/Molecule/Tab.vue'
import top from '../../components/top.vue'
import problem from '../../components/problem.vue'
import ranking from '../../components/ranking.vue'
import notice from '../../components/notice.vue'
import { useNow, useDateFormat } from '@vueuse/core'
import axios from 'axios'

const formatter = ref('YYYY-MM-DD HH:mm:ss')
const time = useDateFormat(useNow(), formatter)
const items = ref([])
onMounted(async () => {
  const response = await axios.get('/api/contest/1/problem?offset=0&limit=10')
  items.value = response.data
})
</script>

<template>
  <div class="mt-10">
    <div class="mb-5 flex justify-between">
      <PageTitle text="SKKU Coding Platform 2차 모의대회" class="mb-14" />
      <Badge color="green">{{ time }}</Badge>
    </div>
    <Tab :items="['top', 'problem', 'notice', 'ranking']" class="font-bold">
      <template #top><top /></template>
      <template #notice><notice /></template>
      <template #problem>
        <problem />
        {{ items }}
      </template>
      <template #ranking><ranking /></template>
    </Tab>
  </div>
</template>
