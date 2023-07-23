<script setup lang="ts">
import Logo from '@/common/assets/codedang_logo.png'
import { useAuthStore } from '@/common/store/auth'
import { OnClickOutside } from '@vueuse/components'
import { ref } from 'vue'
import IconArrowRightFromBracket from '~icons/fa6-solid/arrow-right-from-bracket'
import IconBars from '~icons/fa6-solid/bars'
import IconSliders from '~icons/fa6-solid/sliders'
import IconUser from '~icons/fa6-solid/user'
import IconUserGear from '~icons/fa6-solid/user-gear'
import Button from '../Atom/Button.vue'
import ListItem from '../Atom/ListItem.vue'
import Dropdown from '../Molecule/Dropdown.vue'
import AuthModal from './AuthModal.vue'

const auth = useAuthStore()
const isMenuOpen = ref(false)
const modalContent = ref<'login' | 'signup' | 'password' | 'close'>('close')
</script>

<template>
  <OnClickOutside
    class="sticky top-0 z-[9999] bg-white"
    @trigger="isMenuOpen = false"
  >
    <header class="border-b-gray grid h-20 place-items-center border-b px-8">
      <div class="flex w-full max-w-7xl items-center justify-between gap-5">
        <div class="flex items-center gap-32">
          <RouterLink to="/">
            <div class="flex items-center gap-1">
              <img :src="Logo" alt="logo" width="45" />
              <h1 class="text-2xl font-bold">Codedang</h1>
            </div>
          </RouterLink>
          <nav class="hidden gap-10 capitalize md:flex">
            <RouterLink
              v-for="{ to, name } in [
                { to: '/notice', name: 'notice' },
                { to: '/contest', name: 'contest' },
                { to: '/problem', name: 'problem' },
                { to: '/group', name: 'group' }
              ]"
              :key="name"
              active-class="text-green"
              class="cursor-pointer text-lg hover:opacity-60 active:opacity-40"
              :to="to"
            >
              {{ name }}
            </RouterLink>
          </nav>
        </div>

        <transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <Dropdown v-if="auth.isLoggedIn" class="hidden md:inline-block">
            <template #button>
              <!-- add left margin to center navigation -->
              <div
                class="flex h-10 w-10 items-end justify-center overflow-hidden rounded-full bg-slate-50"
              >
                <IconUser class="text-2xl text-slate-300" />
              </div>
            </template>
            <template #items>
              <ListItem>Management</ListItem>
              <ListItem>Settings</ListItem>
              <ListItem @click="auth.logout()">Logout</ListItem>
            </template>
          </Dropdown>
          <div v-else class="ml-2 hidden items-center gap-2 md:flex">
            <Button
              color="white"
              class="whitespace-nowrap"
              @click="modalContent = 'login'"
            >
              Sign in
            </Button>
            <button
              class="whitespace-nowrap rounded-md border border-slate-100 bg-transparent px-3 py-2 font-bold text-black hover:bg-slate-100 hover:bg-opacity-20"
              @click="modalContent = 'signup'"
            >
              Sign up
            </button>
          </div>
        </transition>
        <IconBars
          class="text-text-title cursor-pointer text-xl active:opacity-60 md:hidden"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
      <transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-show="isMenuOpen"
          class="absolute inset-x-0 top-14 z-30 flex w-full flex-col items-center justify-center gap-6 overflow-hidden bg-white/75 py-8 shadow-lg backdrop-blur md:hidden"
        >
          <nav class="text-text-title flex flex-col items-center gap-2">
            <RouterLink
              v-for="{ to, name } in [
                { to: '/notice', name: 'Notice' },
                { to: '/contest', name: 'Contest' },
                { to: '/problem', name: 'Problem' },
                { to: '/group', name: 'Group' }
              ]"
              :key="name"
              class="cursor-pointer font-semibold active:opacity-60"
              active-class="text-green active:opacity-70"
              :to="to"
            >
              {{ name }}
            </RouterLink>
          </nav>
          <transition
            enter-active-class="transition-opacity duration-300"
            leave-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <div
              v-if="auth.isLoggedIn"
              class="text-text-title flex gap-4 text-lg"
            >
              <IconUserGear class="active:opacity-60" />
              <IconSliders class="active:opacity-60" />
              <IconArrowRightFromBracket
                class="active:opacity-60"
                @click="auth.logout()"
              />
            </div>
            <div v-else class="flex gap-2">
              <Button
                color="gray-dark"
                class="text-sm"
                @click="modalContent = 'signup'"
              >
                Sign Up
              </Button>
              <Button
                color="gray-dark"
                class="text-sm"
                @click="modalContent = 'login'"
              >
                Log In
              </Button>
            </div>
          </transition>
        </div>
      </transition>
    </header>
  </OnClickOutside>
  <AuthModal v-model="modalContent" />
</template>
