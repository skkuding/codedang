import { vi } from 'vitest'

vi.mock('@/public/icons/blueprint-create-edit.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/blueprint-create-help.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/arrow-bottom-thin.svg', () => ({ default: () => null }))
vi.mock('@/public/icons/arrow-top.svg', () => ({ default: () => null }))
vi.mock('@/public/icons/blueprint-create-link.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/blueprint-create-bullet.svg', () => ({
  default: () => null
}))
