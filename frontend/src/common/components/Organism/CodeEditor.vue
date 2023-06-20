<script setup lang="ts">
import { ref, shallowRef, watch, onMounted } from 'vue'
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  drawSelection
} from '@codemirror/view'
import { EditorState, type Transaction } from '@codemirror/state'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import { closeBrackets } from '@codemirror/autocomplete'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  type LanguageSupport
} from '@codemirror/language'
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

const languageExtensions: Record<string, () => Promise<LanguageSupport>> = {
  cpp: () => import('@codemirror/lang-cpp').then((x) => x.cpp()),
  python: () => import('@codemirror/lang-python').then((x) => x.python()),
  javascript: () =>
    import('@codemirror/lang-javascript').then((x) => x.javascript()),
  java: () => import('@codemirror/lang-java').then((x) => x.java())
}

const extensions = [
  keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  oneDark,
  font,
  await languageExtensions[props.lang](),
  history(),
  lineNumbers(),
  highlightActiveLine(),
  drawSelection(),
  closeBrackets(),
  syntaxHighlighting(defaultHighlightStyle),
  indentOnInput()
]

const state = EditorState.create({
  doc: props.modelValue,
  extensions: extensions
})

watch(
  () => props.modelValue,
  (value) => {
    if (view.value.state.doc.toString() === value) {
      return
    }
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
  <div ref="editor" class="w-full" />
</template>
