import { Button } from '@/components/shadcn/button'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FaPlus } from 'react-icons/fa6'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'slate',
        'filter'
      ]
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon']
    }
  }
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default'
  }
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
      <Button {...args} variant="slate">
        Slate
      </Button>
      <Button {...args} variant="filter">
        Filter
      </Button>
    </div>
  )
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="icon">
        <FaPlus />
      </Button>
    </div>
  )
}
