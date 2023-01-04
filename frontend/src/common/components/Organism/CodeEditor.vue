<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted } from 'vue'
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
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'

const props = withDefaults(
  defineProps<{
    modelValue: string
    lang?: 'cpp' | 'python' | 'javascript' | 'java'
  }>(),
  { lang: 'cpp' }
)

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

const languageExtensions = {
  cpp: cpp(),
  python: python(),
  javascript: javascript(),
  java: java()
}

const extensions = computed(() => [
  keymap.of(defaultKeymap),
  oneDark,
  font,
  languageExtensions[props.lang],
  lineNumbers(),
  highlightActiveLine(),
  syntaxHighlighting(defaultHighlightStyle)
])

const state = EditorState.create({
  doc: props.modelValue,
  extensions: extensions.value
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
