<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useProblemStore } from '../store/problem'
import type { Language } from '../types'
import Button from '@/common/components/Atom/Button.vue'
import Dropdown from '@/common/components/Molecule/Dropdown.vue'
import ListItem from '@/common/components/Atom/ListItem.vue'
import IconDown from '~icons/fa6-solid/angle-down'
import Fa6SolidCaretDown from '~icons/fa6-solid/caret-down'
import IconRefresh from '~icons/fa6-solid/arrow-rotate-right'
import IconRun from '~icons/bi/play'

const languages: Array<{ label: string; value: Language }> = [
  { label: 'C++', value: 'cpp' },
  { label: 'Python', value: 'python' },
  { label: 'Javascript', value: 'javascript' },
  { label: 'Java', value: 'java' }
]

const store = useProblemStore()

const navigations = [
  { label: 'Editor', to: { name: 'problem-id' } },
  { label: 'Standings', to: { name: 'problem-id-standings' } },
  { label: 'Submissions', to: { name: 'problem-id-submissions' } }
]

const route = useRoute()

const activeClass = (name: string) =>
  route.name === name
    ? 'border-white cursor-default'
    : 'border-transparent active:bg-white/40 cursor-pointer' // use transparent border for color transition effect
</script>

<template>
  <nav
    class="flex h-14 w-full items-center justify-between gap-x-20 bg-slate-700 px-6"
  >
    <div class="flex h-full shrink-0 items-center justify-start gap-x-4">
      <Dropdown class="mr-3">
        <template #button>
          <div
            class="flex h-9 w-fit select-none items-center gap-x-2 rounded px-2 text-white transition hover:bg-white/20 active:bg-white/40"
          >
            <Fa6SolidCaretDown class="h-4 w-4" />
            <span>가파른 경사</span>
          </div>
        </template>
        <template #items>
          <ListItem>습격자 초라기</ListItem>
          <ListItem>채권관계</ListItem>
        </template>
      </Dropdown>
      <RouterLink
        v-for="{ label, to } in navigations"
        :key="label"
        :to="to"
        class="hidden h-full select-none items-center border-t-2 px-3 text-lg font-semibold text-white transition hover:bg-white/20 min-[530px]:flex"
        :class="activeClass(to.name)"
      >
        {{ label }}
      </RouterLink>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="$route.name === 'problem-id'"
        class="hidden justify-end gap-x-4 min-[950px]:flex"
      >
        <Button color="gray-dark" class="h-9">
          <IconRefresh />
        </Button>
        <Button color="green" class="h-9">
          <div class="item-center flex">
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
              class="flex h-9 w-fit items-center gap-x-2 rounded-md bg-slate-500 px-3 text-white hover:bg-slate-500/80 active:bg-slate-500/60"
            >
              <span class="font-semibold">
                {{ languages.find((x) => x.value === store.language)?.label }}
              </span>
              <IconDown class="h-4 w-4" />
            </div>
          </template>
          <template #items>
            <ListItem
              v-for="{ label, value } in languages"
              :key="value"
              color="slate"
              @click="store.language = value"
            >
              {{ label }}
            </ListItem>
          </template>
        </Dropdown>
      </div>
    </Transition>
  </nav>
</template>
