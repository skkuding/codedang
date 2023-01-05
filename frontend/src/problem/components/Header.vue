<script setup lang="ts">
import Dropdown from '@/common/components/Molecule/Dropdown.vue'
import { OnClickOutside } from '@vueuse/components'
import SymbolLogo from '@/common/components/Atom/SymbolLogo.vue'
import IconUser from '~icons/fa6-regular/user'
import { computed, ref } from 'vue'
import ListItem from '@/common/components/Atom/ListItem.vue'
import AuthModal from '@/common/components/Organism/AuthModal.vue'
import Button from '@/common/components/Atom/Button.vue'
import Fa6SolidAngleRight from '~icons/fa6-solid/angle-right'
const props = defineProps<{
  click?: boolean
}>()
const isMenuOpen = ref(false)
const auth = ref(true)
const modalContent = ref<'login' | 'signup' | 'password' | 'close'>('close')
// const clickColor = computed(() =>
//   props.click ? 'text-white' : 'text-text-title'
// )
</script>

<template>
  <OnClickOutside @trigger="isMenuOpen = false">
    <header
      class="border-b-gray bg-text-subtitle grid h-14 place-items-center border-b px-8"
    >
      <div class="flex h-14 w-full max-w-7xl items-center justify-between">
        <div class="flex h-14 items-center">
          <SymbolLogo class="mr-4 h-10 w-10 fill-white" />
          <p>
            <a class="text-text-title hidden text-sm md:inline" href="/notice">
              Contents
            </a>
          </p>
          <Fa6SolidAngleRight class="hidden text-white md:inline" />
          <p>
            <a class="text-text-title hidden text-sm md:inline" href="/notice">
              SKKU 코딩 플랫폼 대회
            </a>
          </p>
          <Fa6SolidAngleRight class="hidden text-white md:inline" />
          <p>
            <a class="text-sm text-white md:inline" href="/notice">
              가파른 경사
            </a>
          </p>
        </div>
        <!-- TODO: md 이하일때 유저 아이콘 안 없어짐 -->
        <div v-if="auth" class="md:inline-block">
          <Dropdown class="bg-slate-500 text-white">
            <template #button>
              <IconUser class="ml-[8.5rem] text-xl text-white" />
            </template>
            <template #items>
              <ListItem>Management</ListItem>
              <ListItem>My Page</ListItem>
              <ListItem @click="auth = false">Log Out</ListItem>
            </template>
          </Dropdown>
        </div>
        <div v-else class="inline-flex gap-2">
          <Button color="white" class="w-20" @click="modalContent = 'signup'">
            Sign Up
          </Button>
          <Button color="white" class="w-16" @click="modalContent = 'login'">
            Log In
          </Button>
        </div>
      </div>
    </header>
  </OnClickOutside>
  <AuthModal v-model="modalContent" />
</template>
