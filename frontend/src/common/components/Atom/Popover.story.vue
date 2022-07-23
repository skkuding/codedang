<script setup lang="ts">
import Popover from './Popover.vue'
import Button from './Button.vue'
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
          <div id="pop"></div>
          <Button>Button</Button>
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
          <div id="pop-click"></div>
          <Button>Button</Button>
        </template>
      </Popover>
    </Variant>
  </Story>
</template>
