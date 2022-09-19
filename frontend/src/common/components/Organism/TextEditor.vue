<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import ButtonGroup from '@/common/components/Molecule/ButtonGroup.vue'
import Button from '@/common/components/Atom/Button.vue'
import IconBold from '~icons/bi/type-bold'
import IconItalic from '~icons/bi/type-italic'
import IconStrikethrough from '~icons/bi/type-strikethrough'
import IconCode from '~icons/bi/code-slash'
import IconTextSlash from '~icons/fa6-solid/text-slash'
import IconH1 from '~icons/bi/type-h1'
import IconH2 from '~icons/bi/type-h2'
import IconParagraph from '~icons/bi/paragraph'
import IconListUl from '~icons/bi/list-ul'
import IconList from '~icons/bi/list'
import IconCodeSquare from '~icons/bi/code-square'
import IconReturn from '~icons/bi/arrow-return-left'
import IconRoundBlockQuote from '~icons/bi/quote'
import IconHr from '~icons/bi/hr'
import IconArrowCounterClockwise from '~icons/bi/arrow-counterclockwise'
import IconArrowClockwise from '~icons/bi/arrow-clockwise'

const editor = useEditor({
  content: '',
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class:
        'prose prose-sm md:prose-base ring-gray p-5 outline-none ring-1 focus:outline-none focus:ring'
    }
  }
})
</script>

<template>
  <div class="ring-gray w-fit rounded ring-1">
    <div class="pb-2 text-center sm:max-w-[34rem] md:w-fit md:max-w-none">
      <ButtonGroup class="mx-2 mt-2 inline-block">
        <Button
          :pressed="editor?.isActive('bold')"
          color="white"
          @click="editor?.chain().focus().toggleBold().run()"
        >
          <IconBold />
        </Button>
        <Button
          :pressed="editor?.isActive('italic')"
          color="white"
          @click="editor?.chain().focus().toggleItalic().run()"
        >
          <IconItalic />
        </Button>
        <Button
          :pressed="editor?.isActive('strike')"
          color="white"
          @click="editor?.chain().focus().toggleStrike().run()"
        >
          <IconStrikethrough />
        </Button>
        <Button
          :pressed="editor?.isActive('code')"
          color="white"
          @click="editor?.chain().focus().toggleCode().run()"
        >
          <IconCode />
        </Button>
        <Button
          color="white"
          class="p-0.5"
          @click="editor?.chain().focus().unsetAllMarks().run()"
        >
          <IconTextSlash />
        </Button>
      </ButtonGroup>
      <ButtonGroup class="mx-2 mt-2 inline-block">
        <Button
          :pressed="editor?.isActive('heading', { level: 1 })"
          color="white"
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <IconH1 />
        </Button>
        <Button
          :pressed="editor?.isActive('heading', { level: 2 })"
          color="white"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <IconH2 />
        </Button>
        <Button
          :pressed="editor?.isActive('paragraph')"
          color="white"
          @click="editor?.chain().focus().setParagraph().run()"
        >
          <IconParagraph />
        </Button>
        <Button
          :pressed="editor?.isActive('bulletList')"
          color="white"
          @click="editor?.chain().focus().toggleBulletList().run()"
        >
          <IconListUl />
        </Button>
        <Button
          :pressed="editor?.isActive('orderedList')"
          color="white"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        >
          <IconList />
        </Button>
        <Button
          :pressed="editor?.isActive('codeBlock')"
          color="white"
          @click="editor?.chain().focus().toggleCodeBlock().run()"
        >
          <IconCodeSquare />
        </Button>
      </ButtonGroup>
      <ButtonGroup class="mx-2 mt-2 inline-block">
        <Button
          color="white"
          @click="editor?.chain().focus().setHardBreak().run()"
        >
          <IconReturn />
        </Button>
        <Button
          :pressed="editor?.isActive('blockquote')"
          color="white"
          @click="editor?.chain().focus().toggleBlockquote().run()"
        >
          <IconRoundBlockQuote />
        </Button>
        <Button
          color="white"
          @click="editor?.chain().focus().setHorizontalRule().run()"
        >
          <IconHr />
        </Button>
      </ButtonGroup>
      <ButtonGroup class="mx-2 mt-2 inline-block">
        <Button color="white" @click="editor?.chain().focus().undo().run()">
          <IconArrowCounterClockwise />
        </Button>
        <Button color="white" @click="editor?.chain().focus().redo().run()">
          <IconArrowClockwise />
        </Button>
      </ButtonGroup>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>
