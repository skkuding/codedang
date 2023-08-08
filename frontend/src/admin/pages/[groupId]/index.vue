<script setup lang="ts">
import groupImage from '@/common/assets/logo.png'
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import { useDialog } from '@/common/composables/dialog'
import { useDateFormat } from '@vueuse/core'
import { ref } from 'vue'
import IconPenToSquare from '~icons/fa6-solid/pen-to-square'
import IconTrashCan from '~icons/fa6-solid/trash-can'

const dialog = useDialog()
const groupName = ref('SKKUDING')
const description = ref('SKKU 개발동아리입니다.')
const members = ref(16)
const invitationCode = ref('ABCDEF')
const groupMangers = ref(['홍길동', '하설빙', '방미서'])

const groupCreateTime = ref('2022-03-02 12:00:00')
const groupCreateTimeFormat = useDateFormat(
  groupCreateTime,
  'YYYY.MM.DD HH:mm:ss'
)

const groupUpdateTime = ref('2022-09-02 12:00:00')
const groupUpdateTimeFormat = useDateFormat(
  groupUpdateTime,
  'YYYY.MM.DD HH:mm:ss'
)
const editModal = ref(false)
const groupConfig = ref({
  showOnList: false,
  allowJoinFromSearch: true,
  allowJoinWithURL: false,
  requireApprovalBeforeJoin: true
})
const groupDescription = ref('')

const showDeleteModal = () => {
  dialog.confirm({
    title: 'Delete Group',
    content: 'Do you really want to delete group?'
  })
}
</script>

<template>
  <!-- TODO: mobile responsive -->
  <main>
    <h1
      class="text-text-title border-green flex w-2/3 items-center border-b-8 pb-4 text-3xl font-extrabold"
    >
      {{ groupName }}
      <IconPenToSquare
        class="ml-6 cursor-pointer text-xl hover:opacity-60 active:opacity-40"
        @click="editModal = true"
      />
    </h1>
    <hr class="text-gray mt-[-1px] w-full" />
    <article class="flex w-full py-12">
      <div class="border-r-gray flex-1 justify-between border-r">
        <h2 class="text-text-subtitle text-xl font-bold">Description</h2>
        <p>{{ description }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Configuration
        </h2>

        <div>Show On List: {{ groupConfig.showOnList }}</div>
        <div>Allow Join From Search: {{ groupConfig.allowJoinFromSearch }}</div>
        <div>Allow Join With URL: {{ groupConfig.allowJoinWithURL }}</div>
        <div>
          Require Approval Before Join:
          {{ groupConfig.requireApprovalBeforeJoin }}
        </div>

        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Total Members
        </h2>
        <p>{{ members }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Create Time
        </h2>
        <p>{{ groupCreateTimeFormat }}</p>
      </div>
      <div class="ml-8 flex-1">
        <h2 class="text-text-subtitle text-xl font-bold">
          Group Image & Color
        </h2>
        <img
          :src="groupImage"
          class="aspect-square h-24 rounded-lg object-contain p-2 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
        />
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Invitation Code
        </h2>
        <p>{{ invitationCode }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Managers
        </h2>
        <ul>
          <li v-for="name in groupMangers" :key="name">{{ name }}</li>
        </ul>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Update Time
        </h2>
        <p>{{ groupUpdateTimeFormat }}</p>
      </div>
    </article>
    <!-- TODO: dialog verifying group deletion -->
    <Button class="ml-auto flex items-center" @click="showDeleteModal">
      <IconTrashCan class="mr-2" />
      Delete
    </Button>
    <Modal v-model="editModal" class="shadow-md">
      <div class="flex flex-col px-8 pb-12">
        <h1 class="text-gray-dark mb-2 text-2xl font-bold">Edit Group</h1>
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
              :class="[
                groupConfig.requireApprovalBeforeJoin ? '' : 'text-green'
              ]"
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
    <!-- TODO: enter group name if leader want to delete -->
    <Dialog />
  </main>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
