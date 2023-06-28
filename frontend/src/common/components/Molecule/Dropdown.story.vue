<script setup lang="ts">
import Fa6RegularUser from '~icons/fa6-regular/user'
import IconDown from '~icons/fa6-solid/angle-down'
import ListItem from '../Atom/ListItem.vue'
import Dropdown from '../Molecule/Dropdown.vue'
</script>

<template>
  <Story>
    <Variant title="white">
      <Dropdown color="white">
        <template #button>
          <Fa6RegularUser
            class="text-text-title ml-32 text-xl hover:opacity-60 active:opacity-40"
          />
        </template>
        <template #items>
          <ListItem color="white">Management</ListItem>
          <ListItem color="white">Settings</ListItem>
          <ListItem color="white">Logout</ListItem>
        </template>
      </Dropdown>
    </Variant>
    <Variant title="slate">
      <Dropdown color="slate" class="m-5">
        <template #button>
          <div
            class="flex h-9 w-fit flex-row items-center gap-x-2 rounded-md bg-slate-500 px-3 text-white"
          >
            <span>C++</span>
            <IconDown class="h-4 w-4" />
          </div>
        </template>
        <template #items>
          <ListItem color="slate">C++</ListItem>
          <ListItem color="slate">Python3</ListItem>
          <ListItem color="slate">Java</ListItem>
        </template>
      </Dropdown>
    </Variant>
  </Story>
</template>
