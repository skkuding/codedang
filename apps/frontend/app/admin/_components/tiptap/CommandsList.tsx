import type { Range } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import type { KeyboardEvent } from 'react'
import React, { Component } from 'react'

export interface CommandItem {
  title: string
  command: (options: { editor: Editor; range: Range }) => void
  element?: React.ReactNode
}

export interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
  editor: Editor
}

interface CommandListState {
  selectedIndex: number
}

class CommandList extends Component<CommandListProps, CommandListState> {
  state: CommandListState = {
    selectedIndex: 0
  }

  componentDidUpdate(prevProps: CommandListProps) {
    if (this.props.items !== prevProps.items) {
      this.setState({
        selectedIndex: 0
      })
    }
  }

  public onKeyDown({ event }: { event: KeyboardEvent }): boolean {
    if (event.key === 'ArrowUp') {
      this.upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      this.downHandler()
      return true
    }

    if (event.key === 'Enter') {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.setState((prevState, props) => ({
      selectedIndex:
        (prevState.selectedIndex + props.items.length - 1) % props.items.length
    }))
  }

  downHandler() {
    this.setState((prevState, props) => ({
      selectedIndex: (prevState.selectedIndex + 1) % props.items.length
    }))
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex)
  }

  selectItem(index: number) {
    const item = this.props.items[index]

    if (item) {
      this.props.command(item)
    }
  }

  render() {
    const { items } = this.props

    return (
      <div className="items">
        {items.map((item, index) => (
          <button
            className={`item ${index === this.state.selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => this.selectItem(index)}
          >
            {item.element || item.title}
          </button>
        ))}
      </div>
    )
  }
}

export { CommandList }
