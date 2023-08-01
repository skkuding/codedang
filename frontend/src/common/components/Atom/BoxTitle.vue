<template>
  <div
    class="bg-gradient-to-r from-[#1A3E51] via-[#112835] to-[#1A3E51] py-12 text-center"
  >
    <div class="text-3xl text-white">
      <slot name="title" />
    </div>
    <div class="mt-4 text-xl text-white">
      <slot name="subtitle" />
    </div>
  </div>
</template>
