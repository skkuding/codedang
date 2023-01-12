<script setup lang="ts">
import InputItem from '@/common/components/Atom/InputItem.vue'
import Button from '@/common/components/Atom/Button.vue'
import SendIcon from '~icons/carbon/send-filled'
import GroupListSection from '../components/GroupListSection.vue'
import Modal from '@/common/components/Molecule/Modal.vue'

import { ref } from 'vue'

//TODO: invitation 검색 API 연결 후 noInvitation 값을 변경하는 function 구현 필요
const noInvitationCode = ref(false)
const joinModalVisible = ref(false)
const invitationCode = ref(' ')

type Group = {
  id: number
  createdBy: number
  groupName: string
  private: boolean
  invitationCode: string
  description: string
  member: number
  createdUser: string
}

//getMyGroups
const myGroupList: Group[] = [
  {
    id: 1,
    createdBy: 1,
    groupName: 'SKKUDING',
    private: false,
    invitationCode: 'abcde',
    description: '성균관대학교 개발동아리입니다',
    member: 23,
    createdUser: '구성현'
  },
  {
    id: 2,
    createdBy: 1,
    groupName: 'TSS',
    private: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현'
  }
]

//getNonPrivateGroups
const groupList: Group[] = [
  {
    id: 1,
    createdBy: 1,
    groupName: 'SKKUDING',
    private: false,
    invitationCode: 'abcde',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현'
  },
  {
    id: 2,
    createdBy: 1,
    groupName: 'TSS',
    private: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현'
  }
]
</script>

<template>
  <div class="px-20 pt-20 md:px-40">
    <div class="mb-4 flex justify-end">
      <Button @click="joinModalVisible = true">Join Group</Button>
    </div>

    <GroupListSection :group-list="myGroupList" title="My Group" />
    <GroupListSection :group-list="groupList" title="All Group" pagination />
  </div>

  <Modal v-model="joinModalVisible" class="h-72 w-[400px]">
    <template #modal-title>Join Modal by Invitation Code</template>
    <template #modal-content>
      <div class="flex flex-col justify-center">
        <div class="mx-auto flex items-center">
          <InputItem
            v-model="invitationCode"
            placeholder="Invitation Code"
            class="mr-2"
          />
          <Button class="py-2"><SendIcon /></Button>
        </div>
        <div v-if="noInvitationCode" class="text-red text-sm">
          Group not found! Please check your code again
        </div>
        <div class="mt-2">
          If you have invitation code, enter the code here.
        </div>
      </div>
    </template>
  </Modal>
</template>
