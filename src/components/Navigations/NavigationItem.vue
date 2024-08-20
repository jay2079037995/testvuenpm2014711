<template>
    <div 
      class="editable-element"
      ref="navigationRef"
      :id="`editable-element-nav`"
    >
      <component
        :is="currentNavigationComponent"
        :contextmenus="contextmenus"
      ></component>
    </div>
  </template>
  
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElementTypes, type PPTElement } from '@/types/slides'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
  
import useLockElement from '@/hooks/useLockElement'
import useDeleteElement from '@/hooks/useDeleteElement'
import useCombineElement from '@/hooks/useCombineElement'
import useOrderElement from '@/hooks/useOrderElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useCopyAndPasteElement from '@/hooks/useCopyAndPasteElement'
import useSelectAllElement from '@/hooks/useSelectAllElement'

import { ElementOrderCommands, ElementAlignCommands } from '@/types/edit'

import ImageElement from '@/views/components/element/ImageElement/index.vue'
import TextElement from '@/views/components/element/TextElement/index.vue'
import ShapeElement from '@/views/components/element/ShapeElement/index.vue'
import LineElement from '@/views/components/element/LineElement/index.vue'
import ChartElement from '@/views/components/element/ChartElement/index.vue'
import TableElement from '@/views/components/element/TableElement/index.vue'
import LatexElement from '@/views/components/element/LatexElement/index.vue'
import VideoElement from '@/views/components/element/VideoElement/index.vue'
import AudioElement from '@/views/components/element/AudioElement/index.vue'
// import EditorHeader from '@/views/Editor/EditorHeader/index.vue'
// import EditorHeader from '@/components/Navigations/NavigationMenu.vue'

const props = defineProps<{
    isMultiSelect: boolean
    openLinkDialog: () => void
}>()
  
  
const currentNavigationComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ElementTypes.IMAGE]: ImageElement,
    [ElementTypes.TEXT]: TextElement,
    [ElementTypes.SHAPE]: ShapeElement,
    [ElementTypes.LINE]: LineElement,
    [ElementTypes.CHART]: ChartElement,
    [ElementTypes.TABLE]: TableElement,
    [ElementTypes.LATEX]: LatexElement,
    [ElementTypes.VIDEO]: VideoElement,
    [ElementTypes.AUDIO]: AudioElement,
  }
  // return elementTypeMap[ElementTypes.TEXT] || null
  return null
})
  
const { orderElement } = useOrderElement()
const { alignElementToCanvas } = useAlignElementToCanvas()
const { combineElements, uncombineElements } = useCombineElement()
const { deleteElement } = useDeleteElement()
const { lockElement, unlockElement } = useLockElement()
const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement()
const { selectAllElement } = useSelectAllElement()
  
const contextmenus = (): ContextmenuItem[] => {
  return [
    {
      text: '剪切',
      subText: 'Ctrl + X',
      handler: cutElement,
    },
    {
      text: '复制',
      subText: 'Ctrl + C',
      handler: copyElement,
    },
    {
      text: '粘贴',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    { divider: true },
    {
      text: '水平居中',
      handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
      children: [
        { text: '水平垂直居中', handler: () => alignElementToCanvas(ElementAlignCommands.CENTER), },
        { text: '水平居中', handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL) },
        { text: '左对齐', handler: () => alignElementToCanvas(ElementAlignCommands.LEFT) },
        { text: '右对齐', handler: () => alignElementToCanvas(ElementAlignCommands.RIGHT) },
      ],
    },
    {
      text: '垂直居中',
      handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
      children: [
        { text: '水平垂直居中', handler: () => alignElementToCanvas(ElementAlignCommands.CENTER) },
        { text: '垂直居中', handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL) },
        { text: '顶部对齐', handler: () => alignElementToCanvas(ElementAlignCommands.TOP) },
        { text: '底部对齐', handler: () => alignElementToCanvas(ElementAlignCommands.BOTTOM) },
      ],
    },
    { divider: true },
    {
      text: '设置链接',
      handler: props.openLinkDialog,
    },
    {
      text: '全选',
      subText: 'Ctrl + A',
      handler: selectAllElement,
    },
    {
      text: '锁定',
      subText: 'Ctrl + L',
      handler: lockElement,
    },
    {
      text: '删除',
      subText: 'Delete',
      handler: deleteElement,
    },
  ]
}
</script>