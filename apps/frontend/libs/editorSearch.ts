import {
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  search,
  SearchQuery,
  setSearchQuery
} from '@codemirror/search'
import { type EditorView, runScopeHandlers, type Panel } from '@codemirror/view'

function createSearchPanel(view: EditorView): Panel {
  const doc = view.dom.ownerDocument
  const dom = doc.createElement('div')
  dom.className =
    'cm-code-search flex items-center gap-1 bg-editor-background-2 px-3 py-2 text-caption3_r_13 text-color-neutral-90 [font-family:inherit]'
  dom.setAttribute('role', 'search')
  dom.setAttribute('aria-label', 'Find in code')

  const input = doc.createElement('input')
  input.type = 'text'
  input.className =
    'h-[30px] min-w-0 flex-1 rounded-small border border-editor-line-1 bg-editor-background-1 px-2.5 py-0 text-white outline-none placeholder:text-color-neutral-70 focus:border-primary-light'
  input.placeholder = 'Find in code…'
  input.setAttribute('aria-label', 'Find in code')
  input.setAttribute('main-field', 'true')
  input.autocomplete = 'off'
  input.spellcheck = false
  input.value = getSearchQuery(view.state).search
  input.addEventListener('input', () => {
    view.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({ search: input.value, literal: true })
      )
    })
  })
  dom.append(input)

  const addButton = (label: string, icon: string, action: () => void) => {
    const button = doc.createElement('button')
    button.type = 'button'
    button.className =
      'flex size-[30px] cursor-pointer items-center justify-center rounded-small border-0 bg-transparent p-0 text-sub2_m_18 text-color-neutral-90 hover:bg-editor-fill-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-light'
    button.textContent = icon
    button.title = label
    button.setAttribute('aria-label', label)
    button.addEventListener('click', action)
    dom.append(button)
  }
  addButton('Previous match (Shift+Enter)', '↑', () => findPrevious(view))
  addButton('Next match (Enter)', '↓', () => findNext(view))
  addButton('Close (Escape)', '×', () => closeSearchPanel(view))

  dom.addEventListener('keydown', (event) => {
    if (event.isComposing) {
      return
    }
    if (event.key === 'Enter' && event.target === input) {
      event.preventDefault()
      event.stopPropagation()
      ;(event.shiftKey ? findPrevious : findNext)(view)
    } else if (runScopeHandlers(view, event, 'search-panel')) {
      event.preventDefault()
      event.stopPropagation()
    }
  })

  return {
    dom,
    top: true,
    mount() {
      input.focus()
      input.select()
    },
    update(update) {
      const query = getSearchQuery(update.state)
      if (input.value !== query.search) {
        input.value = query.search
      }
    }
  }
}

export const editorSearch = [
  search({ top: true, literal: true, createPanel: createSearchPanel })
]
