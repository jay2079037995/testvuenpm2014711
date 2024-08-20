<template>
  <div 
    class="editable-element"
    ref="elementRef"
    :id="`editable-element-${elementInfo.id}`"
    :style="{
      zIndex: elementIndex,
    }"
  >
    <component
      :is="currentElementComponent"
      :elementInfo="elementInfo"
      :pageId="pageId"
      :selectElement="selectElement"
      :contextmenus="contextmenus"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
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
import i18n from '@/assets/locales/index'

const props = defineProps<{
  pageId:string
  elementInfo: PPTElement
  elementIndex: number
  isMultiSelect: boolean
  selectElement: (e: MouseEvent | TouchEvent, element: PPTElement, canMove?: boolean) => void
  openLinkDialog: () => void
}>()

const currentElementComponent = computed<unknown>(() => {
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
  return elementTypeMap[props.elementInfo.type] || null
})

const { orderElement } = useOrderElement()
const { alignElementToCanvas } = useAlignElementToCanvas()
const { combineElements, uncombineElements } = useCombineElement()
const { deleteElement } = useDeleteElement()
const { lockElement, unlockElement } = useLockElement()
const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement()
const { selectAllElement } = useSelectAllElement()

const contextmenus = (): ContextmenuItem[] => {
  if (props.elementInfo.lock) {
    return [{
      text: i18n.global.t('edit.unLock'),
      handler: () => unlockElement(props.elementInfo),
    }]
  }

  return [
    {
      text: i18n.global.t('edit.cut'),
      subText: 'Ctrl + X',
      handler: cutElement,
    },
    {
      text: i18n.global.t('edit.copy'),
      subText: 'Ctrl + C',
      handler: copyElement,
    },
    {
      text: i18n.global.t('edit.paste'),
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    { divider: true },
    {
      text: i18n.global.t('panel.horizontally'),
      handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
      children: [
        { text: i18n.global.t('panel.horizontalVerticalCenter'), handler: () => alignElementToCanvas(ElementAlignCommands.CENTER), },
        { text: i18n.global.t('panel.horizontally'), handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL) },
        { text: i18n.global.t('panel.leftAligned'), handler: () => alignElementToCanvas(ElementAlignCommands.LEFT) },
        { text: i18n.global.t('panel.rightAligned'), handler: () => alignElementToCanvas(ElementAlignCommands.RIGHT) },
      ],
    },
    {
      text: i18n.global.t('panel.verticalCenter'),
      handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
      children: [
        { text: i18n.global.t('panel.horizontalVerticalCenter'), handler: () => alignElementToCanvas(ElementAlignCommands.CENTER) },
        { text: i18n.global.t('panel.verticalCenter'), handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL) },
        { text: i18n.global.t('panel.topAlign'), handler: () => alignElementToCanvas(ElementAlignCommands.TOP) },
        { text: i18n.global.t('panel.bottomAlign'), handler: () => alignElementToCanvas(ElementAlignCommands.BOTTOM) },
      ],
    },
    { divider: true },
    {
      text: i18n.global.t('panel.bringTop'),
      disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => orderElement(props.elementInfo, ElementOrderCommands.TOP),
      children: [
        { text: i18n.global.t('panel.bringTop'), handler: () => orderElement(props.elementInfo, ElementOrderCommands.TOP) },
        { text: i18n.global.t('panel.moveUpOneLayer'), handler: () => orderElement(props.elementInfo, ElementOrderCommands.UP) },
      ],
    },
    {
      text: i18n.global.t('panel.placedBottom'),
      disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => orderElement(props.elementInfo, ElementOrderCommands.BOTTOM),
      children: [
        { text: i18n.global.t('panel.placedBottom'), handler: () => orderElement(props.elementInfo, ElementOrderCommands.BOTTOM) },
        { text: i18n.global.t('panel.moveDownOneLayer'), handler: () => orderElement(props.elementInfo, ElementOrderCommands.DOWN) },
      ],
    },
    { divider: true },
    {
      text: i18n.global.t('edit.setLink'),
      handler: props.openLinkDialog,
    },
    {
      text: props.elementInfo.groupId ? i18n.global.t('panel.unGroup') : i18n.global.t('canvasTool.group'),
      subText: 'Ctrl + G',
      handler: props.elementInfo.groupId ? uncombineElements : combineElements,
      hide: !props.isMultiSelect,
    },
    {
      text: i18n.global.t('edit.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllElement,
    },
    {
      text: i18n.global.t('edit.lock'),
      subText: 'Ctrl + L',
      handler: lockElement,
    },
    {
      text: i18n.global.t('edit.delete'),
      subText: 'Delete',
      handler: deleteElement,
    },
  ]
}
</script>