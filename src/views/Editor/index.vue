<template>
  <div class="GenerativePPT-editor">
  
  <div class="scroll-content-parent">
    <div 
    ref="scrollContent" 
    class="scroll-content"
      @scroll="handleScroll"
      @mousedown="startDrag"
      @mouseup="endDrag"
    >
      <div :style="{
        'pointer-events': 'none', /* 设置点击穿透 */
        width: '0px',
        height: pageHeight / pageSrollPercent + 'px'
      }"><br>
      </div>
    </div>
  </div>
  <div
  :style="{
    position:'absolute',
    right: '20px'
  }">
      fps:{{fps}}
  </div>
    <!-- 顶部状态栏 -->
    <EditorHeader class="layout-header" />
    <!-- ppt 字体 插入  -->
    <div class="canvas-wrap">
      <CanvasTool class="center-top" />
    </div>
    <div :style="{
      position:'absolute',
      width: '100%',
      'z-index': 9,
      'pointer-events': 'none',
      height: '100%',
    }" class="tool-content">
      <Thumbnails class="layout-content-left" />
      <!-- 右侧工具栏 -->
      <Toolbar class="layout-content-right"
      :style="{
         height: 'calc(100% - 160px)',
        //  border: '1px solid #c00',
      }"/>
    </div>
    <div class="layout-content">
      <!-- 左侧浏览栏 -->
      <div class="layout-content-center">
        <!-- ppt 内容 -->
        <!-- <Canvas class="center-body" :style="{ height: `calc(100% - ${remarkHeight}px)` }" /> -->
        <Canvas class="center-body" />
        <!-- 点击输入演讲者备注 -->
        <!-- <Remark
          class="center-bottom" 
          v-model:height="remarkHeight" 
          :style="{ height: `${remarkHeight}px` }"
        /> -->

        <!-- AI 机器人对话框  -->
      </div>
    </div>
  </div>

  <SelectPanel v-if="showSelectPanel" />
  <SearchPanel v-if="showSearchPanel" />

  <Modal
    :visible="!!dialogForExport" 
    :width="680"
    @closed="closeExportDialog()"
  >
    <ExportDialog />
  </Modal>

  <Modal
    :visible="!!createDocumentState" 
    :width="780"
    @closed="closeCreateDocument()"
  >
    <CreateDocument />
  </Modal>

</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useAIBotStore, useSlidesStore } from '@/store'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import usePasteEvent from '@/hooks/usePasteEvent'

import EditorHeader from './EditorHeader/index.vue'
import Canvas from './Canvas/index.vue'
import CanvasTool from './CanvasTool/index.vue'
import Thumbnails from './Thumbnails/index.vue'
import Toolbar from './Toolbar/index.vue'
// import Remark from './Remark/index.vue'
import ExportDialog from './ExportDialog/index.vue'
// import CreateDocument from './AICreateSelect/index.vue'
import CreateDocument from './AICreateSelect/AiCreateSelectType.vue'
import SelectPanel from './SelectPanel.vue'
import SearchPanel from './SearchPanel.vue'
import Modal from '@/components/Modal.vue'
import AIbot from './AIbot/index.vue'


const scrollContent = ref<HTMLElement>()
const aiBotStore = useAIBotStore()
const { aiBotVisible } = storeToRefs(aiBotStore)

const slidesStore = useSlidesStore()
const { pageScrollTop, pageSrollPercent, mainScrollTop } = storeToRefs(slidesStore)
const mainStore = useMainStore()
const { dialogForExport, showSelectPanel, showSearchPanel, createDocumentState} = storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')
const closeCreateDocument = () => mainStore.setCreateDocumentState(false)
const pageHeight = ref(0)

// const remarkHeight = ref(40)

const aiBotHeight = ref(98)

const fps = ref(0)
let isDrag = false
let playFrame = true

onMounted(() => {
  let frame = 0
  let lastTime = Date.now()
  playFrame = true
  const nextFrame = () => {
    if (!playFrame) return
    pageHeight.value = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    if (scrollContent.value) {
      if (!isDrag) {
        const to = Math.floor(pageScrollTop.value * pageHeight.value / pageSrollPercent.value)
        if (scrollContent.value.scrollTop !== to) {
          scrollContent.value.scrollTop = to
        }
      }
    }
    frame++
    const nowTime = Date.now()
    if (nowTime - lastTime > 1000) {
      fps.value = ~~(frame * 1000 / (nowTime - lastTime))
      lastTime = nowTime
      frame = 0
    }
    requestAnimationFrame(nextFrame)
  }
  requestAnimationFrame(nextFrame)
})


onUnmounted(() => {
  playFrame = false
  // console.log('onDispose')
})


const handleScroll = () => {
  if (isDrag && scrollContent.value) {
    mainScrollTop.value = scrollContent.value.scrollTop / scrollContent.value.scrollHeight
  }
}
const startDrag = () => {
  isDrag = true
}
const endDrag = () => {
  isDrag = false
}

useGlobalHotkey()
usePasteEvent()
</script>

<style lang="scss" scoped>
.scroll-content-parent {
  position: absolute; /* 设置相对定位 */
  right: 0%;
  width: 15px;
  height: 100%;
  z-index: 1;
  // background-color: red
}
.scroll-content {
  width: 100%; /* 宽度占满整个页面 */
  max-height: 100vh; /* 设置最大高度为视窗高度，超出部分出现滚动条 */
  overflow-y: auto; /* 垂直滚动条 */
  position: relative; /* 设置相对定位 */
}

// 滚动条
.scroll-content::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.scroll-content::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  height: 100px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  // background: #E5E5E5;
  background: #aaa;
}
.scroll-content::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ffffff;
}
.GenerativePPT-editor {
  height: 100%;
  background-color: #f9fbfd;
}
.layout-header {
  height: 60px;
}
.layout-content {
  height: calc(100vh - 60px - 54px);
  display: flex;
}
.layout-content-left {
  // width: 160px;
  // height: 100%;
  width: 200px;
  flex-shrink: 0;
  pointer-events: auto;
}
.layout-content-center {
  // width: calc(100% - 160px - 260px);
  // right:-20%;
  flex: 1;
  position: relative;
}
.canvas-wrap {
  height: 54px;
  display: flex;
  align-items: center;
  .center-top {
    width: 100%;
    height: 40px;
  }
}
.layout-content-right {
  // width: 260px;
  top: 0px;
  position: absolute;
  right: 0%;
  pointer-events: auto;
}

.center-body {
  height: calc(100% - 0px);
}
</style>