<script setup lang="ts">
import CarbonLogoGithub from '~icons/carbon/logo-github'
import FaSolidEnvelope from '~icons/fa-solid/envelope'
import RiKakaoTalkFill from '~icons/ri/kakao-talk-fill'
import PhLinkThin from '~icons/ph/link-thin'
import { copyText } from 'vue3-clipboard'

const copyEmail = () => {
  copyText('email', undefined, (error, event) => {
    if (error) {
      // TODO: use custom alert
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
      <div class="flex flex-row space-x-1">
        <a href="https://github.com/skkuding/skku-coding-platform">
          <CarbonLogoGithub />
        </a>
        <a @click="copyEmail">
          <FaSolidEnvelope />
        </a>
        <a href="http://pf.kakao.com/_UKraK/chat">
          <RiKakaoTalkFill />
        </a>
        <a href="https://npc.skku.edu"><PhLinkThin /></a>
      </div>
    </div>
    <div class="m-1 flex flex-row justify-center">
      <span>© 2020-2022 SKKUDING</span>
    </div>
  </footer>
</template>
