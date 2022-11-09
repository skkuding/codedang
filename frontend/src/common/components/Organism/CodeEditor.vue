<script setup lang="ts">
import { ref, shallowRef, watch, onMounted } from 'vue'
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers
} from '@codemirror/view'
import { EditorState, type Transaction } from '@codemirror/state'
import { defaultKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = ref()
const view = shallowRef(new EditorView())

const font = EditorView.theme({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', monospace"
  }
})

const state = EditorState.create({
  doc: props.modelValue,
  extensions: [
    keymap.of(defaultKeymap),
    oneDark,
    font,
    cpp(),
    lineNumbers(),
    highlightActiveLine(),
    syntaxHighlighting(defaultHighlightStyle)
  ]
})

watch(
  () => props.modelValue,
  (value) => {
    view.value.dispatch({
      changes: { from: 0, to: view.value.state.doc.length, insert: value },
      selection: view.value.state.selection
    })
  }
)

onMounted(() => {
  view.value = new EditorView({
    state,
    parent: editor.value,
    dispatch: (tr: Transaction) => {
      view.value.update([tr])
      if (tr.changes.empty) return
      const v = view.value.state.doc.toString()
      emit('update:modelValue', v)
    }
  })
})
</script>

<template>
  <div ref="editor" class="h-80 w-full" />
</template>
