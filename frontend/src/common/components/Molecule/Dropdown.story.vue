<script setup lang="ts">
import Dropdown from '../Molecule/Dropdown.vue'
import Fa6RegularUser from '~icons/fa6-regular/user'
const content = ['Management', 'Settings', 'Logout']
</script>
<template>
  <Story>
    <div class="text-center">
      <Dropdown :content="content">
        <template #dropdown-icon>
          <Fa6RegularUser class="text-text-title hover:text-green" />
        </template>
      </Dropdown>
    </div>
  </Story>
</template>
