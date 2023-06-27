<script setup lang="ts">
import Button from './Button.vue'
import Popover from './Popover.vue'
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="hover">
      <Popover
        text="this is popover : hover"
        content-id="#pop"
        hover
        class="my-12"
      >
        <template #content>
          <Button id="pop">Button</Button>
        </template>
      </Popover>
    </Variant>
    <Variant title="click">
      <Popover
        text="this is popover : click"
        content-id="#pop-click"
        class="my-12"
      >
        <template #content>
          <Button id="pop-click">Button</Button>
        </template>
      </Popover>
    </Variant>
  </Story>
</template>
