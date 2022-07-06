<script setup lang="ts">
import CarbonLogoGithub from '~icons/carbon/logo-github'
import CarbonEmail from '~icons/carbon/email'
import SimpleIconsKakaotalk from '~icons/simple-icons/kakaotalk'
import PhLinkThin from '~icons/ph/link-thin'
import { ref } from 'vue'
import { copyText } from 'vue3-clipboard'

const email = 'skkuding@gmail.com'

const copyEmail = () => {
  copyText('email', undefined, (error, event) => {
    if (error) {
      alert('Can not copy')
      console.log(error)
    } else {
      alert('Copied')
      console.log(event)
    }
  })
}
</script>

<template>
  <footer
    class="bg-gray-light fixed inset-x-0 bottom-0 flex flex-col justify-center align-middle"
  >
    <div class="flex flex-row justify-center">
      <a href="https://github.com/skkuding/skku-coding-platform" class="m-1">
        <CarbonLogoGithub />
      </a>
      <a @click="copyEmail" class="m-1">
        <CarbonEmail />
      </a>
      <a href="http://pf.kakao.com/_UKraK/chat" class="m-1">
        <SimpleIconsKakaotalk />
      </a>
      <a href="https://npc.skku.edu" class="m-1"><PhLinkThin /></a>
    </div>
    <div class="m-1 flex flex-row justify-center">
      <span>© 2011-2022 SKKUDING</span>
    </div>
  </footer>
</template>
