<script setup lang="ts">
import groupImage from '@/common/assets/logo.png'
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import { useDateFormat } from '@vueuse/core'
import { NUpload, NButton, NColorPicker } from 'naive-ui'
import { ref } from 'vue'
import IconLock from '~icons/bi/lock'
import IconUnlock from '~icons/bi/unlock'
import IconPenToSquare from '~icons/fa6-solid/pen-to-square'
import IconTrashCan from '~icons/fa6-solid/trash-can'

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
const groupPrivate = ref(false)
const groupDescription = ref('')
const deleteModal = ref(false)
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
          Public / Private
        </h2>
        <div class="flex flex-row items-center gap-2">
          <IconUnlock />
          Public
          <IconLock class="ml-4" />
          Private
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
    <Button class="ml-auto flex items-center" @click="deleteModal = true">
      <IconTrashCan class="mr-2" />
      Delete
    </Button>
    <Modal v-model="editModal" class="shadow-md">
      <div class="flex flex-col px-8 py-12">
        <h1 class="text-gray-dark mb-2 text-2xl font-bold">Edit Group</h1>
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
    <Modal v-model="deleteModal">
      <div class="flex flex-col items-center gap-10">
        <h1 class="text-xl font-semibold">Delete Group</h1>
        <div>Do you really want to delete group?</div>
        <div class="flex">
          <Button class="mr-4 px-8 py-2">Yes</Button>
          <Button class="px-8 py-2">No</Button>
        </div>
      </div>
    </Modal>
  </main>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
