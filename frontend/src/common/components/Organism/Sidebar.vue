<script setup lang="ts">
import CodingPlatformLogo from '@/common/components/Atom/CodingPlatformLogo.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IconBox from '~icons/bi/box'
import IconCode from '~icons/bi/code-square'
import IconFile from '~icons/bi/file-text'
import IconBiHouse from '~icons/bi/house'
import IconBook from '~icons/bi/journals'
import IconTrophy from '~icons/bi/trophy'
import IconUser from '~icons/fa6-regular/user'
import IconBrain from '~icons/fluent/brain-circuit-24-regular'

// TODO: get group name and color
const props = withDefaults(
  defineProps<{
    color?: 'blue' | 'gray' | 'white'
  }>(),
  {
    color: 'white'
  }
)

const route = useRoute()

const colorMapper = {
  blue: 'border-l-blue',
  gray: 'border-l-gray',
  white: 'border-l-white',
  default: 'border-l-green'
}

const commonItems = [
  { to: '/admin/notice', name: 'Notice', icon: IconFile },
  { to: '/admin/contest', name: 'Contest', icon: IconTrophy },
  { to: '/admin/workbook', name: 'Workbook', icon: IconBook },
  { to: '/admin/problem', name: 'Problem', icon: IconBrain },
  { to: '/admin/pool', name: 'Problem Pool', icon: IconBox }
]

const groupItems = (id: number) => [
  { to: `/admin/${id}`, name: 'SKKUDING', icon: IconBiHouse },
  { to: `/admin/${id}/notice`, name: 'Notice', icon: IconFile },
  { to: `/admin/${id}/contest`, name: 'Contest', icon: IconTrophy },
  { to: `/admin/${id}/workbook`, name: 'Workbook', icon: IconBook },
  { to: `/admin/${id}/problem`, name: 'Problem', icon: IconBrain },
  { to: `/admin/${id}/pool`, name: 'Problem Pool', icon: IconBox },
  { to: `/admin/${id}/member`, name: 'Member', icon: IconUser },
  { to: `/admin/${id}/submission`, name: 'Submission', icon: IconCode }
]

const items = computed(() =>
  route.params.groupId
    ? groupItems(parseInt(route.params.groupId as string))
    : commonItems
)
</script>

<template>
  <div class="bg-gray-light text-gray-dark h-screen w-48 overflow-auto">
    <router-link to="/admin" class="align-center flex justify-center">
      <CodingPlatformLogo class="my-8 w-32" />
    </router-link>

    <hr class="bg-gray h-0.5 border-none opacity-25" />
    <div v-for="{ to, name, icon } in items" :key="name">
      <router-link
        class="flex items-center p-2 pl-10 font-medium hover:shadow"
        :active-class="colorMapper[color || 'default'] + ' border-l-8 !pl-8'"
        :to="to"
      >
        <component :is="icon" class="mr-2 h-4" />
        {{ name }}
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />
    </div>
  </div>
</template>
