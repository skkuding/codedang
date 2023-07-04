<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import ButtonGroup from '@/common/components/Molecule/ButtonGroup.vue'
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import IconArrowClockwise from '~icons/bi/arrow-clockwise'
import IconArrowCounterClockwise from '~icons/bi/arrow-counterclockwise'
import IconReturn from '~icons/bi/arrow-return-left'
import IconCode from '~icons/bi/code-slash'
import IconCodeSquare from '~icons/bi/code-square'
import IconHr from '~icons/bi/hr'
import IconList from '~icons/bi/list'
import IconListUl from '~icons/bi/list-ul'
import IconParagraph from '~icons/bi/paragraph'
import IconRoundBlockQuote from '~icons/bi/quote'
import IconBold from '~icons/bi/type-bold'
import IconH1 from '~icons/bi/type-h1'
import IconH2 from '~icons/bi/type-h2'
import IconItalic from '~icons/bi/type-italic'
import IconStrikethrough from '~icons/bi/type-strikethrough'
import IconTextSlash from '~icons/fa6-solid/text-slash'

const editor = useEditor({
  content: '',
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class:
        'prose prose-sm md:prose-base ring-gray p-5 outline-none overflow-auto ring-1 focus:outline-none focus:ring h-[300px] w-full'
    }
  }
})
</script>

<template>
  <div class="pb-2 text-center sm:max-w-[34rem] md:w-fit md:max-w-none">
    <ButtonGroup class="mt-2 inline-block">
      <Button
        :pressed="editor?.isActive('bold')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <IconBold />
      </Button>
      <Button
        :pressed="editor?.isActive('italic')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <IconItalic />
      </Button>
      <Button
        :pressed="editor?.isActive('strike')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <IconStrikethrough />
      </Button>
      <Button
        :pressed="editor?.isActive('code')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <IconCode />
      </Button>
      <Button
        outline
        color="gray-dark"
        class="p-0.5"
        @click="editor?.chain().focus().unsetAllMarks().run()"
      >
        <IconTextSlash />
      </Button>
    </ButtonGroup>
    <ButtonGroup class="mx-2 mt-2 inline-block">
      <Button
        :pressed="editor?.isActive('heading', { level: 1 })"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <IconH1 />
      </Button>
      <Button
        :pressed="editor?.isActive('heading', { level: 2 })"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <IconH2 />
      </Button>
      <Button
        :pressed="editor?.isActive('paragraph')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().setParagraph().run()"
      >
        <IconParagraph />
      </Button>
      <Button
        :pressed="editor?.isActive('bulletList')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <IconListUl />
      </Button>
      <Button
        :pressed="editor?.isActive('orderedList')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <IconList />
      </Button>
      <Button
        :pressed="editor?.isActive('codeBlock')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
        <IconCodeSquare />
      </Button>
    </ButtonGroup>
    <ButtonGroup class="mx-2 mt-2 inline-block">
      <Button
        outline
        color="gray-dark"
        @click="editor?.chain().focus().setHardBreak().run()"
      >
        <IconReturn />
      </Button>
      <Button
        :pressed="editor?.isActive('blockquote')"
        outline
        color="gray-dark"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <IconRoundBlockQuote />
      </Button>
      <Button
        outline
        color="gray-dark"
        @click="editor?.chain().focus().setHorizontalRule().run()"
      >
        <IconHr />
      </Button>
    </ButtonGroup>
    <ButtonGroup class="mx-2 mt-2 inline-block">
      <Button
        outline
        color="gray-dark"
        @click="editor?.chain().focus().undo().run()"
      >
        <IconArrowCounterClockwise />
      </Button>
      <Button
        outline
        color="gray-dark"
        @click="editor?.chain().focus().redo().run()"
      >
        <IconArrowClockwise />
      </Button>
    </ButtonGroup>
  </div>
  <editor-content :editor="editor" class="p-0.5" />
</template>
