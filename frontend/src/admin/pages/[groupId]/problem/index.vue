<script setup lang="ts">
import ImportProblemModal from '@/admin/components/ImportProblemModal.vue'
import Button from '@/common/components/Atom/Button.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useDialog } from '@/common/composables/dialog'
import { useListGraphQL } from '@/common/composables/graphql'
import { useDateFormat, useFileDialog } from '@vueuse/core'
import axios from 'axios'
import gql from 'graphql-tag'
import { watchEffect, computed, ref, toRefs } from 'vue'
import CloudArrowDown from '~icons/fa6-solid/cloud-arrow-down'
import IconTrash from '~icons/fa/trash-o'

const props = defineProps<{
  groupId: string
}>()

const { groupId } = toRefs(props)

type ProblemItem = {
  id: string
  title: string
  difficulty: string
  updateTime: string
}
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
    // TODO: use apollo-upload-client
    const operations = {
      query:
        'mutation($groupId: Float!, $input: UploadFileInput!) { uploadProblems(groupId: $groupId, input: $input){id createdById groupId title description template languages difficulty}}',
      variables: { groupId: Number(groupId), input: { file: null } }
    }
    const map = { files: ['variables.input.file'] }
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
      if (data.data) {
        dialog.success({
          title: 'Success',
          content: 'Successfully Uploaded',
          yes: 'OK'
        })
      } else {
        dialog.error({
          title: 'Something went wrong',
          content: 'Please try again',
          yes: 'OK'
        })
      }
    } catch (e) {
      dialog.error({
        title: 'Something went wrong',
        content: 'Please try again',
        yes: 'OK'
      })
    }
  }
})

const GET_PROBLEMS = gql`
  query Problem(
    $groupId: Float!
    $cursor: Float
    $take: Int!
    $input: FilterProblemsInput!
  ) {
    getProblems(
      groupId: $groupId
      cursor: $cursor
      take: $take
      input: $input
    ) {
      id
      title
      difficulty
      updateTime
    }
  }
`

const { items, totalPages, changePage } = useListGraphQL<ProblemItem>(
  GET_PROBLEMS,
  { groupId: computed(() => parseInt(groupId.value)), input: {} },
  { take: 10 }
)
watchEffect(() => {
  items.value = items.value.map((item: ProblemItem) => {
    return {
      ...item,
      updateTime: useDateFormat(item.updateTime, 'YYYY-MM-DD HH:mm:ss').value
    }
  })
})
</script>

<template>
  <ImportProblemModal
    :toggle="showImportModal"
    :set-toggle="() => (showImportModal = !showImportModal)"
  />
  <Dialog />
  <div class="flex flex-col">
    <div class="mt-10 flex gap-5">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">Problem</h1>
      <div class="flex items-center gap-3">
        <Button @click="() => $router.push('problem/create')">+ Create</Button>
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
          label: '#',
          width: '8%'
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
          key: 'updateTime',
          label: 'Last Updated',
          width: '25%'
        },
        {
          key: '_delete',
          label: 'Delete',
          width: '10%'
        }
      ]"
      :items="items"
      placeholder="keywords"
      :number-of-pages="totalPages"
      no-search-bar
      @change-page="changePage"
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
