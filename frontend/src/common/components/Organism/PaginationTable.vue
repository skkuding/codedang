<!-- <script setup lang="ts">
defineProps<{
  msg?: string
}>()
</script>

<template>
  <div>Organism Component props : HELLO WORLD</div>
</template> -->

<template>
  <table class="mx-auto mb-5 w-11/12 table-auto">
    <thead v-if="!noHeader">
      <tr class="bg-table-header text-text-title" :class="setTableStyle">
        <th v-for="(field, index) in fields" :key="index" class="p-2.5 pl-4">
          <span v-if="Object.keys(field).includes('label')">
            {{ field.label }}
          </span>
          <span v-else>{{ capitalize(field.key) }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="items.length === 0">
        <td class="p-2.5 pl-4">{{ text }}</td>
      </tr>
      <template v-for="(row, index) in items" v-else>
        <tr
          v-if="index >= startIndex && index <= endIndex"
          :key="index"
          :class="setHover + setTableStyle + setBorder"
          @click="clickEvent(row)"
        >
          <td v-for="(field, idx) in fields" :key="idx" class="p-2.5 pl-4">
            <slot :name="field.key" :row="row" :index="index"></slot>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script>
export default {
  components: {},
  props: {
    fields: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    perPage: {
      type: Number,
      required: false,
      default: 20
    },
    currentPage: {
      type: Number,
      required: false,
      default: 1
    },
    text: {
      type: String,
      required: false,
      default: 'No Data'
    },
    lightStyle: {
      type: Boolean,
      required: false
    },
    noHeader: {
      type: Boolean,
      required: false
    },
    noBorder: {
      type: Boolean,
      required: false
    },
    hover: {
      type: Boolean,
      required: false
    }
  },
  computed: {
    setHover() {
      if (this.hover) {
        return 'hover:bg-table-hover cursor-pointer'
      } else {
        return ''
      }
    },
    setTableStyle() {
      if (this.lightStyle) {
        return ' text-white bg-transparent border-t border-b border-table-border'
      } else {
        return ''
      }
    },
    setBorder() {
      if (this.noBorder) {
        return ''
      } else {
        return ' border-b border-table-border'
      }
    },
    startIndex() {
      return (this.currentPage - 1) * this.perPage
    },
    endIndex() {
      return this.currentPage * this.perPage - 1
    }
  },
  methods: {
    clickEvent(row) {
      const data = row
      this.$emit('row-clicked', data)
    },
    capitalize(key) {
      return key.charAt(0).toUpperCase() + key.slice(1)
    }
  }
}
</script>
