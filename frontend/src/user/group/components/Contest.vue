<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import { useAuthStore } from '@/common/store/auth'
import { useNow, useTimeAgo, useIntersectionObserver } from '@vueuse/core'
import axios from 'axios'
import { onMounted, ref, watchEffect } from 'vue'

const props = defineProps<{
  id: number
}>()

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
const contentList = ref<State>({
  registered: [],
  upcoming: [],
  ongoing: [],
  finished: []
})
const hasNextPage = ref(true)
const cursor = ref(0)
const take = 10
const store = useAuthStore()
// get unfinished contests (registered, upcoming, ongoing)
onMounted(async () => {
  if (!store.isLoggedIn) return // 비로그인 시 어떤 로직 수행??
  const { data } = await axios.get<Omit<Response, 'finished'>>(
    `/api/group/${props.id}/contest`
  )
  contentList.value = {
    ...contentList.value,
    registered: data.registeredOngoing.concat(...data.registeredUpcoming),
    upcoming: data.upcoming,
    ongoing: data.ongoing
  }
})
// get finished contests
watchEffect(async () => {
  if (!store.isLoggedIn) return // 비로그인시 어떤 로직 수행???
  if (!hasNextPage.value) return
  const url = cursor.value
    ? `/api/group/${props.id}/contest/finished?take=${take}&cursor=${cursor.value}`
    : `/api/group/${props.id}/contest/finished?take=${take}`
  try {
    const { data } = await axios.get<Pick<Response, 'finished'>>(url)
    contentList.value.finished.push(...data.finished)
    if (data.finished.length < take) {
      hasNextPage.value = false
    }
  } catch (e) {
    console.log(e)
  }
})
// infinite scroll for finished contests
const target = ref(null)
useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting && contentList.value.finished.length > 0) {
    cursor.value =
      contentList.value.finished[contentList.value.finished.length - 1].id
  }
})
// padStart 사용하면 에러 발생하여 대안책 사용
const padTo2Digits = (str: string) => {
  return str.length >= 2 ? str : `0${str}`
}
const convertMsToTime = (milliseconds: number) => {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  seconds = seconds % 60
  minutes = minutes % 60
  hours = hours % 24

  return `${padTo2Digits(String(hours))}:${padTo2Digits(
    String(minutes)
  )}:${padTo2Digits(String(seconds))}`
}
const now = useNow()
const DAY = 1000 * 60 * 60 * 24
const getTimeInfo = (key: keyof State, date: Date) => {
  const diff = now.value.getTime() - date.getTime()
  if (key === 'finished') {
    return `Finished ${useTimeAgo(date).value}`
  } else if (diff < -DAY) {
    return `Start After ${useTimeAgo(date).value}`
  } else if (diff <= 0) {
    return `Start After ${convertMsToTime(-diff)}`
  } else if (diff < DAY) {
    return `Started Before ${convertMsToTime(diff)}`
  } else {
    return `Started Before ${useTimeAgo(date).value}`
  }
}
</script>

<template>
  <div
    class="mb-8 flex flex-col items-end justify-end gap-x-4 gap-y-2 lg:flex-row"
  >
    <SearchBar placeholder="원하는 대회를 검색해보세요!" />
  </div>
  <div class="flex flex-col gap-16">
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
      <div v-if="key === 'finished'" ref="target" />
    </section>
  </div>
</template>
