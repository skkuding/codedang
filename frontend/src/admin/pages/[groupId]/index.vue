<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import { useDialog } from '@/common/composables/dialog'
import { useQuery } from '@vue/apollo-composable'
import { useDateFormat } from '@vueuse/core'
import gql from 'graphql-tag'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IconPenToSquare from '~icons/fa6-solid/pen-to-square'
import IconTrashCan from '~icons/fa6-solid/trash-can'

const props = defineProps<{
  groupId: string
}>()

interface Response {
  getGroup: {
    id: string
    groupName: string
    description: string
    memberNum: number
    createTime: string
    updateTime: string
    invitationUrl?: string
    config: {
      showOnList: boolean
      allowJoinWithURL: boolean
      allowJoinFromSearch: boolean
      requireApprovalBeforeJoin: boolean
    }
  }
}

const dialog = useDialog()
const groupMangers = ref(['홍길동', '하설빙', '방미서'])

const editModal = ref(false)

const showDeleteModal = () => {
  dialog.confirm({
    title: 'Delete Group',
    content: 'Do you really want to delete group?'
  })
}

const router = useRouter()
const group = ref<Response['getGroup']>()
const editGroup = ref<Response['getGroup']>()
const configNameMap = {
  showOnList: 'Show On List',
  allowJoinFromSearch: 'Allow Join From Search',
  allowJoinWithURL: 'Allow Join With URL',
  requireApprovalBeforeJoin: 'Require Approval Before Join'
}
const { onResult, onError } = useQuery<Response>(
  gql`
    query Group($groupId: Int!) {
      getGroup(groupId: $groupId) {
        id
        groupName
        description
        config
        createTime
        updateTime
        memberNum
      }
    }
  `,
  () => ({
    groupId: parseInt(props.groupId)
  })
)

const createUrl = () => {
  // Call API
}

const updateData = () => {
  // update both group and editGroup
}
onResult(({ data }) => {
  if (data) {
    group.value = data.getGroup
    editGroup.value = {
      ...data.getGroup,
      config: { ...data.getGroup.config }
    }
  }
})
onError(() => {
  router.push('/')
})
</script>

<template>
  <!-- TODO: mobile responsive -->
  <main>
    <h1
      class="text-text-title border-green flex w-2/3 items-center border-b-8 pb-4 text-3xl font-extrabold"
    >
      {{ group?.groupName }}
      <IconPenToSquare
        class="ml-6 cursor-pointer text-xl hover:opacity-60 active:opacity-40"
        @click="editModal = true"
      />
    </h1>
    <hr class="text-gray mt-[-1px] w-full" />
    <article class="flex w-full py-12">
      <div class="border-r-gray flex-1 justify-between border-r">
        <h2 class="text-text-subtitle text-xl font-bold">Description</h2>
        <p>{{ group?.description }}</p>
        <h2
          class="text-text-subtitle mt-12 text-xl font-bold"
          :class="[group?.config.showOnList ? 'text-green' : '']"
        >
          Group Managers
        </h2>
        <ul>
          <li v-for="name in groupMangers" :key="name">{{ name }}</li>
        </ul>

        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Configuration
        </h2>
        <div class="flex flex-row">
          <div>
            <p v-for="(key, _, index) in configNameMap" :key="index">
              {{ key + ':' }}
            </p>
          </div>
          <div class="ml-auto mr-12">
            <div
              v-for="(key, value) in configNameMap"
              :key="key"
              :class="{
                'text-green': group?.config[value]
              }"
            >
              {{ group?.config[value] }}
            </div>
          </div>
        </div>
      </div>
      <div class="ml-8 flex-1">
        <h2 class="text-text-subtitle text-xl font-bold">Total Members</h2>
        <p>{{ group?.memberNum }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Invitation URL
        </h2>
        <div v-if="group?.invitationUrl">{{ group?.invitationUrl }}</div>
        <Button color="green" @click="createUrl">Create URL</Button>

        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Create Time
        </h2>
        <p>
          {{ useDateFormat(group?.createTime, 'YYYY.MM.DD HH:mm:ss').value }}
        </p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Update Time
        </h2>
        <p>
          {{ useDateFormat(group?.updateTime, 'YYYY.MM.DD HH:mm:ss').value }}
        </p>
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
        <div class="bg-gray-light mb-6 h-[1px] w-full" />
        <div class="mb-6 flex">
          <h2 class="mr-10 text-lg font-semibold">Group Name</h2>
          <InputItem
            v-if="editGroup"
            v-model="editGroup.groupName"
            class="shadow"
          />
        </div>
        <div class="mb-6">
          <h2 class="mb-2 mr-10 text-lg font-semibold">Group Configuration</h2>
          <p
            v-for="(key, value, index) in configNameMap"
            :key="index"
            class="mt-1 flex"
          >
            {{ key }}
            <Switch
              v-if="editGroup"
              v-model="editGroup.config[value]"
              class="ml-auto mr-0"
            />
          </p>
        </div>

        <h2 class="mb-2 text-lg font-semibold">Description</h2>
        <InputItem
          v-if="group"
          v-model="group.description"
          class="w-full break-normal shadow"
        />
      </div>
      <div class="flex justify-end">
        <Button class="mr-8 px-4 py-2" @click="updateData">Save</Button>
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
