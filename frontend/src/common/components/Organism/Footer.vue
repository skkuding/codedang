<script setup lang="ts">
import CarbonLogoGithub from '~icons/carbon/logo-github'
import CarbonEmail from '~icons/carbon/email'
import SimpleIconsKakaotalk from '~icons/simple-icons/kakaotalk'
import PhLinkThin from '~icons/ph/link-thin'
import { ref } from 'vue'
const email = ref('example@skku.edu')
function copy() {
  console.log('Email is copied')
}
</script>

<template>
  <footer
    class="footer bg-gray-light fixed inset-x-0 bottom-0 flex flex-col justify-center align-middle"
  >
    <div class="footer-info flex flex-row justify-center">
      <a href="https://github.com/skkuding/skku-coding-platform" class="m-1">
        <CarbonLogoGithub />
      </a>
      <a v-clipboard:copy="email" class="m-1" @click="copy">
        <CarbonEmail />
      </a>
      <a href="http://pf.kakao.com/_UKraK/chat" class="m-1">
        <SimpleIconsKakaotalk />
      </a>
      <a href="https://npc.skku.edu" class="m-1"><PhLinkThin /></a>
    </div>
    <div class="footer-bottom m-1 flex flex-row justify-center">
      <span>© 2011-2021 SKKU NPC Club</span>
    </div>
  </footer>
</template>
<!-- <style scoped>

</style> -->
