<script setup lang="ts">
import BiHouse from '~icons/bi/house'
import File from '~icons/bi/file-text'
import Trophy from '~icons/bi/trophy'
import User from '~icons/fa6-regular/user'
import Brain from '~icons/fluent/brain-circuit-24-regular'
import Box from '~icons/bi/box'
import Code from '~icons/bi/code-square'
import Book from '~icons/bi/journals'
import { computed } from 'vue'

const props = defineProps<{
  color?: string
}>()

const sidebarColor = computed(() => {
  if (props.color === 'blue') {
    return 'border-l-blue border-l-8'
  } else if (props.color === 'gray') {
    return 'border-l-gray border-l-8'
  } else if (props.color === 'gray-dark') {
    return 'border-l-gray-dark border-l-8'
  } else if (props.color === 'white') {
    return 'border-l-white border-l-8'
  } else {
    return 'border-l-green border-l-8'
  }
})
</script>

<template>
  <div
    class="bg-gray-light fixed top-0 bottom-0 left-0 h-full w-[200px] overflow-auto"
  >
    <div class="align-center flex justify-center">
      <img src="@/../codingPlatformLogo.png" class="m-6 h-[77px] w-[155px]" />
    </div>
    <div class="text-gray-dark">
      <hr class="bg-gray h-0.5 border-none opacity-25" />
      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/"
      >
        <BiHouse class="mr-2" />
        SKKUDING
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/notice"
      >
        <File class="mr-2" />
        Notice
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/contest"
      >
        <Trophy class="mr-2" />
        Contest
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/workbook"
      >
        <Book class="mr-2" />
        Workbook
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/problem"
      >
        <Brain class="mr-2" />
        Problem
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/"
      >
        <Box class="mr-2" />
        Problem Pool
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/"
      >
        <User class="mr-2" />
        Member
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />

      <router-link
        class="flex p-2 pl-10 font-bold"
        :active-class="sidebarColor"
        to="/"
      >
        <Code class="mr-2" />
        Submission
      </router-link>
      <hr class="bg-gray h-0.5 border-none opacity-25" />
    </div>
  </div>
</template>
