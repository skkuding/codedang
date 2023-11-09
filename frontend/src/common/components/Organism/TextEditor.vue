<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import RiBold from '~icons/ri/bold'
import RiCodeBoxFill from '~icons/ri/code-box-fill'
import RiCodeFill from '~icons/ri/code-fill'
import RiDoubleQuotesL from '~icons/ri/double-quotes-l'
import RiH1 from '~icons/ri/h-1'
import RiH2 from '~icons/ri/h-2'
import RiItalic from '~icons/ri/italic'
import RiListOrdered from '~icons/ri/list-ordered'
import RiListUnordered from '~icons/ri/list-unordered'
import RiStrikethrough from '~icons/ri/strikethrough'
import TextEditorButton from '../Atom/TextEditorButton.vue'

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  modelValue?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const sizes = {
  sm: 'min-h-[100px]',
  md: 'min-h-[200px]',
  lg: 'min-h-[300px]'
}

const editor = useEditor({
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: `prose p-5 outline-none prose-p:m-0 max-w-full`
    }
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  }
})
</script>

<template>
  <div
    class="rounded-xl border border-slate-50 shadow-sm"
    :class="sizes[props.size || 'md']"
    @click.self="editor?.commands.focus()"
  >
    <div
      class="text-text flex items-center gap-1 border-b border-slate-50 p-2 shadow-sm"
    >
      <TextEditorButton
        :is-active="editor?.isActive('heading', { level: 1 })"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <RiH1 />
      </TextEditorButton>
      <TextEditorButton
        :is-active="editor?.isActive('heading', { level: 2 })"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <RiH2 />
      </TextEditorButton>
      <div class="h-5 w-[1px] bg-slate-100" />
      <TextEditorButton
        :is-active="editor?.isActive('bold')"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <RiBold />
      </TextEditorButton>
      <TextEditorButton
        :is-active="editor?.isActive('italic')"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <RiItalic />
      </TextEditorButton>
      <TextEditorButton
        :is-active="editor?.isActive('strike')"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <RiStrikethrough />
      </TextEditorButton>
      <TextEditorButton
        :is-active="editor?.isActive('code')"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <RiCodeFill />
      </TextEditorButton>
      <div class="h-5 w-[1px] bg-slate-100" />
      <TextEditorButton
        :is-active="editor?.isActive('bulletList')"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <RiListUnordered />
      </TextEditorButton>
      <TextEditorButton
        :is-active="editor?.isActive('orderedList')"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <RiListOrdered />
      </TextEditorButton>
      <div class="h-5 w-[1px] bg-slate-100" />
      <TextEditorButton
        :is-active="editor?.isActive('codeBlock')"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
        <RiCodeBoxFill />
      </TextEditorButton>
      <TextEditorButton
        :is-active="editor?.isActive('blockquote')"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <RiDoubleQuotesL />
      </TextEditorButton>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
