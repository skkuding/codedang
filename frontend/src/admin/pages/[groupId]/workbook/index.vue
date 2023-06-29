<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

const props = defineProps<{
  groupId: string
}>()
const onoff = ref(true)
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]"></div>
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        Workbook List
      </h1>
      <Button>+ Create</Button>
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
        <Switch v-model="onoff" />
      </template>
      <template #delete="{}">
        <Button class="flex h-[32px] w-[32px] items-center justify-center">
          <IconTrash />
        </Button>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
