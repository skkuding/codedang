<script setup lang="ts">
import IconBiHouse from '~icons/bi/house'
import IconFile from '~icons/bi/file-text'
import IconTrophy from '~icons/bi/trophy'
import IconUser from '~icons/fa6-regular/user'
import IconBrain from '~icons/fluent/brain-circuit-24-regular'
import IconBox from '~icons/bi/box'
import IconCode from '~icons/bi/code-square'
import IconBook from '~icons/bi/journals'
import { computed } from 'vue'
import CodingPlatformLogo from '../Atom/CodingPlatformLogo.vue'

// TODO: get group name and color
const props = defineProps<{
  group?: boolean
  color?: 'blue' | 'gray' | 'white'
}>()

const colorMapper = {
  blue: 'border-l-blue',
  gray: 'border-l-gray',
  white: 'border-l-white',
  default: 'border-l-green'
}

const commonItems = [
  { to: '/notice', name: 'Notice', icon: IconFile },
  { to: '/contest', name: 'Contest', icon: IconTrophy },
  { to: '/workbook', name: 'Workbook', icon: IconBook },
  { to: '/problem', name: 'Problem', icon: IconBrain },
  { to: '/pool', name: 'Problem Pool', icon: IconBox }
]

const items = computed(() =>
  props.group
    ? [
        { to: '/', name: 'SKKUDING', icon: IconBiHouse },
        ...commonItems,
        { to: '/member', name: 'Member', icon: IconUser },
        { to: '/submission', name: 'Submission', icon: IconCode }
      ]
    : commonItems
)
</script>

<template>
  <div class="bg-gray-light text-gray-dark h-screen w-48 overflow-auto">
    <router-link to="/" class="align-center flex justify-center">
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
