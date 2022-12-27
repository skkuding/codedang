<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import Sidebar from '@/common/components/Organism/Sidebar.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
</script>

<template>
  <div class="flex">
    <Sidebar />
    <main>
      <PageTitle text="Problem" />
      <div class="flex">
        <div>
          <Button>+ Create</Button>
          <Button>Import</Button>
        </div>
        <div><PageSubtitle text="created by" /></div>
      </div>
    </main>
  </div>
</template>
