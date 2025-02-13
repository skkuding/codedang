import { ReactRenderer } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import type { KeyboardEvent } from 'react'
import type { Instance as TippyInstance } from 'tippy.js'
import tippy from 'tippy.js'
import type { CommandListProps } from './CommandsList'
import { CommandList } from './CommandsList'

export interface RenderItemsProps extends CommandListProps {
  event?: KeyboardEvent
}

const renderItems = () => {
  let component: ReactRenderer<CommandList, CommandListProps> | null = null
  let popup: TippyInstance | null = null
  let fixedX: number | null = null

  const getDefaultClientRect = (editor: Editor): DOMRect => {
    const { state, view } = editor
    const { $from } = state.selection
    const coords = view.coordsAtPos($from.pos)

    if (fixedX === null) {
      fixedX = coords.left
    }

    return new DOMRect(fixedX, coords.top, 1, 1)
  }

  return {
    onStart: (props: RenderItemsProps) => {
      fixedX = null

      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor
      })

      popup = tippy(document.body, {
        getReferenceClientRect: () => getDefaultClientRect(props.editor),
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start'
      })
    },
    onUpdate(props: RenderItemsProps) {
      component?.updateProps(props)

      if (popup) {
        popup.setProps({
          getReferenceClientRect: () => getDefaultClientRect(props.editor)
        })
      }
    },
    onKeyDown(props: { event: KeyboardEvent<Element> }) {
      if (props.event.key === 'Escape') {
        popup?.hide()
        return true
      }

      return (
        (component?.ref?.onKeyDown?.({ event: props.event }) as boolean) ??
        false
      )
    },
    onExit() {
      popup?.destroy()
      component?.destroy()
      fixedX = null
    }
  }
}

export { renderItems }
