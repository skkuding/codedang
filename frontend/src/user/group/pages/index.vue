<script setup lang="ts">
import InputItem from '@/common/components/Atom/InputItem.vue'
import Button from '@/common/components/Atom/Button.vue'
import GroupListSection from '../components/GroupListSection.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'

import { ref } from 'vue'

//TODO: invitation 검색 API 연결 후 noInvitation 값을 변경하는 function 구현 필요
const noInvitationCode = ref(false)
const joinModalVisible = ref(false)
const invitationCode = ref('')
</script>

<template>
  <div class="mt-10 flex flex-col gap-4">
    <Button class="self-end" @click="joinModalVisible = true">
      Join Group
    </Button>
    <GroupListSection title="My Group" :is-my-group="true" />
    <GroupListSection title="All Group" pagination :is-my-group="false" />
    <Modal v-model="joinModalVisible" class="shadow-md">
      <div class="flex flex-col items-center gap-2 py-12 px-8">
        <h1 class="mb-1 text-center text-lg font-bold">
          Join Group by Invitation Code
        </h1>
        <p class="text-center">
          If you have invitation code, enter the code here.
        </p>
        <div class="flex items-start gap-2">
          <InputItem v-model="invitationCode" placeholder="Invitation Code" />
          <Button class="py-2"><IconPaperPlane /></Button>
        </div>

        <p v-if="noInvitationCode" class="text-red text-center">
          Group not found! Please check your code again
        </p>
      </div>
    </Modal>
  </div>
</template>
