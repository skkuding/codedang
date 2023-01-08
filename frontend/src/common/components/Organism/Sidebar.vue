<script setup lang="ts">
import IconBiHouse from '~icons/bi/house'
import IconFile from '~icons/bi/file-text'
import IconTrophy from '~icons/bi/trophy'
import IconUser from '~icons/fa6-regular/user'
import IconBrain from '~icons/fluent/brain-circuit-24-regular'
import IconBox from '~icons/bi/box'
import IconCode from '~icons/bi/code-square'
import IconBook from '~icons/bi/journals'
import { shallowRef, watchEffect } from 'vue'
import CodingPlatformLogo from '../Atom/CodingPlatformLogo.vue'

type Group = {
  id: number
  name: string
  color: 'blue' | 'gray' | 'white'
}

// TODO: get group name and color
const props = defineProps<{
  group: Group
}>()

const colorMapper = {
  blue: 'border-l-blue',
  gray: 'border-l-gray',
  white: 'border-l-white',
  default: 'border-l-green'
}

const commonItems = [
  { to: { name: 'manager-notice' }, name: 'Notice', icon: IconFile },
  { to: { name: 'manager-contest' }, name: 'Contest', icon: IconTrophy },
  { to: { name: 'manager-workbook' }, name: 'Workbook', icon: IconBook },
  { to: { name: 'manager-problem' }, name: 'Problem', icon: IconBrain },
  { to: { name: 'manager-pool' }, name: 'Problem Pool', icon: IconBox }
]

const items = shallowRef()

watchEffect(
  () =>
    (items.value =
      props.group.id > 0
        ? [
            {
              to: {
                name: 'manager-groupId',
                params: { groupId: props.group.id }
              },
              name: props.group.name.toUpperCase(),
              icon: IconBiHouse
            },

            {
              to: {
                name: 'manager-groupId-notice',
                params: { groupId: props.group.id }
              },
              name: 'Notice',
              icon: IconFile
            },
            {
              to: {
                name: 'manager-groupId-contest',
                params: { groupId: props.group.id }
              },
              name: 'Contest',
              icon: IconTrophy
            },
            {
              to: {
                name: 'manager-groupId-workbook',
                params: { groupId: props.group.id }
              },
              name: 'Workbook',
              icon: IconBook
            },
            {
              to: {
                name: 'manager-groupId-problem',
                params: { groupId: props.group.id }
              },
              name: 'Problem',
              icon: IconBrain
            },
            {
              to: {
                name: 'manager-groupId-pool',
                params: { groupId: props.group.id }
              },
              name: 'Problem Pool',
              icon: IconBox
            },
            { to: 'member', name: 'Member', icon: IconUser },
            { to: 'submission', name: 'Submission', icon: IconCode }
          ]
        : commonItems)
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
        :active-class="
          colorMapper[group.color || 'default'] + ' border-l-8 !pl-8'
        "
        :to="to"
      >
        <component :is="icon" class="mr-2 h-4" />
        {{ name }}
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />
    </div>
  </div>
</template>
