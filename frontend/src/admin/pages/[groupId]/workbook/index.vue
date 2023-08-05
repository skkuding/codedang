<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import { NDatePicker } from 'naive-ui'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

const props = defineProps<{
  groupId: string
}>()
const onoff = ref(true)

const show = ref(false)
const title = ref('')
const dateRange = ref<[number, number]>([Date.now(), Date.now()])
const problemVisibleStat = ref(false)
const difficultyVisibleStat = ref(false)
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]" />
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        Workbook List
      </h1>
      <Button @click="show = true">+ Create</Button>
    </div>
    <PaginationTable
      :fields="[
        {
          key: 'id',
          label: 'ID',
          width: '10%'
        },
        {
          key: 'title',
          label: 'Title',
          width: '20%'
        },
        {
          key: 'period',
          label: 'Period',
          width: '30%'
        },
        {
          key: 'visible',
          label: 'Visible',
          width: '15%'
        },
        {
          key: 'created',
          label: 'Created By',
          width: '20%'
        },
        {
          key: 'delete',
          label: 'Delete',
          width: '20%'
        }
      ]"
      :items="[
        {
          id: 1,
          title: '2주차 과제',
          period: '2022-08-28 18:00 ~ 2022-08-28 22:00',
          visible: '',
          created: '하솔비',
          delete: ''
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      @row-clicked="
        (data) => $router.push(`/admin/${props.groupId}/workbook/` + data.id)
      "
    >
      <template #visible="{}">
        <Switch v-model="onoff" @click.stop="" />
      </template>
      <template #delete="{}">
        <Button
          class="flex h-[32px] w-[32px] items-center justify-center"
          @click.stop="console.log('test')"
        >
          <IconTrash />
        </Button>
      </template>
    </PaginationTable>
  </div>
  <Modal v-model="show" class="mx-8 w-full">
    <div class="overflow-auto px-40">
      <div class="flex flex-col">
        <div class="mt-10">
          <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
            Create Workbook
          </h1>
        </div>
        <div class="bg-gray mt-2 h-[1px]" />
        <div class="mt-10 flex">
          <div class="w-20 text-lg font-bold">Group</div>
          <div class="flex items-center">NPC 중급반</div>
        </div>
        <div class="mt-6 flex">
          <div class="w-20 text-lg font-bold">Title</div>
          <InputItem v-model="title" required placeholder="Title" />
        </div>
        <h2 class="mt-8 text-lg font-bold">Description</h2>
        <TextEditor size="lg" />
        <h2 class="mt-8 text-lg font-bold">Period</h2>
        <div>
          <NDatePicker
            v-model:value="dateRange"
            type="datetimerange"
            clearable
          />
        </div>
        <div class="mt-10 flex">
          <Switch v-model="problemVisibleStat" class="mr-8" label="Visible" />
          <Switch
            v-model="difficultyVisibleStat"
            label="Problem Difficulty Visible"
          />
        </div>
        <div class="bg-gray mt-10 h-[1px]" />
        <div class="mt-8 flex justify-end">
          <div class="flex">
            <Button
              class="mr-8 px-4 py-1"
              color="gray-dark"
              @click="show = false"
            >
              Cancel
            </Button>
            <Button class="px-4 py-1">Next</Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
