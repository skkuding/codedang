<script setup lang="ts">
import Logo from '@/common/assets/codedang.svg'
import { useToast } from '@/common/composables/toast'
import { useAuthStore } from '@/common/store/auth'
import { useUserQuery } from '@/common/store/user'
import { OnClickOutside } from '@vueuse/components'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
const router = useRouter()
const isMenuOpen = ref(false)
const openToast = useToast()
const modalContent = ref<'login' | 'signup' | 'password' | 'close'>('close')
const useUser = useUserQuery()
// hide: remove hide, handleLinkClick
const hide = () => {
  openToast({
    message: 'This feature is under development',
    type: 'info'
  })
}
const handleLinkClick = (name: string) => {
  if (name === 'contest' || name === 'group') {
    hide()
  }
}
</script>

<template>
  <OnClickOutside @trigger="isMenuOpen = false">
    <header
      class="border-b-gray grid h-16 place-items-center border-b bg-white px-5"
    >
      <div class="flex w-full max-w-7xl items-center justify-between gap-5">
        <div class="flex w-1/2 min-w-fit items-center justify-between gap-8">
          <RouterLink to="/">
            <img :src="Logo" alt="logo" width="90" />
          </RouterLink>
          <nav class="hidden gap-8 capitalize md:flex">
            <RouterLink
              v-for="{ to, name } in [
                { to: '/notice', name: 'notice' },
                { to: '/problem', name: 'problem' },
                { to: '/', name: 'contest' },
                { to: '/', name: 'group' }
                //hide: replace / with /contest, /group each
              ]"
              :key="name"
              class="cursor-pointer text-lg hover:opacity-60 active:opacity-40"
              :class="{
                'text-green':
                  router.currentRoute.value.fullPath.startsWith(to) &&
                  to !== '/'
                //hide: remove the above line
              }"
              :to="to"
              @click="handleLinkClick(name)"
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
          <div v-if="auth.isLoggedIn" class="flex flex-row place-items-center">
            <div class="mr-3">{{ useUser.data.value?.username }}</div>
            <Dropdown class="hidden md:inline-block">
              <template #button>
                <!-- add left margin to center navigation -->
                <div
                  class="flex h-10 w-10 items-end justify-center overflow-hidden rounded-full bg-slate-50"
                >
                  <IconUser class="text-2xl text-slate-300" />
                </div>
              </template>
              <template #items>
                <ListItem @click="$router.push('/admin')">Management</ListItem>
                <ListItem @click="hide()">Settings</ListItem>
                <!-- hide: replace hide to setting page routing -->
                <ListItem @click="auth.logout()">Logout</ListItem>
              </template>
            </Dropdown>
          </div>

          <div v-else class="ml-2 hidden items-center gap-2 md:flex">
            <Button
              color="white"
              class="whitespace-nowrap hover:opacity-80"
              @click="modalContent = 'login'"
            >
              Sign in
            </Button>
            <!-- TODO: 추후에 NewButton component 새로 만들면 바꾸기 -->
            <button
              class="whitespace-nowrap rounded-md border border-slate-100 bg-transparent px-2 py-1 font-bold text-black hover:bg-slate-100 hover:bg-opacity-20"
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
