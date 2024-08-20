<template>
  <div class="navigation">
    <div class="navigation-menu">
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('navigation.new')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.open')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.recent')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('export')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.print')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.save')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.rename')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToFilePage()">{{$t('navigation.file')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('canvasTool.undo')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('canvasTool.redo')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('edit.copy')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('edit.cut')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('edit.paste')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('edit.selectAll')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToEditPage()">{{$t('navigation.edit')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('navigation.search')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.search')}}</PopoverMenuItem> 
        </template>
        <div class="toolbar-text" @click="goToFilePage()">{{$t('navigation.view')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('canvasTool.insertImage')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('canvasTool.insertAudio')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToEditPage()">{{$t('navigation.insert')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('navigation.format')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.format')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToFilePage()">{{$t('navigation.format')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('edit.createSlide')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('edit.copyAndPasteSlide')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('edit.deleteSlide')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToEditPage()">{{$t('navigation.slide')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('navigation.rotate')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('navigation.flip')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToFilePage()">{{$t('navigation.sort')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('slidePlayStart')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('slidePlayCurrent')}}</PopoverMenuItem>
        </template>
        <div class="toolbar-text" @click="goToEditPage()">{{$t('navigation.tool')}}</div>
      </Popover>
      <Popover trigger="click" placement="bottom-start">
        <template #content>
          <PopoverMenuItem>{{$t('feedback')}}</PopoverMenuItem>
          <PopoverMenuItem>{{$t('commonProblem')}}</PopoverMenuItem>
          
        </template>
        <div class="toolbar-text" @click="goToFilePage()">{{$t('navigation.help')}}</div>
      </Popover>
    </div>
  </div>

  <div 
    class="viewport" 
    ref="viewportRef"
    :style="{ transform: `scale(${canvasScale})` }"
  >      
    <NavigationItem
      :isMultiSelect="false"
      :openLinkDialog="openLinkDialog"
      v-show="showAIList"
    />
  </div>
</template>
   
<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { throttle } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore, useKeyboardStore, useAIBotStore } from '@/store'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import LayoutPool from './LayoutPool.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'

import useLockElement from '@/hooks/useLockElement'
import useDeleteElement from '@/hooks/useDeleteElement'
import useCombineElement from '@/hooks/useCombineElement'
import useOrderElement from '@/hooks/useOrderElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useCopyAndPasteElement from '@/hooks/useCopyAndPasteElement'
import useSelectAllElement from '@/hooks/useSelectAllElement'

const { orderElement } = useOrderElement()
const { alignElementToCanvas } = useAlignElementToCanvas()
const { combineElements, uncombineElements } = useCombineElement()
const { deleteElement } = useDeleteElement()
const { lockElement, unlockElement } = useLockElement()
const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement()
const { selectAllElement } = useSelectAllElement()


import { ElementAlignCommands } from '@/types/edit'


const navigationRef = ref<HTMLInputElement>()

const linkDialogVisible = ref(false)
const openLinkDialog = () => linkDialogVisible.value = true

const showAIList = ref(false)


const mainStore = useMainStore()
const {
  canvasScale,
} = storeToRefs(mainStore)

import NavigationItem from './NavigationItem.vue'

const emit = defineEmits<{
  (event: 'click'): void
}>()

const goToFilePage = () => {
//   emit('click')
  showAIList.value = true
}

const goToEditPage = () => {
//   emit('click')
  showAIList.value = false
}

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
   
<style lang="scss" scoped>
.navigation {
  /* 样式属性 */
}
.navigation-menu {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.toolbar-text {
  height: 100%;
  font-size: 13px;
  margin-right: 10px;
  margin-left: 2px;
  text-align: center;
  color: $secondColor;
  cursor: pointer;

  @include ellipsis-oneline();

  &:hover {
    background-color: #f1f1f1;
  }
}
.viewport {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}

.menu {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.menu-item {
  position: relative;
  display: inline-block;
}

.submenu,
.subsubmenu {
  position: absolute;
  top: 100%;
  left: 0;
  display: none;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.submenu-item,
.subsubmenu-item {
  display: block;
}

/* 显示子菜单 */
.menu-item:hover > .submenu {
  display: flex;
  flex-direction: column;
}

.submenu-item:hover > .subsubmenu {
  display: flex;
  flex-direction: column;
  left: 100%;
  top: 0;
}
</style>