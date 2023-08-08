<script setup lang="ts">
import { useToast } from '@/common/composables/toast'
import { useClipboard } from '@vueuse/core'
import Fa6BrandsGithub from '~icons/fa6-brands/github'
import Fa6SolidB from '~icons/fa6-solid/b'
import Fa6SolidEnvelope from '~icons/fa6-solid/envelope'
import RiKakaoTalkFill from '~icons/ri/kakao-talk-fill'

const { copy } = useClipboard()
const openToast = useToast()

const copyEmail = () => {
  copy('skkucodingplatform@gmail.com')
  openToast({ message: 'Email copied!', type: 'success' })
}

const buttonClass =
  'flex items-center justify-center rounded-full bg-slate-50 bg-opacity-60 p-3 text-sm hover:opacity-80'
</script>

<template>
  <footer class="flex shrink-0 justify-center">
    <div
      class="text-text-title flex w-full max-w-7xl flex-col items-center gap-5 px-5 py-10"
    >
      <div class="grid grid-cols-4 gap-3">
        <a
          href="https://pf.kakao.com/_UKraK/chat"
          class="inline-block rounded-full bg-slate-50 bg-opacity-60 p-3 text-lg hover:opacity-80"
          target="_blank"
        >
          <RiKakaoTalkFill />
        </a>
        <button :class="buttonClass" target="_blank" @click="copyEmail">
          <Fa6SolidEnvelope />
        </button>
        <a
          href="https://github.com/skkuding/codedang"
          :class="buttonClass"
          target="_blank"
        >
          <Fa6BrandsGithub />
        </a>
        <a href="https://skkuding.dev/" :class="buttonClass" target="_blank">
          <Fa6SolidB />
        </a>
      </div>
      <p class="text-sm font-bold text-slate-200">ⓒ SKKUDING / 2021 - 2023</p>
    </div>
  </footer>
</template>
