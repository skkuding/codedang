<script setup lang="ts">
import { ref } from 'vue'
import InputItem from './InputItem.vue'

const data = ref('')
</script>

<template>
  <Story :layout="{ type: 'grid', width: '45%' }">
    <Variant title="Basic">
      <InputItem v-model="data" placeholder="Username" class="m-0.5" />
      <!-- [workaround] use `source` slot to show v-model -->
      <template #source>
        <textarea v-pre>
          <InputItem
            v-model="data"
            placeholder="Username"
          />
        </textarea>
      </template>
    </Variant>
    <Variant title="Required">
      <InputItem v-model="data" required placeholder="Username" class="m-0.5" />
      <template #source>
        <textarea v-pre>
          <InputItem
            v-model="data"
            required
            placeholder="Username"
          />
        </textarea>
      </template>
    </Variant>
    <Variant title="Shadow">
      <InputItem v-model="data" shadow placeholder="Username" class="m-2" />
      <template #source>
        <textarea v-pre>
          <InputItem
            v-model="data"
            shadow
            placeholder="Username"
          />
        </textarea>
      </template>
    </Variant>
    <Variant title="Sizing">
      <InputItem
        v-model="data"
        placeholder="Username"
        class="m-1 h-10 w-64 text-lg"
      />
      <template #source>
        <textarea v-pre>
          <InputItem
            v-model="data"
            class="h-10 w-64 text-lg"
            placeholder="Username"
          />
        </textarea>
      </template>
    </Variant>
  </Story>
</template>
