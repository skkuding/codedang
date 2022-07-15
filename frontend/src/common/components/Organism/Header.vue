<script setup lang="ts">
import Dropdown from '../Molecule/Dropdown.vue'

interface data {
  content: string[]
  button: buttonStyle
}
interface buttonStyle {
  color: string
  rounded: boolean
  text: string
}
const props: data = {
  content: ['Management', 'Settings', 'Logout'],
  button: {
    color: 'green',
    rounded: true,
    text: 'this is button'
  }
}
</script>

<template>
  <nav
    class="header-container sticky top-0 z-50 flex content-center items-center justify-between border-b-[1px] border-b-[#cdcdcd] bg-white px-12 py-4 font-medium opacity-95"
  >
    <a href="/">
      <img src="../../assets/signature.png" class="h-12 w-auto" />
    </a>
    <div>
      <a
        class="text-text-title hover:text-green active:text-green mr-4 text-2xl font-medium hover:no-underline"
        href="/announcement"
      >
        Notice
      </a>
      <a
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:no-underline"
        href="/contest"
      >
        Contest
      </a>
      <a
        class="text-text-title hover:text-green mr-4 text-2xl font-medium hover:no-underline"
        href="/problem"
      >
        Problem
      </a>
      <a
        class="text-text-title hover:text-green mr-8 text-2xl font-medium hover:no-underline"
        href="/lecture"
      >
        Group
      </a>
    </div>
    <div>
      <Dropdown v-bind="props">
        <template #dropdown-icon></template>
        <template #dropdown-content></template>
      </Dropdown>
    </div>
  </nav>
</template>
