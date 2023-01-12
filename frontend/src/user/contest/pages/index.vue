<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import IconAnglesRight from '~icons/fa6-solid/angles-right'
import IconCaretDown from '~icons/fa6-solid/caret-down'
import IconCaretUp from '~icons/fa6-solid/caret-up'
import { useTimeAgo } from '@vueuse/core'
import { onMounted } from 'vue'
import axios from 'axios'
import { ref } from 'vue'

interface Group {
  id: number
  groupName: string
}

interface Contest {
  id: number
  title: string
  startTime: Date
  endTime: Date
  type: string
  group: Group
}

const items = ref<{ [key: string]: Contest[] }>({
  ongoing: [],
  upcoming: [],
  finished: []
})

onMounted(async () => {
  const response = await axios.get('/api/contest')
  items.value = response.data
})
const coloredText = (id: string, item: Contest) => {
  if (id === 'ongoing' || id === 'registerNow')
    return 'Started ' + useTimeAgo(item.startTime).value
  else if (id === 'upcoming') return 'Start ' + useTimeAgo(item.startTime).value
  else return 'Finished ' + useTimeAgo(item.endTime).value
}

const coloredTextShort = (id: string, item: Contest) => {
  if (id in ['ongoing', 'registerNow', 'upcoming'])
    return useTimeAgo(item.startTime).value
  else return useTimeAgo(item.endTime).value
}

const showFinished = ref(false)
</script>

<template>
  <div
    v-for="({ title, id }, index) in [
      { title: 'Ongoing Contests', id: 'ongoing' },
      { title: 'Upcoming Contests', id: 'upcoming' },
      { title: 'Finished Contests', id: 'finished' }
    ]"
    :key="index"
  >
    <div class="mt-8 mb-4 flex flex-row items-center">
      <PageSubtitle :text="title" :class="{ '!text-red': id === 'finished' }" />
      <IconAnglesRight v-if="id !== 'finished'" class="ml-2" />
      <div v-else>
        <IconCaretDown
          v-if="showFinished"
          class="text-red ml-2 cursor-pointer"
          @click="showFinished = !showFinished"
        />
        <IconCaretUp
          v-else
          class="text-red ml-2 cursor-pointer"
          @click="showFinished = !showFinished"
        />
      </div>
    </div>
    <div v-if="items[id]?.length === 0" class="text-gray-dark p-2.5 pl-4">
      No Contest
    </div>
    <div v-else-if="id !== 'finished' || showFinished">
      <div v-for="(item, idx) in items[id]" :key="idx">
        <CardItem
          :img="'https://www.skku.edu/_res/skku/img/skku_s.png'"
          :title="item.title"
          :colored-text="coloredText(id, item)"
          :colored-text-short="coloredTextShort(id, item)"
          class="mt-4"
          :border-color="id === 'finished' ? 'gray' : 'green'"
          @click="$router.push('/contest/' + item.id)"
        />
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  title: 🏆 SKKU Coding Platform
  coloredTitle: Contests
  subtitle: Compete with schoolmates & win the prizes!
</route>
