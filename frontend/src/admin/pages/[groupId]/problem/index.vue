<script setup lang="ts">
import CreatePorblemModal from '@/admin/components/CreateProblemModal.vue'
import ImportProblemModal from '@/admin/components/ImportProblemModal.vue'
import Button from '@/common/components/Atom/Button.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useDialog } from '@/common/composables/dialog'
import { useFileDialog } from '@vueuse/core'
import axios from 'axios'
import { ref } from 'vue'
import CloudArrowDown from '~icons/fa6-solid/cloud-arrow-down'
import IconTrash from '~icons/fa/trash-o'

const props = defineProps<{
  groupId: string
}>()
console.log(props)
const showProblemModal = ref(false)
const showImportModal = ref(false)
const { open, onChange } = useFileDialog()
const dialog = useDialog()
const extension = '.xlsx'
onChange(async (files) => {
  if (!files) return
  if (!files[0].name.toLowerCase().endsWith(extension)) {
    dialog.error({
      title: 'Unsupported extension',
      content: `Only support ${extension}`,
      yes: 'OK'
    })
  } else {
    console.log(files[0])
    const operations = {
      query:
        'mutation($groupId: Float!, $input: UploadFileInput!) { uploadProblems(groupId: $groupId, input: $input){id createdById groupId title description template languages difficulty}}',
      variables: { groupId: Number(props.groupId), input: { file: null } }
    }
    const map = { nfile: ['variables.input.file'] }
    const formData = new FormData()
    formData.append('operations', JSON.stringify(operations))
    formData.append('map', JSON.stringify(map))
    formData.append('files', files[0])
    try {
      const { data } = await axios.post('/graphql', formData, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'multipart/form-data',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Apollo-Require-Preflight': true
        }
      })
      console.log(data)
      dialog.success({
        title: 'Success',
        content: 'Successfully Uploaded',
        yes: 'OK'
      })
    } catch (e) {
      console.log(e)
    }
  }
})
</script>

<template>
  <ImportProblemModal
    :toggle="showImportModal"
    :set-toggle="() => (showImportModal = !showImportModal)"
  />
  <CreatePorblemModal
    :toggle="showProblemModal"
    :set-toggle="
      (a) => {
        showProblemModal = !a
      }
    "
  />
  <Dialog />
  <div class="flex flex-col">
    <div class="border-gray border-b text-right text-lg font-semibold">
      SKKUDING
    </div>
    <div class="mt-10 flex gap-5">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">Problem</h1>
      <div class="flex items-center gap-3">
        <Button @click="() => (showProblemModal = true)">+ Create</Button>
        <Button @click="() => (showImportModal = true)">Import</Button>
        <Button type="Button" class="flex items-center gap-2" @click="open()">
          <CloudArrowDown />
          File Upload
        </Button>
      </div>
    </div>
    <PaginationTable
      :fields="[
        {
          key: 'id',
          label: 'ID',
          width: '8%'
        },
        {
          key: 'displayId',
          label: 'Display Id',
          width: '12%'
        },
        {
          key: 'title',
          label: 'Title',
          width: '30%'
        },
        {
          key: 'difficulty',
          label: 'Difficulty',
          width: '15%'
        },
        {
          key: 'lastUpdated',
          label: 'Last Updated',
          width: '25%'
        },
        {
          key: '_delete',
          label: 'Delete',
          width: '10%'
        }
      ]"
      :items="[
        {
          id: '1',
          displayId: 'A',
          title: '가파른 경사',
          difficulty: 'Level1',
          lastUpdated: '2021-12-31 08:30:45',
          option: '123'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      no-search-bar
    >
      <template #_delete="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconTrash />
          </Button>
        </div>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
