<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import { useAuthStore } from '@/common/store/auth'
import { ref } from 'vue'
import GroupListSection from '../components/GroupListSection.vue'

//TODO: invitation 검색 API 연결 후 noInvitation 값을 변경하는 function 구현 필요
// const invitationCode = ref('')
const auth = useAuthStore()
const createModal = ref(false)
const group = ref({
  groupName: '',
  description: '',
  config: {
    showOnList: false,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  }
})
const configNameMap = {
  showOnList: 'Show On List',
  allowJoinFromSearch: 'Allow Join From Search',
  allowJoinWithURL: 'Allow Join With URL',
  requireApprovalBeforeJoin: 'Require Approval Before Join'
}
</script>

<template>
  <div class="mt-10 flex flex-col gap-4">
    <div class="flex items-start justify-end gap-2">
      <!-- <InputItem v-model="invitationCode" placeholder="Invitation Code" /> -->
      <!-- <Button class="py-2"><IconPaperPlane /></Button> -->
    </div>
    <GroupListSection v-if="auth.isLoggedIn" title="My Group" is-my-group />
    <div class="flex justify-end">
      <Button class="py-2" @click="createModal = true">+ Create Group</Button>
    </div>
    <GroupListSection title="All Group" :is-my-group="false" />
  </div>
  <Modal v-model="createModal" class="shadow-md">
    <div class="flex flex-col px-8 pb-12">
      <h1 class="text-gray-dark mb-2 text-2xl font-bold">Create Group</h1>
      <div class="bg-gray-light mb-6 h-[1px] w-full" />
      <div class="mb-6 flex">
        <h2 class="mr-10 text-lg font-semibold">Group Name</h2>
        <InputItem v-model="group.groupName" class="shadow" />
      </div>
      <div class="mb-6">
        <h2 class="mb-2 mr-10 text-lg font-semibold">Group Configuration</h2>
        <p
          v-for="(key, value, index) in configNameMap"
          :key="index"
          class="mt-1 flex"
        >
          {{ key }}
          <Switch v-model="group.config[value]" class="ml-auto mr-0" />
        </p>
      </div>

      <h2 class="mb-2 text-lg font-semibold">Description</h2>
      <InputItem
        v-model="group.description"
        class="w-full break-normal shadow"
      />
    </div>
    <div class="flex justify-end">
      <Button class="mr-8 px-4 py-2">Save</Button>
    </div>
  </Modal>
</template>
