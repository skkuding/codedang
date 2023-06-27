<script setup lang="ts">
import { useDialog } from '@/common/composables/dialog'
import { logEvent } from 'histoire/client'
import Button from '../Atom/Button.vue'
import Dialog from './Dialog.vue'

const dialog = useDialog()
</script>

<template>
  <Story>
    <Dialog @yes="logEvent('yes', $event)" @no="logEvent('no', $event)" />
    <Button
      @click="
        dialog.success({
          title: 'Hi, there',
          content: 'Nice to meet ya! 만나서 반가워요!'
        })
      "
    >
      Success
    </Button>
    <Button
      color="gray-dark"
      @click="
        dialog.confirm({
          title: 'Continue?',
          content: '정말로 스꾸딩 활동을 그만두실건가요? 진짜요?',
          yes: 'Sure',
          no: 'Not really'
        })
      "
    >
      Confirm
    </Button>
    <Button
      color="red"
      @click="
        dialog.error({
          title: '이런! Oh no!',
          content:
            'Something went wrong. 무언가 잘못되었어요. 중얼중얼 아무말 두 줄을 채워야되는데 뭘 쓸지 모르겠어서 쓰는 말.',
          yes: 'What?'
        })
      "
    >
      Error
    </Button>
  </Story>
</template>
