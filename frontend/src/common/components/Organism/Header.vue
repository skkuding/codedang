<script setup lang="ts">
import Dropdown from '../Molecule/Dropdown.vue'
import SignatureLogo from '../Atom/SignatureLogo.vue'
import Fa6RegularUser from '~icons/fa6-regular/user'
const content = ['Management', 'Settings', 'Logout']
</script>
<template>
  <header
    class="border-b-gray sticky top-0 z-50 flex h-14 w-full min-w-[540px] content-center items-center justify-between border-b bg-white px-12 py-4 font-medium opacity-95"
  >
    <router-link to="/">
      <SignatureLogo class="hidden h-12 md:block" />
    </router-link>
    <nav>
      <router-link
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:cursor-pointer hover:no-underline"
        active-class="text-green"
        to="/announcement"
      >
        Notice
      </router-link>
      <router-link
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:cursor-pointer hover:no-underline"
        active-class="text-green"
        to="/contest"
      >
        Contest
      </router-link>
      <router-link
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:cursor-pointer hover:no-underline"
        active-class="text-green"
        to="/problem"
      >
        Problem
      </router-link>
      <router-link
        class="text-text-title hover:text-green mr-8 text-2xl font-medium hover:cursor-pointer hover:no-underline"
        active-class="text-green"
        to="/group"
      >
        Group
      </router-link>
    </nav>
    <Dropdown :content="content">
      <template #dropdown-icon>
        <Fa6RegularUser class="text-text-title hover:text-green" />
      </template>
    </Dropdown>
  </header>
</template>
