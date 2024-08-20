import type { LinePoint } from '@/types/slides'
import i18n from '@/assets/locales/index'

export interface LinePoolItem {
  path: string
  style: 'solid' | 'dashed'
  points: [LinePoint, LinePoint]
  isBroken?: boolean
  isCurve?: boolean
  isCubic?: boolean
}

interface PresetLine {
  type: string
  children: LinePoolItem[]
}

export const LINE_LIST: PresetLine[] = [
  {
    type: i18n.global.t('canvasTool.straightLine'),
    children: [
      { path: 'M 0 0 L 20 20', style: 'solid', points: ['', ''] },
      { path: 'M 0 0 L 20 20', style: 'dashed', points: ['', ''] },
      { path: 'M 0 0 L 20 20', style: 'solid', points: ['', 'arrow'] },
      { path: 'M 0 0 L 20 20', style: 'dashed', points: ['', 'arrow'] },
      { path: 'M 0 0 L 20 20', style: 'solid', points: ['', 'dot'] },
    ],
  },
  {
    type: i18n.global.t('canvasTool.polylineCurve'),
    children: [
      { path: 'M 0 0 L 0 20 L 20 20', style: 'solid', points: ['', 'arrow'], isBroken: true },
      { path: 'M 0 0 Q 0 20 20 20', style: 'solid', points: ['', 'arrow'], isCurve: true },
      { path: 'M 0 0 C 20 0 0 20 20 20', style: 'solid', points: ['', 'arrow'], isCubic: true },
    ],
  },
]