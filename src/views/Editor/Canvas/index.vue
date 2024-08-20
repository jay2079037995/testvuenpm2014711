<template>
  <div 
    class="canvas" 
    ref="canvasRef"
    :style="{
      // border: '1px solid #0f0',
    }"
    @wheel="$event => handleMousewheelCanvas($event)"
    @mousedown="$event => handleClickBlankArea($event)"
    @dblclick="$event => handleDblClick($event)"
    v-contextmenu="contextmenus"
    v-click-outside="removeEditorAreaFocus"
  >
    <ElementCreateSelection
      v-if="creatingElement"
      @created="data => insertElementFromCreateSelection(data)"
    />
    <ShapeCreateCanvas
      v-if="creatingCustomShape"
      @created="data => insertCustomShape(data)"
    />

    
    <div
      ref="scrollContainer"
      class="viewport-scroll-container"
      :style="{
            left: '0px',
            position: 'absolute',
            width: '100%',
            height: '100%',
            // border: '1px solid #f00',
            'overflow-y': 'auto',
      }"
      @scroll="handleScroll"
      @wheel.prevent="$event => handleMousewheelThumbnails($event)"
    >
    <div 
    :style="{
      position: 'absolute',
      left: viewportStyles.left + 'px',
      width: (viewportStyles.width) * canvasScale + 'px',
    }">
    <div
          class="viewport-page"
          v-for="(page) in allSlide"
          :key="page.id"
          :style="{
            // width: viewportStyles.width * canvasScale + 'px',
            height: (viewportStyles.height)* canvasScale + 'px',
            // left: viewportStyles.left + 'px',
            // top: viewportStyles.top + 'px',
            marginTop: '30px', // 设置上方间隔为 10px
            overflow: page.id === currentSlide?.id ? 'visible' : 'hidden',
          }"
        >
    <div class="operates"
      v-if="getPageShowIf(page.id, scrollTop)"
      :style="{
        position: 'relative',
      }"
    >
        <div
        v-if="page.id === currentSlide?.id">
        <AlignmentLine 
          v-for="(line, index) in alignmentLines" 
          :key="index" 
          :type="line.type" 
          :axis="line.axis" 
          :length="line.length"
          :canvasScale="canvasScale"
        />
        <MultiSelectOperate 
          v-if="activeElementIdList.length > 1"
          :elementList="elementList"
          :scaleMultiElement="scaleMultiElement"
        />
        <Operate
          v-for="element in elementList" 
          :key="element.id"
          :elementInfo="element"
          :isSelected="activeElementIdList.includes(element.id)"
          :isActive="handleElementId === element.id"
          :isActiveGroupElement="activeGroupElementId === element.id"
          :isMultiSelect="activeElementIdList.length > 1"
          :rotateElement="rotateElement"
          :scaleElement="scaleElement"
          :openLinkDialog="openLinkDialog"
          :dragLineElement="dragLineElement"
          :dragElement="dragElement"
          :moveShapeKeypoint="moveShapeKeypoint"
          v-show="!hiddenElementIdList.includes(element.id)"
        />  
        </div>

        
        <div
        :style="{
          position: 'absolute',
          overflow:  'hidden',
          width: viewportStyles.width * canvasScale + 'px',
          height: (viewportStyles.height)* canvasScale + 'px',
          'border-radius': '8px', /* 设置圆角大小 */
          'box-shadow': '0 0 15px 0 rgba(0, 0, 0, 0.1)',
          border: page.id === currentSlide?.id ? '1px solid #2aba8a' : '',
        }">
          <ViewportBackground 
          @mousedown="selectSlide(page.id)"
          :slide="page"/>
        </div>
        
      </div>
      <div
      ref="viewportRefs"
      :pageId="page.id">
          <div
          v-if="getPageShowIf(page.id, scrollPosition)"
          :style="{
            'transform-origin': 'top left',
            transform: `scale(${canvasScale})`,
            position: 'relative',
            // 'clip-path': 'rect(0 0 500px 500px)',
            zIndex: `${page.id === currentSlide?.id ? 1 : 0}`
          }"
          >
          
          <MouseSelection 
            v-if="mouseSelectionVisible"
            :top="mouseSelection.top" 
            :left="mouseSelection.left" 
            :width="mouseSelection.width" 
            :height="mouseSelection.height" 
            :quadrant="mouseSelectionQuadrant"
          />
            
            <div
              v-for="(element, index) in (page.id === currentSlide?.id ? elementList : page.elements)" 
              :key="element.id"
              :style="{
                position: 'absolute',
                width: viewportStyles.width + 'px',
                height: viewportStyles.height + 'px',
                'border-radius': '8px', /* 设置圆角大小 */
                overflow: activeElementIdList.includes(element.id) ? 'visible' : 'hidden',
                'pointer-events': 'none'
              }"
            >
              <EditableElement 
                :style="{
                  'pointer-events': 'auto'
                }"
                :elementInfo="element"
                :elementIndex="index + 1"
                :pageId="page.id"
                :isMultiSelect="activeElementIdList.length > 1"
                :selectElement="selectElement"
                :openLinkDialog="openLinkDialog"
                v-show="!hiddenElementIdList.includes(element.id)"
              />
            </div>

            
            <div
                v-if="page.id === currentSlide?.id">
              <ElementEditorBorder
                v-for="(element) in elementList" 
                :key="element.id"
                :elementInfo="element"
                :slideInfo="currentSlide"
              />
            </div>
          </div>
        </div>
        </div> 
    </div> 

    <div class="drag-mask" v-if="spaceKeyState"></div>
  
      <Ruler :viewportStyles="viewportStyles" v-if="showRuler" />
  
      <Modal
        v-model:visible="linkDialogVisible" 
        :width="540"
      >
        <LinkDialog @close="linkDialogVisible = false" />
      </Modal>
    </div>
    </div>
  </template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, provide, ref, watch, watchEffect, computed } from 'vue'
import { throttle } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore, useKeyboardStore, useAIBotStore } from '@/store'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import type { PPTElement, PPTShapeElement, Slide } from '@/types/slides'
import type { AlignmentLineProps, CreateCustomShapeData } from '@/types/edit'
import { injectKeySlideScale } from '@/types/injectKey'
import { removeAllRanges } from '@/utils/selection'
import { KEYS } from '@/configs/hotkey'

import useViewportSize from './hooks/useViewportSize'
import useMouseSelection from './hooks/useMouseSelection'
import useDropImageOrText from './hooks/useDropImageOrText'
import useRotateElement from './hooks/useRotateElement'
import useScaleElement from './hooks/useScaleElement'
import useSelectElement from './hooks/useSelectElement'
import useDragElement from './hooks/useDragElement'
import useDragLineElement from './hooks/useDragLineElement'
import useMoveShapeKeypoint from './hooks/useMoveShapeKeypoint'
import useInsertFromCreateSelection from './hooks/useInsertFromCreateSelection'

import useDeleteElement from '@/hooks/useDeleteElement'
import useCopyAndPasteElement from '@/hooks/useCopyAndPasteElement'
import useSelectAllElement from '@/hooks/useSelectAllElement'
import useScaleCanvas from '@/hooks/useScaleCanvas'
import useScreening from '@/hooks/useScreening'
import useSlideHandler from '@/hooks/useSlideHandler'
import useCreateElement from '@/hooks/useCreateElement'

import EditableElement from './EditableElement.vue'
import MouseSelection from './MouseSelection.vue'
import ElementEditorBorder from './Operate/ElementEditorBorder.vue'
import ViewportBackground from './ViewportBackground.vue'
import AlignmentLine from './AlignmentLine.vue' 
import Ruler from './Ruler.vue'
import ElementCreateSelection from './ElementCreateSelection.vue'
import ShapeCreateCanvas from './ShapeCreateCanvas.vue'
import MultiSelectOperate from './Operate/MultiSelectOperate.vue'
import Operate from './Operate/index.vue'
import LinkDialog from './LinkDialog.vue'
import Modal from '@/components/Modal.vue'
import i18n from '@/assets/locales/index'


const aiBotStore = useAIBotStore()
const { aiBotVisible } = storeToRefs(aiBotStore)

const mainStore = useMainStore()
const {
  activeElementIdList,
  activeGroupElementId,
  handleElementId,
  hiddenElementIdList,
  editorAreaFocus,
  gridLineSize,
  showRuler,
  creatingElement,
  creatingCustomShape,
  canvasScale,
  textFormatPainter,
} = storeToRefs(mainStore)
const slidesStore = useSlidesStore()
const { currentSlide, allSlide, slideIndex, pageScrollTop, pageSrollPercent, mainScrollTop } = storeToRefs(slidesStore)
const { ctrlKeyState, spaceKeyState } = storeToRefs(useKeyboardStore())

const viewportRef = ref<HTMLElement>()
const viewportRefs = ref<HTMLElement>()
const alignmentLines = ref<AlignmentLineProps[]>([])

const linkDialogVisible = ref(false)
const openLinkDialog = () => linkDialogVisible.value = true
const scrollPosition = ref(0)

let recordMainScrollTop = 0

watch(handleElementId, () => {
  mainStore.setActiveGroupElementId('')
})
const elementList = ref<PPTElement[]>([])
const setLocalElementList = () => {
  elementList.value = currentSlide.value ? JSON.parse(JSON.stringify(currentSlide.value.elements)) : []
}
watchEffect(setLocalElementList)

const canvasRef = ref<HTMLElement>()
const { dragViewport, viewportStyles } = useViewportSize(canvasRef)

useDropImageOrText(canvasRef)

const { mouseSelection, mouseSelectionVisible, mouseSelectionQuadrant, updateMouseSelection } = useMouseSelection(elementList, viewportRef)

const { dragElement } = useDragElement(elementList, alignmentLines, canvasScale, viewportStyles)
const { dragLineElement } = useDragLineElement(elementList)
const { selectElement } = useSelectElement(elementList, dragElement)
const { scaleElement, scaleMultiElement } = useScaleElement(elementList, alignmentLines, canvasScale)
const { rotateElement } = useRotateElement(elementList, viewportRef, canvasScale)
const { moveShapeKeypoint } = useMoveShapeKeypoint(elementList, canvasScale)

const { selectAllElement } = useSelectAllElement()
const { deleteAllElements } = useDeleteElement()
const { pasteElement } = useCopyAndPasteElement()
const { enterScreeningFromStart } = useScreening()
const { updateSlideIndex } = useSlideHandler()
const { createTextElement, createShapeElement } = useCreateElement()


const scrollTop = ref(0)
const scrollHeight = ref(0)
const scrollClient = ref(0)
let playFrame = true

// 组件渲染时，如果存在元素焦点，需要清除
// 这种情况存在于：有焦点元素的情况下进入了放映模式，再退出时，需要清除原先的焦点（因为可能已经切换了页面）
onMounted(() => {
  if (activeElementIdList.value.length) {
    nextTick(() => mainStore.setActiveElementIdList([]))
  }
  scrollPosition.value = (scrollContainer as any).value.scrollTop
})

onMounted(() => {
  console.log('onInit')
  playFrame = true
  const onFrame = () => {
    if (!playFrame) return
    if (viewportRefs.value && currentSlide.value) {
      (viewportRefs.value as any).forEach((v:any) => {
        if (v.attributes.pageid.value === currentSlide.value?.id) {
          viewportRef.value = v
        }
      })
    }
    if ((scrollContainer as any).value) {
      if (mainScrollTop.value !== recordMainScrollTop) {
        (scrollContainer as any).value.scrollTop = mainScrollTop.value * (scrollContainer as any).value.scrollHeight
        recordMainScrollTop = mainScrollTop.value
      }
      if (scrollHeight.value !== (scrollContainer as any).value.scrollHeight) {
        scrollHeight.value = (scrollContainer as any).value.scrollHeight
      }
      if (scrollClient.value !== (scrollContainer as any).value.clientHeight) {
        scrollClient.value = (scrollContainer as any).value.clientHeight
      }
      if (scrollTop.value !== null && scrollTop.value !== (scrollContainer as any).value.scrollTop) {
        scrollTop.value = (scrollContainer as any).value.scrollTop
        // console.log('scroll:', scrollTop.value, scrollClient.value, scrollHeight.value)
      }
      pageSrollPercent.value = scrollClient.value / scrollHeight.value
      pageScrollTop.value = scrollTop.value / scrollHeight.value
    }
    requestAnimationFrame(onFrame)
  }
  requestAnimationFrame(onFrame)
})

onUnmounted(() => {
  playFrame = false
  // console.log('onDispose')
})

const selectSlide = (pageId:string) => {
  const pageIndex = slidesStore.getSlideIndexById(pageId)
  // changeWithSlideIndex = false
  slidesStore.updateSlideIndex(pageIndex)
}


const getPageShowIf = (pageId:string, pos:number):boolean => {
  let ret = false
  const index = slidesStore.getSlideIndexById(pageId)
  if (!(scrollContainer as any).value || !scrollHeight.value || !scrollClient.value || scrollHeight.value <= scrollClient.value) {
    ret = true
  }
  else {
    const length = allSlide.value.length as any
    const itemHeight = (((scrollContainer as any).value.scrollHeight + 30) / length) as any
    const showHeight = (scrollContainer as any).value.clientHeight
    if (youhua) {
      if ((index - 1) * itemHeight < pos + showHeight && (index + 2 ) * itemHeight > pos) {
        ret = true
      }
      else {
        ret = false
      }
    }
    else {
      if (index * itemHeight < pos + showHeight && (index + 1 ) * itemHeight > pos) {
        ret = true
      }
      else {
        ret = false
      }
    }
  }
  // console.warn('getPageShowIf', index, ret, pageId)\
  // ret = true
  return ret
}

const handleScroll = () => {
  if (!scrollContainer.value) return
  scrollPosition.value = (scrollContainer as any).value.scrollTop
  const length = allSlide.value.length as any
  const itemHeight = (((scrollContainer as any).value.scrollHeight + 30) / length) as any
  const showHeight = (scrollContainer as any).value.clientHeight
  let min = 1000000000
  let minIndex = slideIndex.value
  for (let i = 0; i < length; i++) {
    const gap = Math.abs((i + 0.5) * itemHeight - (scrollPosition.value + showHeight / 2 ))
    if (gap < min) {
      min = gap
      minIndex = i
    }
  }
  // if (minIndex !== slideIndex.value) {
  //   // console.log('change slected index', minIndex)
  //   changeWithSlideIndex = false
  //   slidesStore.updateSlideIndex(minIndex)
  // }
  // if ((index - 1) * itemHeight < pos + showHeight && (index + 2 ) * itemHeight > pos) {
}

let moveScrollToIntervalCall:any
let getScrollEndY:any

const moveScrollTo = (end: number) => {
  moveScrollToIntervalCall && moveScrollToIntervalCall()
  moveScrollToIntervalCall = null
  const start = (scrollContainer as any).value.scrollTop
  const maxTime = 250
  let play = true
  const startTime = Date.now()
  moveScrollToIntervalCall = () => {
    play = false
  }
  getScrollEndY = () => {
    return end
  }
  const onFrame = () => {
    if (!play) return
    const nowTime = Date.now()
    let t = nowTime - startTime
    if (nowTime - startTime > maxTime) {
      t = maxTime
    }
    t = t / maxTime
    if (t > 0) {
      t = t * 1.0
    }
    (scrollContainer as any).value.scrollTop = start + Math.sin(t * (0.5 * Math.PI)) * (end - start)
    scrollPosition.value = (scrollContainer as any).value.scrollTop
    if (nowTime - startTime >= maxTime) {
      (scrollContainer as any).value.scrollTop = end
      scrollPosition.value = (scrollContainer as any).value.scrollTop
      clearInterval(moveScrollToIntervalCall)
      moveScrollToIntervalCall = null
    } 
    else {
      requestAnimationFrame(onFrame)
    }
  }
  requestAnimationFrame(onFrame)
}

const handleMousewheelThumbnails = (e: WheelEvent) => {
  // console.log('滚动 ', e.deltaY)
  // console.log((scrollContainer as any).value.clientHeight, (scrollContainer as any).value.scrollHeight, (scrollContainer as any).value.scrollTop)
  if (moveScrollToIntervalCall) {
    moveScrollTo(getScrollEndY() + e.deltaY * 1)
  }
  else {
    moveScrollTo((scrollContainer as any).value.scrollTop + e.deltaY * 1)
  }
}

const youhua = false

const scrollContainer = ref<HTMLElement>()

const ifShowElement2 = (page:any, pos:number, element:any):boolean => {
  if (!youhua) {
    return true
  }
  let ret = false
  const index = slidesStore.getSlideIndexById(page.id)
  if (!(scrollContainer as any).value || !scrollHeight.value || !scrollClient.value || scrollHeight.value <= scrollClient.value) {
    ret = true
  }
  else {
    const length = allSlide.value.length as any
    const itemHeight = (((scrollContainer as any).value.scrollHeight + 30) / length) as any
    const showHeight = (scrollContainer as any).value.clientHeight
    if ((index - 1) * itemHeight < pos + showHeight && (index + 2 ) * itemHeight > pos) {
      if (index * itemHeight < pos + showHeight && (index + 1) * itemHeight > pos) {
        ret = true
      }
      else {
        if (index * itemHeight >= pos + showHeight) {
          // 下面
          if (index * itemHeight + element.top < pos + showHeight) {
            ret = true
          }
          else {
            ret = false
          }
        }
        else {
          // 上面
          if ((index + 1 ) * itemHeight + element.top > pos) {
            ret = true
          }
          else {
            ret = false
          }
        }
        // console.log('???', index)
      }
      // ret = true
    }
    else {
      ret = false
    }
  }
  return ret
}


let changeWithSlideIndex = true

watch(slideIndex, () => {
  if (!changeWithSlideIndex) {
    changeWithSlideIndex = true
    return
  }
  setTimeout(() => {
    console.log('change slide index:', activeElementIdList.value)
    // console.log((scrollContainer as any).value.clientHeight, (scrollContainer as any).value.scrollHeight, (scrollContainer as any).value.scrollTop)
    if (activeElementIdList.value.length) return
    if ((scrollContainer as any).value.clientHeight < (scrollContainer as any).value.scrollHeight) {
      const length = allSlide.value.length as any
      const itemHeight = (((scrollContainer as any).value.scrollHeight + 30) / length) as any
      // (scrollContainer as any).value.scrollTop = itemHeight * slideIndex.value
      moveScrollTo(itemHeight * slideIndex.value)
    }
  })
  // console.log(slideIndex.value, (scrollContainer as any).value.clientHeight, (scrollContainer as any).value.scrollTop, (scrollContainer as any).value.scrollHeight)
})

// 点击画布的空白区域：清空焦点元素、设置画布焦点、清除文字选区、清空格式刷状态
const handleClickBlankArea = (e: MouseEvent) => {
  if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])

  if (!spaceKeyState.value) updateMouseSelection(e)
  else dragViewport(e)

  if (!editorAreaFocus.value) mainStore.setEditorareaFocus(true)
  if (textFormatPainter.value) mainStore.setTextFormatPainter(null)
  removeAllRanges()
}

// 双击空白处插入文本
const handleDblClick = (e: MouseEvent) => {
  if (activeElementIdList.value.length || creatingElement.value || creatingCustomShape.value) return
  if (!viewportRef.value) return

  const viewportRect = viewportRef.value.getBoundingClientRect()
  const left = (e.pageX - viewportRect.x) / canvasScale.value
  const top = (e.pageY - viewportRect.y) / canvasScale.value

  createTextElement({
    left,
    top,
    width: 200 / canvasScale.value, // 除以 canvasScale 是为了与点击选区创建的形式保持相同的宽度
    height: 0,
  })
}

// 画布注销时清空格式刷状态
onUnmounted(() => {
  if (textFormatPainter.value) mainStore.setTextFormatPainter(null)
})

// 移除画布编辑区域焦点
const removeEditorAreaFocus = () => {
  if (editorAreaFocus.value) mainStore.setEditorareaFocus(false)
}

// 滚动鼠标
const { scaleCanvas } = useScaleCanvas()
const throttleScaleCanvas = throttle(scaleCanvas, 100, { leading: true, trailing: false })
const throttleUpdateSlideIndex = throttle(updateSlideIndex, 300, { leading: true, trailing: false })

const handleMousewheelCanvas = (e: WheelEvent) => {
  e.preventDefault()

  // 按住Ctrl键时：缩放画布
  if (ctrlKeyState.value) {
    if (e.deltaY > 0) throttleScaleCanvas('-')
    else if (e.deltaY < 0) throttleScaleCanvas('+')
  }
  // 上下翻页 
  else {
    // 屏蔽滚轮翻页，用滚轮控制内容翻动
    // if (e.deltaY > 0) throttleUpdateSlideIndex(KEYS.DOWN)
    // else if (e.deltaY < 0) throttleUpdateSlideIndex(KEYS.UP)
  }
}

// 开关标尺
const toggleRuler = () => {
  mainStore.setRulerState(!showRuler.value)
}

// 在鼠标绘制的范围插入元素
const { insertElementFromCreateSelection, formatCreateSelection } = useInsertFromCreateSelection(viewportRef, viewportStyles)

// 插入自定义任意多边形
const insertCustomShape = (data: CreateCustomShapeData) => {
  const {
    start,
    end,
    path,
    viewBox,
  } = data
  const position = formatCreateSelection({ start, end })
  if (position) {
    const supplement: Partial<PPTShapeElement> = {}
    if (data.fill) supplement.fill = data.fill
    if (data.outline) supplement.outline = data.outline
    createShapeElement(position, { path, viewBox }, supplement)
  }

  mainStore.setCreatingCustomShapeState(false)
}

const contextmenus = (): ContextmenuItem[] => {
  return [
    {
      text: i18n.global.t('edit.paste'),
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    {
      text: i18n.global.t('edit.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllElement,
    },
    {
      text: i18n.global.t('edit.ruler'),
      subText: showRuler.value ? '√' : '',
      handler: toggleRuler,
    },
    {
      text: i18n.global.t('edit.gridlines'),
      handler: () => mainStore.setGridLineSize(gridLineSize.value ? 0 : 50),
      children: [
        {
          text: i18n.global.t('link.linkTargetNone'),
          subText: gridLineSize.value === 0 ? '√' : '',
          handler: () => mainStore.setGridLineSize(0),
        },
        {
          text: i18n.global.t('edit.small'),
          subText: gridLineSize.value === 25 ? '√' : '',
          handler: () => mainStore.setGridLineSize(25),
        },
        {
          text: i18n.global.t('edit.medium'),
          subText: gridLineSize.value === 50 ? '√' : '',
          handler: () => mainStore.setGridLineSize(50),
        },
        {
          text: i18n.global.t('edit.big'),
          subText: gridLineSize.value === 100 ? '√' : '',
          handler: () => mainStore.setGridLineSize(100),
        },
      ],
    },
    {
      text: i18n.global.t('edit.resetCurrentPage'),
      handler: deleteAllElements,
    },
    { divider: true },
    {
      text: i18n.global.t('slideShow.enterScreeningFromStart'),
      subText: 'F5',
      handler: enterScreeningFromStart,
    },
    /* { divider: true },
    {
      text: i18n.global.t('edit.openAiBox'),
      handler: () => aiBotStore.setAIBotState(true),
    }, */
  ]
}

provide(injectKeySlideScale, canvasScale)
</script>

<style lang="scss" scoped>
.canvas {
  height: 100%;
  user-select: none;
  overflow: hidden;
  background-color: $lightGray;
  position: relative;
}
.drag-mask {
  cursor: grab;
  @include absolute-0();
}
.viewport-wrapper {
  position: absolute;
  border: 1px solid #ddd; /* 设置边框样式 */
  border-radius: 8px; /* 设置圆角大小 */
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
}
/* 隐藏滚动条本身 */
.viewport-scroll-container::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
}

/* 兼容 Firefox 浏览器 */
.viewport-scroll-container {
  scrollbar-width: none; /* 隐藏滚动条 */
}
// 滚动条
.viewport-scroll-container::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.viewport-scroll-container::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  height: 100px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  // background: #E5E5E5;
  background: #aaa;
}
.viewport-scroll-container::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ffffff;
}
.viewport-page {
  border-radius: 8px; /* 设置圆角大小 */
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
}
.viewport {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
.viewport-list-page {
  border: 1px solid #ddd; /* 设置边框样式 */
  border-radius: 8px; /* 设置圆角大小 */
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
}
.top-layer {
  z-index: 9999; /* 设置一个较大的z-index值，确保在最上层显示 */
}
</style>