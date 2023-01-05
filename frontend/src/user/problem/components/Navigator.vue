<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/common/components/Atom/Button.vue'
import Dropdown from '@/common/components/Molecule/Dropdown.vue'
import ListItem from '@/common/components/Atom/ListItem.vue'
import IconDown from '~icons/fa6-solid/angle-down'
import Fa6SolidCaretDown from '~icons/fa6-solid/caret-down'
import IconRefresh from '~icons/fa6-solid/arrow-rotate-right'
import IconRun from '~icons/bi/play'

const items = ['Editor', 'Standings', 'Submissions']

const activeItem = ref(items[0])

const activeStyle = (item: string) => {
  return item === activeItem.value ? `border-t-[3px] border-white pb-[3px]` : ''
}
</script>

<template>
  <nav class="flex h-14 w-full flex-row items-center bg-slate-700 px-6">
    <div class="flex h-full w-full items-center justify-start gap-x-4">
      <Dropdown class="pr-3">
        <template #button>
          <div class="flex h-9 w-fit flex-row items-center gap-x-2 text-white">
            <Fa6SolidCaretDown class="h-4 w-4" />
            <span>가파른 경사</span>
          </div>
        </template>
        <template #items>
          <ListItem>습격자 초라기</ListItem>
          <ListItem>채권관계</ListItem>
        </template>
      </Dropdown>
      <div
        v-for="item in items"
        :key="item"
        class="flex h-full cursor-pointer items-center px-3 text-lg text-white"
        :class="activeStyle(item)"
        @click="activeItem = item"
      >
        {{ item }}
      </div>
    </div>

    <div class="flex w-full justify-end gap-x-4">
      <Button color="gray-dark" class="h-9">
        <IconRefresh />
      </Button>
      <Button color="green" class="h-9">
        <div class="item-center flex flex-row">
          <IconRun class="h-6 w-6" />
          <span class="px-1">Run</span>
        </div>
      </Button>
      <Button color="blue" class="h-9">
        <span class="px-1">Submit</span>
      </Button>
      <Dropdown color="slate">
        <template #button>
          <div
            class="flex h-9 w-fit flex-row items-center gap-x-2 rounded-md bg-slate-500 px-3 text-white"
          >
            <span>C++</span>
            <IconDown class="h-4 w-4" />
          </div>
        </template>
        <template #items>
          <ListItem color="slate">C++</ListItem>
          <ListItem color="slate">Python3</ListItem>
          <ListItem color="slate">Java</ListItem>
        </template>
      </Dropdown>
    </div>
  </nav>
</template>
