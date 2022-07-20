<script setup lang="ts">
import Dropdown from '../Molecule/Dropdown.vue'

const content = ['Management', 'Settings', 'Logout']
</script>
<template>
  <header
    class="sticky top-0 z-50 flex content-center items-center justify-between border-b border-b-[#cdcdcd] bg-white px-12 py-4 font-medium opacity-95"
  >
    <router-link to="/">
      <img src="../../assets/signature.png" class="h-12 w-auto" />
    </router-link>
    <nav>
      <router-link
        class="text-text-title hover:text-green active:text-green mr-4 text-2xl font-medium hover:no-underline"
        to="/announcement"
      >
        Notice
      </router-link>
      <router-link
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:no-underline"
        to="/contest"
      >
        Contest
      </router-link>
      <router-link
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:no-underline"
        to="/problem"
      >
        Problem
      </router-link>
      <router-link
        class="text-text-title hover:text-green mr-8 text-2xl font-medium hover:no-underline"
        to="/lecture"
      >
        Group
      </router-link>
    </nav>
    <div>
      <Dropdown :content="content">
        <template #dropdown-icon>click</template>
      </Dropdown>
    </div>
  </header>
</template>
