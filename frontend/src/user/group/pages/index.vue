<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import { ref } from 'vue'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import GroupListSection from '../components/GroupListSection.vue'

//TODO: invitation 검색 API 연결 후 noInvitation 값을 변경하는 function 구현 필요
const invitationCode = ref('')
const createModal = ref(false)
const groupName = ref('')
const groupConfig = ref({
  showOnList: false,
  allowJoinFromSearch: true,
  allowJoinWithURL: false,
  requireApprovalBeforeJoin: true
})
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
    <div class="flex flex-col px-8 pb-12">
      <h1 class="text-gray-dark mb-2 text-2xl font-bold">Create Group</h1>
      <div class="bg-gray-light mb-6 h-[1px] w-full"></div>
      <div class="mb-6 flex">
        <h2 class="mr-10 text-lg font-semibold">Group Name</h2>
        <InputItem v-model="groupName" class="shadow" />
      </div>
      <div class="mb-6">
        <h2 class="mb-2 mr-10 text-lg font-semibold">Group Configuration</h2>
        <div class="mb-2 flex">
          Show on list
          <Switch
            v-model="groupConfig.showOnList"
            class="ml-auto mr-0"
            :class="[groupConfig.showOnList ? '' : 'text-green']"
          />
        </div>
        <div class="mb-2 flex">
          Allow join from search
          <Switch
            v-model="groupConfig.allowJoinFromSearch"
            class="ml-auto mr-0"
            :class="[groupConfig.allowJoinFromSearch ? '' : 'text-green']"
          />
        </div>
        <div class="mb-2 flex">
          Allow join with url
          <Switch
            v-model="groupConfig.allowJoinWithURL"
            class="ml-auto mr-0"
            :class="[groupConfig.allowJoinWithURL ? '' : 'text-green']"
          />
        </div>
        <div class="flex">
          Require approval before join
          <Switch
            v-model="groupConfig.requireApprovalBeforeJoin"
            class="ml-auto mr-0"
            :class="[groupConfig.requireApprovalBeforeJoin ? '' : 'text-green']"
          />
        </div>
      </div>

      <h2 class="mb-2 text-lg font-semibold">Description</h2>
      <InputItem
        v-model="groupDescription"
        class="w-full break-normal shadow"
      />
    </div>
    <div class="flex justify-end">
      <Button class="mr-8 px-4 py-2">Save</Button>
    </div>
  </Modal>
</template>
