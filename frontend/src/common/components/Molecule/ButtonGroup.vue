<template>
  <div class="btn-group">
    <slot />
  </div>
</template>

<style>
.btn-group > button:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.btn-group > button:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
