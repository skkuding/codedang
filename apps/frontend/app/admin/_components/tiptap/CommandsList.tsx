import { cn } from '@/libs/utils'
import type { Range } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import type { KeyboardEvent } from 'react'
import React, { Component } from 'react'

export interface CommandItem {
  title: string
  icon: StaticImageData
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

  handleMouseEnter(index: number) {
    this.setState({ selectedIndex: index })
  }

  render() {
    const { items } = this.props

    if (!items || items.length === 0) {
      return null
    }

    return (
      <div className="text-body4_r_14 relative overflow-hidden rounded border border-gray-200 bg-white p-1 text-black shadow-lg">
        {items.map((item, index) => (
          <button
            className={cn(
              'flex h-9 w-36 items-center rounded border-none bg-transparent py-0.5 pl-1 text-left',
              index === this.state.selectedIndex && 'bg-gray-100'
            )}
            key={index}
            onClick={() => this.selectItem(index)}
            onMouseEnter={() => this.handleMouseEnter(index)}
          >
            <div className="flex h-9 w-9 items-center justify-center">
              <Image src={item.icon} alt={item.title} className="h-4 w-4" />
            </div>
            {item.element || item.title}
          </button>
        ))}
      </div>
    )
  }
}

export { CommandList }
