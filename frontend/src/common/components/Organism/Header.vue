<script setup lang="ts">
import { ref } from 'vue'
import Dropdown from '../Molecule/Dropdown.vue'
import ListItem from '../Atom/ListItem.vue'
import SignatureLogo from '../Atom/SignatureLogo.vue'
import IconUser from '~icons/fa6-regular/user'
import Button from '../Atom/Button.vue'

// TODO: define composable
const auth = ref(false)
</script>

<template>
  <header class="border-b-gray grid h-14 place-items-center border-b px-8">
    <div class="flex w-full max-w-7xl items-center justify-between">
      <router-link to="/">
        <SignatureLogo
          class="hidden w-40 cursor-pointer hover:opacity-60 active:opacity-40 md:block"
        />
      </router-link>
      <nav class="text-text-title flex gap-4">
        <router-link
          v-for="{ to, name } in [
            { to: '/notice', name: 'Notice' },
            { to: '/contest', name: 'Contest' },
            { to: '/problem', name: 'Problem' },
            { to: '/group', name: 'Group' }
          ]"
          :key="name"
          class="cursor-pointer text-lg font-semibold hover:opacity-60 active:opacity-40"
          active-class="text-green hover:opacity-70 active:opacity-50"
          :to="to"
        >
          {{ name }}
        </router-link>
      </nav>
      <transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <Dropdown v-if="auth">
          <template #button>
            <!-- add left margin to center navigation -->
            <IconUser
              class="text-text-title ml-[8.5rem] text-xl hover:opacity-60 active:opacity-40"
            />
          </template>
          <template #items>
            <ListItem>Management</ListItem>
            <ListItem>Settings</ListItem>
            <ListItem @click="auth = false">Logout</ListItem>
            <!-- TODO: log out functionality -->
          </template>
        </Dropdown>
        <div v-else class="ml-2 flex gap-2">
          <Button color="gray-dark" class="w-20">Sign Up</Button>
          <Button color="gray-dark" class="w-16" @click="auth = true">
            Log In
          </Button>
          <!-- TODO: show log in page -->
        </div>
      </transition>
    </div>
  </header>
</template>
