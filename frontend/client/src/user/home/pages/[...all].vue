<script setup lang="ts">
import img from './404.webp'
</script>

<template>
  <main class="flex flex-col items-center py-20">
    <h1 class="mb-8 text-8xl font-bold">Oops!</h1>
    <p class="my-2 text-3xl font-bold">404 Page Not Found</p>
    <p class="my-2 text-lg font-medium">
      This is not the page you're looking for.
    </p>
    <img :src="img" alt="404" class="mt-8" width="400" />
  </main>
</template>
