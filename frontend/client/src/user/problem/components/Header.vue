<script setup lang="ts">
import Dropdown from '@/client/src/common/components/Molecule/Dropdown.vue'
import SymbolLogo from '@/client/src/common/components/Atom/SymbolLogo.vue'
import IconUser from '~icons/fa6-regular/user'
import { ref } from 'vue'
import ListItem from '@/client/src/common/components/Atom/ListItem.vue'
import AuthModal from '@/client/src/common/components/Organism/AuthModal.vue'
import Button from '@/client/src/common/components/Atom/Button.vue'
import Fa6SolidAngleRight from '~icons/fa6-solid/angle-right'

const auth = ref(true)
const modalContent = ref<'login' | 'signup' | 'password' | 'close'>('close')
</script>

<template>
  <header class="grid h-14 place-items-center bg-slate-900 px-6">
    <div class="flex h-14 w-full items-center justify-between">
      <div class="flex h-14 items-center">
        <RouterLink class="mr-4" to="/">
          <SymbolLogo
            class="h-10 fill-white transition-opacity hover:opacity-80 active:opacity-60"
          />
        </RouterLink>
        <RouterLink
          class="hidden text-lg font-bold text-white/60 transition-colors hover:text-white active:text-white/80 md:inline"
          to="/contest"
        >
          Contents
        </RouterLink>
        <Fa6SolidAngleRight class="mx-2 hidden text-white/60 md:inline" />
        <RouterLink
          class="hidden text-lg font-bold text-white/60 transition-colors hover:text-white active:text-white/80 md:inline"
          to="/contest/1"
        >
          SKKU 코딩 플랫폼 대회
        </RouterLink>
        <Fa6SolidAngleRight class="mx-2 hidden text-white/60 md:inline" />
        <span class="text-lg font-semibold text-white">가파른 경사</span>
      </div>
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <div v-if="auth">
          <Dropdown>
            <template #button>
              <IconUser class="text-xl text-white" />
            </template>
            <template #items>
              <!-- TODO: change text color after PR #316 -->
              <ListItem>Management</ListItem>
              <ListItem>My Page</ListItem>
              <ListItem @click="auth = false">Log Out</ListItem>
            </template>
          </Dropdown>
        </div>
        <div v-else class="inline-flex gap-2">
          <Button color="white" outline @click="modalContent = 'signup'">
            Sign Up
          </Button>
          <Button color="white" outline @click="modalContent = 'login'">
            Log In
          </Button>
        </div>
      </Transition>
    </div>
    <AuthModal v-model="modalContent" />
  </header>
</template>
