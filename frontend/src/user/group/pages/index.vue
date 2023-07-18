<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import { NUpload, NButton, NColorPicker } from 'naive-ui'
import { ref } from 'vue'
import IconLock from '~icons/bi/lock'
import IconUnlock from '~icons/bi/unlock'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import GroupListSection from '../components/GroupListSection.vue'

//TODO: invitation 검색 API 연결 후 noInvitation 값을 변경하는 function 구현 필요
const invitationCode = ref('')
const createModal = ref(false)
const groupName = ref('')
const groupPrivate = ref(false)
const groupDescription = ref('')
</script>

<template>
  <div class="mt-10 flex flex-col gap-4">
    <div class="flex items-start justify-end gap-2">
      <InputItem v-model="invitationCode" placeholder="Invitation Code" />
      <Button class="py-2"><IconPaperPlane /></Button>
    </div>
    <GroupListSection title="My Group" :is-my-group="true" />
    <div class="flex justify-end">
      <Button class="py-2" @click="createModal = true">+ Create Group</Button>
    </div>
    <GroupListSection title="All Group" pagination :is-my-group="false" />
  </div>
  <Modal v-model="createModal" class="shadow-md">
    <div class="flex flex-col px-8 py-12">
      <h1 class="text-gray-dark mb-2 text-2xl font-bold">Create Group</h1>
      <div class="bg-gray-light mb-6 h-[1px] w-full"></div>
      <div class="mb-6">
        <div class="mb-2 flex">
          <h2 class="mr-60 text-lg font-semibold">Group Name</h2>
          <h2 class="text-lg font-semibold">Public / Private</h2>
        </div>
        <div class="flex items-center">
          <InputItem v-model="groupName" class="mr-36 shadow" />
          <div class="flex" :class="[groupPrivate ? '' : 'text-green']">
            <IconUnlock class="h-5 w-5" />
            <span>Public</span>
          </div>
          <Switch v-model="groupPrivate" class="mx-2" />
          <div class="flex" :class="[groupPrivate ? 'text-green' : '']">
            <IconLock class="h-5 w-5" />
            <span>Private</span>
          </div>
        </div>
      </div>
      <div class="mb-6">
        <h2 class="mb-2 text-lg font-semibold">
          Description ({{ groupDescription.length }}/50)
        </h2>
        <InputItem v-model="groupDescription" class="w-full shadow" />
      </div>
      <div>
        <div class="flex">
          <h2 class="mr-60 text-lg font-semibold">Group Image</h2>
          <h2 class="text-lg font-semibold">Group Color</h2>
        </div>
        <div class="flex">
          <NUpload
            action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
            :headers="{
              'naive-info': 'hello!'
            }"
            :data="{
              'naive-data': 'cool! naive!'
            }"
          >
            <NButton>Upload File</NButton>
          </NUpload>
          <NColorPicker />
        </div>
      </div>
    </div>
    <div class="flex justify-end">
      <Button class="px-4 py-2">Save</Button>
    </div>
  </Modal>
</template>
