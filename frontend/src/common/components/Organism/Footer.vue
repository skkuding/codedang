<script setup lang="ts">
import IconGithub from '~icons/fa6-brands/github'
import IconEnvelope from '~icons/fa6-solid/envelope'
import IconKakaoTalk from '~icons/ri/kakao-talk-fill'
import IconLink from '~icons/fa6-solid/link'
import { useClipboard } from '@vueuse/core'

const { copy } = useClipboard()

const copyEmail = () => {
  copy('skkucodingplatform@gmail.com')
  alert('Email copied!')
}
</script>

<template>
  <footer
    class="bg-gray-light fixed inset-x-0 bottom-0 flex flex-col justify-center align-middle"
  >
    <div class="flex flex-row justify-center">
      <div class="flex flex-row space-x-1">
        <a href="https://github.com/skkuding/skku-coding-platform">
          <IconGithub />
        </a>
        <a @click="copyEmail">
          <IconEnvelope />
        </a>
        <a href="http://pf.kakao.com/_UKraK/chat">
          <IconKakaoTalk />
        </a>
        <a href="https://npc.skku.edu"><IconLink /></a>
      </div>
    </div>
    <div class="m-1 flex flex-row justify-center">
      <span>© 2020-2022 SKKUDING</span>
    </div>
  </footer>
</template>
