import { RangeSet, StateEffect, StateField } from '@codemirror/state'
import { type EditorView, gutter, GutterMarker } from '@uiw/react-codemirror'

class CheckboxMarker extends GutterMarker {
  checked: boolean

  constructor(checked = false) {
    super()
    this.checked = checked
  }

  toDOM() {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.style.cursor = 'pointer'
    checkbox.style.marginRight = '12px'
    checkbox.style.accentColor = '#9B9B9B'
    checkbox.checked = this.checked
    return checkbox
  }
}

const toggleCheckboxEffect = StateEffect.define<{
  pos: number
  checked: boolean
}>({
  map: (val, mapping) => ({
    pos: mapping.mapPos(val.pos),
    checked: val.checked
  })
})

const checkboxState = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.of([new CheckboxMarker(false).range(0)])
  },
  update(set, transaction) {
    set = set.map(transaction.changes)

    transaction.changes.iterChanges((from, to) => {
      // 라인 추가 시, 체크박스 추가
      if (from === to) {
        set = set.update({
          add: [new CheckboxMarker(false).range(to + 1)]
        })
      }
      // 라인 삭제 시, 체크박스 삭제 및 그 뒤의 체크박스를 1칸씩 당김
      else {
        for (const e of transaction.effects) {
          if (e.is(toggleCheckboxEffect)) {
            if (e.value.checked) {
              set = set.update({
                add: [new CheckboxMarker(true).range(e.value.pos)]
              })
            } else {
              set = set.update({ filter: (from) => from !== e.value.pos })
            }
          }
        }
      }
    })
    // 체크박스 클릭 시, 체크박스 상태 변경
    for (const e of transaction.effects) {
      if (e.is(toggleCheckboxEffect)) {
        set = set.update({
          filter: (from) => from !== e.value.pos,
          add: [new CheckboxMarker(e.value.checked).range(e.value.pos)]
        })
      }
    }
    return set
  }
})

function toggleCheckbox(view: EditorView, pos: number) {
  const checkboxes = view.state.field(checkboxState)
  let isChecked = false

  checkboxes.between(pos, pos, (_from, _to, value) => {
    if (value instanceof CheckboxMarker) {
      isChecked = value.checked
    }
  })

  view.dispatch({
    effects: toggleCheckboxEffect.of({ pos, checked: !isChecked })
  })
}

export const checkboxGutter = [
  checkboxState,
  gutter({
    class: 'cm-checkbox-gutter',
    markers: (v) => v.state.field(checkboxState),
    initialSpacer: () => new CheckboxMarker(),
    domEventHandlers: {
      mousedown(view, line) {
        toggleCheckbox(view, line.from)
        return true
      }
    }
  })
]
