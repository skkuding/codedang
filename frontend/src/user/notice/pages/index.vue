<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import { useNoticeList } from '../composables/notice'

const { goDetail, noticeField, currentItems, shownPages, search, changeItems } =
  useNoticeList()
</script>

<template>
  <div class="mt-10">
    <PageTitle text="Notice" />
    <PaginationTable
      :fields="noticeField"
      :items="currentItems"
      text="No Notice"
      :number-of-pages="shownPages"
      @search="search"
      @change-page="changeItems"
      @row-clicked="goDetail"
    />
  </div>
</template>
