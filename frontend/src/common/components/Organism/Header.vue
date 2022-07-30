<script setup lang="ts">
import Dropdown from '../Molecule/Dropdown.vue'
import ListItem from '../Atom/ListItem.vue'
import SignatureLogo from '../Atom/SignatureLogo.vue'
import IconUser from '~icons/fa6-regular/user'
</script>

<template>
  <header class="border-b-gray grid h-14 place-items-center border-b px-8">
    <div class="flex w-full max-w-7xl items-center justify-between">
      <router-link to="/">
        <SignatureLogo
          class="hidden w-40 hover:opacity-60 active:opacity-40 md:block"
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
      <!-- TODO: sign in & sign up button -->
      <Dropdown>
        <template #button>
          <!-- add left margin to center navigation -->
          <IconUser
            class="text-text-title ml-[8.75rem] text-xl hover:opacity-60 active:opacity-40"
          />
        </template>
        <template #items>
          <ListItem>Management</ListItem>
          <ListItem>Settings</ListItem>
          <ListItem>Logout</ListItem>
        </template>
      </Dropdown>
    </div>
  </header>
</template>
