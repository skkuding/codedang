<script setup lang="ts">
import InputItem from '@/common/components/Atom/InputItem.vue'
import Button from '@/common/components/Atom/Button.vue'
import IconSendFilled from '~icons/carbon/send-filled'
import GroupListSection from '../components/GroupListSection.vue'
import Modal from '@/common/components/Molecule/Modal.vue'

import { ref } from 'vue'

//TODO: invitation 검색 API 연결 후 noInvitation 값을 변경하는 function 구현 필요
const noInvitationCode = ref(false)
const joinModalVisible = ref(false)
const invitationCode = ref('')

type Group = {
  id: number
  createdBy: number
  groupName: string
  groupAdmin: string
  groupManager: string
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
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
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
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
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
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
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
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    private: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현'
  },
  {
    id: 3,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    private: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현'
  },
  {
    id: 4,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    private: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현'
  }
]
</script>

<template>
  <div class="mt-10 flex flex-col">
    <Button class="self-end" @click="joinModalVisible = true">
      Join Group
    </Button>
    <GroupListSection
      :group-list="myGroupList"
      title="My Group"
      :my-group="true"
    />
    <GroupListSection
      :group-list="groupList"
      title="All Group"
      pagination
      :my-group="false"
    />
    <Modal v-model="joinModalVisible" class="px-4 shadow-md">
      <div class="flex flex-col items-center gap-2 py-12 px-4">
        <h1 class="mb-2 text-center text-lg font-bold">
          Join Group by Invitation Code
        </h1>
        <div class="flex items-start gap-2">
          <InputItem v-model="invitationCode" placeholder="Invitation Code" />
          <Button class="py-2"><IconSendFilled /></Button>
        </div>
        <p v-if="noInvitationCode" class="text-red">
          Group not found! Please check your code again
        </p>
        <p>If you have invitation code, enter the code here.</p>
      </div>
    </Modal>
  </div>
</template>
