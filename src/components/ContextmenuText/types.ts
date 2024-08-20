export interface ContextmenuItem {
  text?: string
  subText?: string
  divider?: boolean
  disable?: boolean
  hide?: boolean
  children?: ContextmenuItem[]
  handler?: (el: HTMLElement) => void
  icon?: string
}

export interface Axis {
  x: number
  y: number
}