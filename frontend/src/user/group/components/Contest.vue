<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/common/store/auth'
import { useDateFormat, useNow, useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  id: number
}>()

const filters = ['Latest', 'Ongoing']
const selectedFilter = ref(filters[0])

// server data
type ContestList = {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  group: {
    id: number
    groupName: string
  }
}[]
type Response = {
  registeredOngoing: ContestList
  registeredUpcoming: ContestList
  ongoing: ContestList
  upcoming: ContestList
  finished: ContestList
}
type State = Pick<Response, 'finished' | 'ongoing' | 'upcoming'> & {
  registered: ContestList
}
const contentList = ref<State | null>(null)
const store = useAuthStore()
onMounted(async () => {
  // 임시 코드
  if (!store.isLoggedIn) {
    await store.login('user10', 'Useruser')
  }

  const { data } = await axios.get<Response>(`/api/group/${props.id}/contest`)
  contentList.value = {
    registered: data.registeredOngoing.concat(...data.registeredUpcoming),
    upcoming: data.upcoming,
    ongoing: data.ongoing,
    finished: data.finished
  }
})
const now = useNow()
const DAY = 1000 * 60 * 60 * 24
const getTimeInfo = (key: keyof State, date: Date) => {
  const diff = now.value.getTime() - date.getTime()
  if (key === 'finished') {
    return `Finished ${useTimeAgo(date).value} ago`
  } else if (diff < -DAY) {
    return `Start After ${useTimeAgo(date).value}`
  } else if (diff <= 0) {
    return `Start After ${useDateFormat(new Date(-diff), 'HH:mm:ss').value}`
  } else if (diff < DAY) {
    return `Started Before ${useDateFormat(new Date(diff), 'HH:mm:ss').value}`
  } else {
    return `Started Before ${useTimeAgo(date).value}`
  }
}
</script>

<template>
  <div
    class="mb-8 flex flex-col items-end justify-end gap-y-2 gap-x-4 lg:flex-row"
  >
    <RadioButton v-model="selectedFilter" :texts="filters" />
    <SearchBar placeholder="원하는 대회를 검색해보세요!" />
  </div>
  <div v-if="contentList !== null" class="flex flex-col gap-16">
    <section
      v-for="key in ['registered', 'ongoing', 'upcoming', 'finished'] as const"
      :key="key"
      class="flex flex-col justify-center gap-4"
    >
      <PageSubtitle :text="`${key} Contest`" class="capitalize" />
      <p
        v-if="contentList[key].length === 0"
        class="text-gray-dark font-semibold"
      >
        No Contest
      </p>
      <CardItem
        v-for="{
          id: contestId,
          title,
          startTime,
          endTime,
          group
        } in contentList[key]"
        :key="contestId"
        :title="title"
        :description="`For ${group.groupName}`"
        :colored-text="
          getTimeInfo(key, new Date(key === 'finished' ? endTime : startTime))
        "
        :border-color="key === 'registered' ? 'green' : 'gray'"
        class="w-full bg-white capitalize drop-shadow-md"
        @click="$router.push(`/contest/${contestId}`)"
      />
    </section>
  </div>
</template>
