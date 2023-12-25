<script setup lang="ts">
import Logo from '@/common/assets/codedang.svg'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import IconCode from '~icons/bi/code-square'
// import IconFile from '~icons/bi/file-text'
import IconHome from '~icons/bi/house'

// import IconBook from '~icons/bi/journals'
// import IconTrophy from '~icons/bi/trophy'
// import IconUser from '~icons/fa6-regular/user'
// import IconBrain from '~icons/fluent/brain-circuit-24-regular'

const route = useRoute()
const router = useRouter()

const isActive = (to: string) => {
  const path = router.currentRoute.value.fullPath
  const group = route.params.groupId
  const base = `/admin${group && `/${group}`}`
  if (to === base) return path === base
  else return path.startsWith(to)
}

const commonItems = [
  { to: '/admin', name: 'Main', icon: IconHome }
  // { to: '/admin/notice', name: 'Notice', icon: IconFile },
  // { to: '/admin/contest', name: 'Contest', icon: IconTrophy },
  // { to: '/admin/workbook', name: 'Workbook', icon: IconBook },
  // { to: '/admin/problem', name: 'Problem', icon: IconBrain }
]

const groupItems = (id: number) => [
  { to: `/admin/${id}`, name: 'Main', icon: IconHome }
  // { to: `/admin/${id}/notice`, name: 'Notice', icon: IconFile },
  // { to: `/admin/${id}/contest`, name: 'Contest', icon: IconTrophy },
  // { to: `/admin/${id}/workbook`, name: 'Workbook', icon: IconBook },
  // { to: `/admin/${id}/problem`, name: 'Problem', icon: IconBrain },
  // { to: `/admin/${id}/member`, name: 'Member', icon: IconUser },
  // { to: `/admin/${id}/submission`, name: 'Submission', icon: IconCode }
]

const items = computed(() =>
  route.params.groupId
    ? groupItems(parseInt(route.params.groupId as string))
    : commonItems
)
</script>

<template>
  <div class="bg-gray-light text-gray-dark h-screen w-48 overflow-auto">
    <RouterLink to="/" class="align-center flex justify-center">
      <img :src="Logo" class="my-8 w-32" />
    </RouterLink>
    <hr class="bg-gray h-0.5 border-none opacity-25" />
    <div v-for="{ to, name, icon } in items" :key="name">
      <RouterLink
        class="flex items-center p-2 pl-10 font-medium hover:shadow"
        :class="isActive(to) && 'text-blue'"
        :to="to"
      >
        <component :is="icon" class="mr-2 h-4" />
        {{ name }}
      </RouterLink>
      <hr class="bg-gray h-0.5 border-none opacity-25" />
    </div>
  </div>
</template>
