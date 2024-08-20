<template>
  <div 
  :style="{
    position: rootPosition
  }">
    <div
      class="thumbnails"
      @mousedown="() => setThumbnailsFocus(true)"
      v-click-outside="() => setThumbnailsFocus(false)"
      v-contextmenu="contextmenusThumbnails"
      ref="resizable"
      :style="{
        '--basic-width': basicWidth,
        '--basic-height': basicHeight,
        '--card-max-height': cardMaxHeight,
        '--list-max-height': listMaxHeight
      }"
    >
      <div class="content" ref="contentRef">
        <div class="show-area">
          <div class="toggle">
            <div
              class="vector"
              :class="{ select: showType === 'card' }"
              @click="toggleType('card')"
            >
              <svg-icon icon="card" color="#202124" size="16" />
            </div>
            <div
              class="vector"
              :class="{ select: showType === 'list' }"
              @click="toggleType('list')"
            >
              <svg-icon icon="list" color="#202124" size="16" />
            </div>
          </div>
        </div>
        <div class="operate-area">
          <div
            class="vector"
            @click="toggleOperateType('ai')"
            :class="{ select: showOperateType === 'ai' }"
          >
            <svg-icon icon="auto" color="#202124" size="14" />
          </div>
          <Popover
            trigger="click"
            placement="bottom-start"
            v-model:value="presetLayoutPopoverVisible"
            :offset="offset"
            center
          >
            <template #content>
              <!-- <LayoutPoolCollection
                @select="
                  (slide) => {
                    needYJS
                      ? readyToCreateTemplate(slide)
                      : createSlideByTemplate(slide)
                    presetLayoutPopoverVisible = false
                  }
                "
              /> -->
              <PPTXTemplateVue @select="
                  (slide) => {
                    needYJS
                      ? readyToCreateTemplate(slide)
                      : createSlideByTemplate(slide)
                    presetLayoutPopoverVisible = false
                  }
                "
                @closeDialog="handleCloseDialog"
              />
            </template>
            <div
              class="vector"
              @click="toggleOperateType('add')"
              :class="{ select: showOperateType === 'add' }"
            >
              <svg-icon icon="add" color="#202124" size="14" />
            </div>
          </Popover>
        </div>
        <Draggable
          class="thumbnail-list card-max-height"
          ref="thumbnailsCardRef"
          :modelValue="slides"
          :animation="200"
          :scroll="true"
          :scrollSensitivity="50"
          @end="handleDragEnd"
          itemKey="id"
          v-if="showType === 'card'"
        >
          <template #item="{ element, index }">
            <div
              class="thumbnail-item"
              :class="{
                active: slideIndex === index,
                selected: selectedSlidesIndex.includes(index)
              }"
              ref="cardRef"
              @mousedown="($event) => handleClickSlideThumbnail($event, index)"
              @dblclick="enterScreening()"
              v-contextmenu="contextmenusThumbnailItem"
              v-show="showType === 'card'"
            >
              <div class="card-label">
                {{ index + 1 }}
              </div>
              <ThumbnailSlide
                class="thumbnail"
                :slide="element"
                :size="basicSize"
                :visible="index < slidesLoadLimit"
                v-if="
                  getPageShowIf(index, scrollTop, scrollHeight, scrollClient)
                "
              />
              <div class="thumbnail-editor-list-parent">
                <div class="thumbnail-editor-list">
                  <div
                    class="thumbnail-editor-item"
                    v-for="(item, index) in element.editors"
                    v-bind:key="index"
                    :style="{
                      'background-color': `rgba(${~~(
                        item.color /
                        (255 * 255)
                      )}, ${~~((item.color % (255 * 255)) / 255)}, ${
                        item.color % 255
                      }, 0.75)`
                    }"
                  >
                    {{ item.uuid[0] }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Draggable>
        <Draggable
          class="thumbnail-list list-max-height"
          ref="thumbnailsListRef"
          :modelValue="slides"
          :animation="200"
          :scroll="true"
          :scrollSensitivity="50"
          @end="handleDragEnd"
          itemKey="id"
          v-if="showType === 'list'"
        >
          <template #item="{ element, index }">
            <div
              class="thumbnail-list-item"
              :class="{
                active: slideIndex === index
              }"
              @mousedown="($event) => handleClickSlideThumbnail($event, index)"
              @dblclick="enterScreening()"
              @mouseenter="enterText(index)"
              @mouseleave="leaveText"
              v-contextmenu="contextmenusThumbnailItem"
            >
              <div
                class="list-label"
                :class="{
                  'label-active': slideIndex === index
                }"
              >
                <svg-icon
                  name="svg-icon1"
                  v-show="mouseCurrent === index && slideIndex !== index"
                  icon="drag"
                  size="10"
                />
                <svg-icon
                  name="svg-icon2"
                  v-show="mouseCurrent === index && slideIndex === index"
                  icon="drag-green"
                  size="10"
                />
                <span v-show="mouseCurrent !== index">
                  {{ index + 1 }}
                </span>
              </div>
              <div
                class="list-title"
                :class="{
                  'title-active': slideIndex === index
                }"
              >
                {{ getElementTitle(element) }}
              </div>
            </div>
          </template>
        </Draggable>
      </div>
      <div class="resizer" @mousedown="initResize">
        <div class="link"></div>
      </div>
      <!-- <div class="page-number">
          {{
            $t('pageNumberPPTXSlide', {
              index: slideIndex + 1,
              total: slides.length
            })
          }}
        </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store'
import { fillDigit } from '@/utils/common'
import { isElementInViewport } from '@/utils/element'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import useSlideHandler from '@/hooks/useSlideHandler'
import useScreening from '@/hooks/useScreening'
import useLoadSlides from '@/hooks/useLoadSlides'
import { debounce } from 'lodash'

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'
import PPTXTemplateVue from './Template/index.vue'
import LayoutPoolCollection from './LayoutPoolCollection.vue'
import Popover from '@/components/Popover.vue'
import Draggable from 'vuedraggable'

import { useI18n } from 'vue-i18n'
import { needYJS } from '@/utils/yjs-init'
import type { Slide, PPTElement, PPTTextElement } from '@/types/slides'

const { t } = useI18n()
const slidesStore = useSlidesStore()
const { allSlide } = storeToRefs(slidesStore)

const scrollTop = ref(0)
const scrollHeight = ref(0)
const scrollClient = ref(0)
const rootPosition = ref('rootPosition')
let playFrame = true

const getPageShowIf = (
  pageIndex: number,
  pos: number,
  height: number,
  client: number
): boolean => {
  let ret = false
  const index = pageIndex
  if (
    !(thumbnailsCardRef as any).value ||
    !scrollHeight.value ||
    !scrollClient.value ||
    scrollHeight.value <= scrollClient.value
  ) {
    ret = true
  } 
  else {
    const length = allSlide.value.length as any
    const itemHeight = ((height + 10) / length) as any
    const showHeight = client
    if (
      index * itemHeight < pos + showHeight &&
      (index + 1) * itemHeight > pos
    ) {
      ret = true
    } 
    else {
      ret = false
    }
  }
  // console.warn('getPageShowIf', index, ret, pageId)\
  // ret = true
  return ret
}

onMounted(() => {
  // console.log('onInit')
  window.addEventListener('resize', handleResize)
  handleResize()
  playFrame = true
  const onFrame = () => {
    if (!playFrame) return
    if (
      (thumbnailsCardRef as any).value &&
      (thumbnailsCardRef as any).value.targetDomElement
    ) {
      if (
        scrollHeight.value !==
        (thumbnailsCardRef as any).value.targetDomElement.scrollHeight
      ) {
        scrollHeight.value = (
          thumbnailsCardRef as any
        ).value.targetDomElement.scrollHeight
      }
      if (
        scrollClient.value !==
        (thumbnailsCardRef as any).value.targetDomElement.clientHeight
      ) {
        scrollClient.value = (
          thumbnailsCardRef as any
        ).value.targetDomElement.clientHeight
      }
      if (
        scrollTop.value !==
        (thumbnailsCardRef as any).value.targetDomElement.scrollTop
      ) {
        scrollTop.value = (
          thumbnailsCardRef as any
        ).value.targetDomElement.scrollTop
        // console.log('scroll:', scrollTop.value, scrollClient.value, scrollHeight.value)
      }
    }
    // if (!isAutoScrolling) {
    //   checkCurrentSlideInScroll()
    // }
    requestAnimationFrame(onFrame)
  }
  requestAnimationFrame(onFrame)
})

onUnmounted(() => {
  playFrame = false
  window.removeEventListener('resize', handleResize)
  // console.log('onDispose')
})

const mainStore = useMainStore()
const keyboardStore = useKeyboardStore()
const { selectedSlidesIndex: _selectedSlidesIndex, thumbnailsFocus } =
  storeToRefs(mainStore)
const { slides, slideIndex } = storeToRefs(slidesStore)
const { ctrlKeyState, shiftKeyState } = storeToRefs(keyboardStore)

const { slidesLoadLimit } = useLoadSlides()

const selectedSlidesIndex = computed(() => [
  ..._selectedSlidesIndex.value,
  slideIndex.value
])

const presetLayoutPopoverVisible = ref(false)

const offset = ref([85, -35])

const handleCloseDialog = (isClose: boolean) => {
  presetLayoutPopoverVisible.value = !isClose
}

const {
  copySlide,
  pasteSlide,
  createSlide,
  createSlideByTemplate,
  readyToCreateTemplate,
  copyAndPasteSlide,
  deleteSlide,
  cutSlide,
  selectAllSlide,
  sortSlides
} = useSlideHandler()

// let isAutoScrolling = false

// 页面被切换时
const thumbnailsCardRef = ref<InstanceType<typeof Draggable>>()
const thumbnailsListRef = ref<InstanceType<typeof Draggable>>()
watch(
  () => slideIndex.value,
  () => {
    // 清除多选状态的幻灯片
    if (selectedSlidesIndex.value.length) {
      mainStore.updateSelectedSlidesIndex([])
    }

    // 检查当前页缩略图是否在可视范围，不在的话需要滚动到对应的位置
    nextTick(checkCurrentSlideInScroll)
  }
)

const checkCurrentSlideInScroll = () => {
  const activeThumbnailRef: HTMLElement = showType.value === 'card' ? thumbnailsCardRef.value?.$el?.querySelector('.thumbnail-item.active') : thumbnailsListRef.value?.$el?.querySelector('.thumbnail-list-item.active')
  if (
    (thumbnailsCardRef.value &&
    activeThumbnailRef &&
    !isElementInViewport(
      activeThumbnailRef,
      thumbnailsCardRef.value.$el
    )) ||
    (thumbnailsListRef.value &&
    activeThumbnailRef &&
    !isElementInViewport(activeThumbnailRef, thumbnailsListRef.value.$el))
  ) {
    if (thumbnailsCardRef.value) {
      const elementRect = activeThumbnailRef.getBoundingClientRect()
      const parentRect = thumbnailsCardRef.value.$el.getBoundingClientRect()
      const elementMid = elementRect.top + elementRect.height / 2
      const parentMid = parentRect.top + parentRect.height / 2
      const offsetTop = elementMid - parentMid
      // console.log('offsetTop:', offsetTop)
      let end = thumbnailsCardRef.value.$el.scrollTop + offsetTop
      if (end > thumbnailsCardRef.value.$el.scrollHeight - thumbnailsCardRef.value.$el.clientHeight) {
        end = thumbnailsCardRef.value.$el.scrollHeight - thumbnailsCardRef.value.$el.clientHeight
      }
      if (end < 0) {
        end = 0
      }
      // thumbnailsCardRef.value.$el.scrollTop = end
      moveScrollTo(end, thumbnailsCardRef.value.$el)
    }
    if (thumbnailsListRef.value) {
      const elementRect = activeThumbnailRef.getBoundingClientRect()
      const parentRect = thumbnailsListRef.value.$el.getBoundingClientRect()
      const elementMid = elementRect.top + elementRect.height / 2
      const parentMid = parentRect.top + parentRect.height / 2
      const offsetTop = elementMid - parentMid
      // console.log('offsetTop:', offsetTop)
      let end = thumbnailsListRef.value.$el.scrollTop + offsetTop
      if (end > thumbnailsListRef.value.$el.scrollHeight - thumbnailsListRef.value.$el.clientHeight) {
        end = thumbnailsListRef.value.$el.scrollHeight - thumbnailsListRef.value.$el.clientHeight
      }
      if (end < 0) {
        end = 0
      }
      // thumbnailsCardRef.value.$el.scrollTop = end
      moveScrollTo(end, thumbnailsListRef.value.$el)
    }
    // setTimeout(() => {
    //   isAutoScrolling = true
    //   activeThumbnailRef.scrollIntoView({
    //     block: 'center',
    //     behavior: 'smooth'
    //   })
    //   setTimeout(() => {
    //     isAutoScrolling = false
    //   }, 400)
    // }, 100)
  }
}

let moveScrollToIntervalCall:any
let getScrollEndY:any

const moveScrollTo = (end: number, target:any) => {
  moveScrollToIntervalCall && moveScrollToIntervalCall()
  moveScrollToIntervalCall = null
  const start = target.scrollTop
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
    target.scrollTop = start + Math.sin(t * (0.5 * Math.PI)) * (end - start)
    if (nowTime - startTime >= maxTime) {
      target.scrollTop = end
      clearInterval(moveScrollToIntervalCall)
      moveScrollToIntervalCall = null
    } 
    else {
      requestAnimationFrame(onFrame)
    }
  }
  requestAnimationFrame(onFrame)
}

// 切换页面
const changeSlideIndex = (index: number) => {
  mainStore.setActiveElementIdList([])

  if (slideIndex.value === index) return
  slidesStore.updateSlideIndex(index)
}

const getElementTitle = (element: any): string => {
  const elements = (element as Slide).elements
  if (elements.length > 0) {
    const texts = elements.filter(
      (element: PPTElement) => element.type === 'text'
    )
    const textWithTitleType = texts.find((element: PPTElement) => {
      return (
        element.type === 'text' &&
        (element.content.includes("_type='title'") ||
          element.content.includes('_type="title"'))
      )
    })

    if (textWithTitleType) {
      return processHTML((textWithTitleType as PPTTextElement).content)
    }

    const textWithSubTitleType = texts.find((element: PPTElement) => {
      return (
        element.type === 'text' &&
        (element.content.includes("_type='subTitle'") ||
          element.content.includes('_type="subTitle"'))
      )
    })

    if (textWithSubTitleType) {
      return processHTML((textWithSubTitleType as PPTTextElement).content)
    }

    const textWithCtrTitleType = texts.find((element: PPTElement) => {
      return (
        element.type === 'text' &&
        (element.content.includes("_type='ctrTitle'") ||
          element.content.includes('_type="ctrTitle"'))
      )
    })

    if (textWithCtrTitleType) {
      return processHTML((textWithCtrTitleType as PPTTextElement).content)
    }

    const textWithBodyType = texts.find((element: PPTElement) => {
      return (
        element.type === 'text' &&
        (element.content.includes("_type='body'") ||
          element.content.includes('_type="body"'))
      )
    })

    if (textWithBodyType) {
      return processHTML((textWithBodyType as PPTTextElement).content)
    }

    const textWithBoxType = texts.find((element: PPTElement) => {
      return (
        element.type === 'text' &&
        (element.content.includes("_type='textBox'") ||
          element.content.includes('_type="textBox"'))
      )
    })

    if (textWithBoxType) {
      return processHTML((textWithBoxType as PPTTextElement).content)
    }

    const textWithObjType = texts.find((element: PPTElement) => {
      return (
        element.type === 'text' &&
        (element.content.includes("_type='obj'") ||
          element.content.includes('_type="obj"'))
      )
    })

    if (textWithObjType) {
      return processHTML((textWithObjType as PPTTextElement).content)
    }
  }
  return 'Untitled'
}

const processHTML = (html: string): string => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const textContent = tempDiv.textContent || ''
  // textContent = textContent.trim();
  // if (textContent.length > 10) {
  //   textContent = textContent.substring(0, 10) + '...'
  // }
  return textContent
}

// 点击缩略图
const handleClickSlideThumbnail = (e: MouseEvent, index: number) => {
  const isMultiSelected = selectedSlidesIndex.value.length > 1

  if (
    isMultiSelected &&
    selectedSlidesIndex.value.includes(index) &&
    e.button !== 0
  ) return

  // 按住Ctrl键，点选幻灯片，再次点击已选中的页面则取消选中
  // 如果被取消选中的页面刚好是当前激活页面，则需要从其他被选中的页面中选择第一个作为当前激活页面
  if (ctrlKeyState.value) {
    if (slideIndex.value === index) {
      if (!isMultiSelected) return

      const newSelectedSlidesIndex = selectedSlidesIndex.value.filter(
        (item) => item !== index
      )
      mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      changeSlideIndex(selectedSlidesIndex.value[0])
    } 
    else {
      if (selectedSlidesIndex.value.includes(index)) {
        const newSelectedSlidesIndex = selectedSlidesIndex.value.filter(
          (item) => item !== index
        )
        mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      } 
      else {
        const newSelectedSlidesIndex = [...selectedSlidesIndex.value, index]
        mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      }
    }
  }
  // 按住Shift键，选择范围内的全部幻灯片
  else if (shiftKeyState.value) {
    if (slideIndex.value === index && !isMultiSelected) return

    let minIndex = Math.min(...selectedSlidesIndex.value)
    let maxIndex = index

    if (index < minIndex) {
      maxIndex = Math.max(...selectedSlidesIndex.value)
      minIndex = index
    }

    const newSelectedSlidesIndex = []
    for (let i = minIndex; i <= maxIndex; i++) newSelectedSlidesIndex.push(i)
    mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
  }
  // 正常切换页面
  else {
    mainStore.updateSelectedSlidesIndex([])
    changeSlideIndex(index)
  }
}

// 设置缩略图工具栏聚焦状态（只有聚焦状态下，该部分的快捷键才能生效）
const setThumbnailsFocus = (focus: boolean) => {
  if (thumbnailsFocus.value === focus) return
  mainStore.setThumbnailsFocus(focus)

  if (!focus) mainStore.updateSelectedSlidesIndex([])
}

// 拖拽调整顺序后进行数据的同步
const handleDragEnd = (eventData: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = eventData
  if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) return
  sortSlides(newIndex, oldIndex)
}

const { enterScreening, enterScreeningFromStart } = useScreening()

const contextmenusThumbnails = (): ContextmenuItem[] => {
  return [
    {
      text: t('edit.paste'),
      subText: 'Ctrl + V',
      handler: pasteSlide
    },
    {
      text: t('edit.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllSlide
    },
    {
      text: t('edit.createSlide'),
      subText: 'Enter',
      handler: createSlide
    },
    {
      text: t('slideShow.enterScreeningFromStart'),
      subText: 'F5',
      handler: enterScreeningFromStart
    }
  ]
}

const contextmenusThumbnailItem = (): ContextmenuItem[] => {
  return [
    {
      text: t('edit.cut'),
      subText: 'Ctrl + X',
      handler: cutSlide
    },
    {
      text: t('edit.copy'),
      subText: 'Ctrl + C',
      handler: copySlide
    },
    {
      text: t('edit.paste'),
      subText: 'Ctrl + V',
      handler: pasteSlide
    },
    {
      text: t('edit.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllSlide
    },
    { divider: true },
    {
      text: t('edit.createSlide'),
      subText: 'Enter',
      handler: createSlide
    },
    {
      text: t('edit.copyAndPasteSlide'),
      subText: 'Ctrl + D',
      handler: copyAndPasteSlide
    },
    {
      text: t('edit.deleteSlide'),
      subText: 'Delete',
      handler: () => deleteSlide()
    },
    {
      text: t('canvasTool.redo'),
      subText: 'Redo',
      handler: () => deleteSlide()
    },
    { divider: true },
    {
      text: t('slideShow.enterScreening'),
      subText: 'Shift + F5',
      handler: enterScreening
    }
  ]
}

const showType = ref('card')
// 切换展示效果
const toggleType = (type: string) => {
  showType.value = type
  resizeHeight()
}

const showOperateType = ref('add')
// 切换展示效果
const toggleOperateType = (type: string) => {
  showOperateType.value = type
}

const mouseCurrent = ref()
const enterText = (index: number) => {
  mouseCurrent.value = index
  // console.log('enterText', mouseCurrent.value)
}

const leaveText = () => {
  mouseCurrent.value = null
  // console.log('leaveText', mouseCurrent.value)
}

let startX: number
let startWidth: number
const resizable = ref()
const minWidth = 88 // 最小宽度
const maxWidth = 190 // 最大宽度
const initWidth = 149
const basicWidth = ref(1)
const basicHeight = ref(1)

const initResize = (e: any) => {
  startX = e.clientX
  startWidth = resizable.value.offsetWidth
  document.body.style.userSelect = 'none' 
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', stopResize)
}

const resizeObserver = (window as any).ResizeObserver
;(window as any).ResizeObserver = class ResizeObserver extends resizeObserver {
  constructor(callback: (...args: any[]) => void) {
    callback = debounce(callback, 100)
    super(callback)
  }
}

const handleResize = () => {
  nextTick(() => {
    const width = window.innerWidth
    rootPosition.value = 'static'
    if (width < 1000) {
      resizable.value.classList.add('show')
      resizable.value.style.width = initWidth + 'px'
      resizable.value.style.left = `-177px`
      basicHeight.value = basicWidth.value = 1
      rootPosition.value = 'absolute'
    } 
    else {
      const hasShowClass = resizable.value.classList.contains('show')
      if (hasShowClass) {
        resizable.value.style.width = initWidth + 'px'
        resizable.value.style.left = '0px'
        resizable.value.classList.remove('show')
        basicHeight.value = basicWidth.value = 1
      }
    }
    
    resizeHeightByWindow()
  })
}

const resize = (e: any) => {
  const currentX = e.clientX
  const newWidth = startWidth + (currentX - startX)
  rootPosition.value = 'static'
  if (newWidth < minWidth) {
    resizable.value.style.width = minWidth + 'px'
    resizable.value.style.left = `-116px`
    resizable.value.style.transition = `all 200ms cubic-bezier(0.075, 0.82, 0.165, 1)`
    resizable.value.classList.add('show') // 添加 show 类
    rootPosition.value = 'absolute'
  } 
  else if (newWidth > maxWidth) {
    resizable.value.style.width = maxWidth + 'px'
    resizable.value.style.left = '0px' // 确保left为0
    resizable.value.style.transition = 'none'
    resizable.value.classList.remove('show')
  } 
  else {
    resizable.value.style.width = newWidth + 'px'
    resizable.value.style.left = '0px' // 重置left为0
    resizable.value.style.transition = 'none'
    resizable.value.classList.remove('show')
  }
  basicHeight.value = basicWidth.value = resizable.value.offsetWidth / initWidth
//   changeCardHeight()
}

const basicSize = computed(() => 149 * basicWidth.value - 24)

const stopResize = () => {
  document.body.style.userSelect = '' // 恢复文本选择
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
}

const contentRef = ref()
const cardRef = ref()
const mastShowCard = 6 // 最多展示卡片的数量
const mastShowItem = 8 // 最多展示条目的数量
const listNumber = ref(5)
const cardNumber = ref(5)
const cardHeight = ref(79)
const listHeight = ref(28)

const cardMaxHeight = computed(() => {
  return cardNumber.value * cardHeight.value + cardNumber.value * 6 + 4 + 'px'
})

watch(
  () => slides.value,
  () => {
    nextTick(() => {
      changeCardHeight()
    })
  }
)

const changeCardHeight = debounce(function() {
  cardHeight.value = cardRef.value?.clientHeight ?? 79
  resizeHeight()
}, 100)

const listMaxHeight = computed(
  () => listNumber.value * listHeight.value + (listNumber.value + 1) * 4 + 'px'
)

const resizeHeight = () => {
  nextTick(() => {
    const innerHeight = window.innerHeight
    const { height, top } = contentRef.value.getBoundingClientRect()
    const contentHeaderHeight = 100
    const canUseHeight = innerHeight - top - contentHeaderHeight
    if (showType.value === 'card') {
      cardNumber.value = Math.floor((canUseHeight - 4) / (cardHeight.value + 6))
      cardNumber.value = cardNumber.value < 1 ? 1 : cardNumber.value
      cardNumber.value =
        cardNumber.value > mastShowCard ? mastShowCard : cardNumber.value
    } 
    else {
      listNumber.value = Math.floor((canUseHeight - 4) / (listHeight.value + 4))
      listNumber.value = listNumber.value < 1 ? 1 : listNumber.value
      listNumber.value =
        listNumber.value > mastShowItem ? mastShowItem : listNumber.value
    }
  })
}

const resizeHeightByWindow = () => {
  nextTick(() => {
    const innerHeight = window.innerHeight
    const { height, top } = contentRef.value.getBoundingClientRect()
    const contentHeaderHeight = 100
    const canUseHeight = innerHeight - top - contentHeaderHeight
    if (showType.value === 'card') {
      cardNumber.value = Math.floor((canUseHeight - 4) / (cardHeight.value + 6))
      // cardNumber.value = cardNumber.value < 1 ? 1 : cardNumber.value
      cardNumber.value =
        cardNumber.value > mastShowCard ? mastShowCard : cardNumber.value
    } 
    else {
      listNumber.value = Math.floor((canUseHeight - 4) / (listHeight.value + 4))
      // listNumber.value = listNumber.value < 1 ? 1 : listNumber.value
      listNumber.value =
        listNumber.value > mastShowItem ? mastShowItem : listNumber.value
    }
  })
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 4px;
  height: 0;
}

@keyframes narrow {
  0% {
    height: 79px;
  }
  100% {
    height: 28px;
  }
}

@keyframes enlarge {
  0% {
    transform: translateY(-30px) scaleY(0.4);
  }
  100% {
    transform: translateY(0px) scaleY(1);
  }
}

@function calcWidth($number) {
  @return calc($number * var(--basic-width));
}

@function calcHeight($number) {
  @return calc($number * var(--basic-height));
}

.thumbnails {
  margin-top: 20px;
  border-radius: 8px;
  border: 1px solid #dbdbdb;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  margin: 30px 32px 0 24px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  .content {
    width: calcWidth(149px);
    display: flex;
    flex-direction: column;
    user-select: none;
    align-items: center;
    padding: 0 10px;
    .show-area {
      width: 100%;
      margin: 6px 0;
      .toggle {
        width: 72px;
        height: 26px;
        border-radius: 4px;
        background: #ebebeb;
        display: flex;
        justify-content: center;
        align-items: center;
        .vector {
          width: 34px;
          height: 22px;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          &.select {
            background: #fff;
          }
        }
      }
    }
    .operate-area {
      width: 100%;
      height: 30px;
      border-radius: 6px;
      border: 1px solid #dbdbdb;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 4px;
      :deep(.popover) {
        flex: 1;
      }
      .vector {
        flex: 1;
        height: 30px;
        border-radius: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        &.select {
          background: #effffa;
          border: 1px solid #a0e7cf;
          border-radius: 6px;
          margin: -1px;
        }
      }
    }

    .thumbnail-list {
      overflow: auto;
      padding-top: 4px;
      margin: 0 auto;
    }

    .list-max-height {
      max-height: var(--list-max-height);
      width: 100%;
      padding-top: 0;
      .thumbnail-list-item {
        height: 28px;
        border-radius: 4px;
        animation: narrow 0.3s linear;
        border: 1px solid #dbdbdb;
        // outline: 1px solid #dbdbdb;
        margin: 4px 0;
        display: flex;
        align-items: center;
        overflow: hidden;
        &.active {
          border-color: $themeColor;
        }
        .list-label {
          width: 22px;
          height: 28px;
          // border-radius: 6px 0px 0px 6px;
          background: #dbdbdb;
          font-size: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          cursor: pointer;
          &.label-active {
            background: #effffa;
            color: $themeColor;
          }
        }
        .list-title {
          // height: 28px;
          //   overflow: hidden;
          overflow: hidden;
          // border-radius: 0px 6px 6px 0px;
          text-overflow: ellipsis;
          // border: 1px solid #dbdbdb;
          border-left: 1px solid #dbdbdb;
          white-space: nowrap;
          width: 100%;
          height: 28px;
          line-height: 28px;
          text-align: center;
          font-size: 12px;
          padding: 0 8px;
          cursor: pointer;
          &.title-active {
            color: $themeColor;
          }
        }
      }
    }

    .card-max-height {
      max-height: var(--card-max-height);
      .thumbnail-item {
        display: flex;
        animation: enlarge 0.3s linear;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 100%;
        padding: 0 2px;
        min-height: calcHeight(79px);
        margin-bottom: 6px;
        cursor: pointer;
        .card-label {
          position: absolute;
          width: 24px;
          height: 20px;
          border-radius: 6px;
          text-align: center;
          z-index: 10;
          background: #fff;
          border: 1px solid #dbdbdb;
          font-size: 12px;
          color: #000;
          left: 6px;
          bottom: 6px;
          line-height: 20px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .thumbnail-editor-list-parent {
          position: absolute;
        }

        .thumbnail-editor-list {
          width: calcWidth(131px);
          height: calcHeight(70px);
          display: flex;
          flex-direction: row-reverse;
          // border: 1px solid red;
        }

        .thumbnail-editor-item {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          text-align: center;
          font-size: 14px;
          color: #fff;
          margin: 2px;
        }

        .thumbnail {
          border-radius: 5px;
          padding: 0.2px;
          outline: 1px solid #dbdbdb;
        }

        &.active {
          .label {
            color: $themeColor;
          }

          .thumbnail {
            outline-color: $themeColor;
          }
        }

        &.selected {
          .thumbnail {
            outline-color: $themeColor;
          }
        }
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.refresh {
  position: absolute;
  top: 30vh;
  left: 140px;
  width: 40px;
  height: 56px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  vertical-align: middle;
  outline: transparent solid 2px;
  outline-offset: 2px;
  line-height: 1.2;
  font-weight: 600;
  color: '#3c3838';
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);

  .icon-rotate {
    color: #2aba8a;
    animation: rotate 0.8s linear infinite;
  }
}

.resizer {
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: -24px;
  opacity: 0;
  width: 24px;
  background: rgba(0, 0, 0, 0.08);
  height: 100%;
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, box-shadow, transform;
  transition-duration: 200ms;
  transition-timing-function: ease;
  -webkit-box-align: center;
  align-items: center;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 20;
  .link {
    position: relative;
    left: 2px;
    background: #ffffff;
    border-radius: 9999px;
    width: 4px;
    height: 40px;
    opacity: 0.6;
    transition-property: background-color, border-color, color, fill, stroke,
      opacity, box-shadow, transform;
    transition-duration: 200ms;
  }
}

.thumbnails:active .resizer .link {
  opacity: 1;
}

.thumbnails.show .resizer,
.thumbnails:hover .resizer {
  opacity: 1;
}

.thumbnails .resizer:hover {
  cursor: ew-resize;
}

.add-slide {
  height: 40px;
  font-size: 14px;
  display: flex;
  flex-shrink: 0;
  margin: 14px 8px 2px 15px; //  上右下左
  cursor: pointer;

  .border {
    border: 1px solid $strokeE6Color;
    border-radius: 5px;
    background-color: $whiteColor;
  }

  .btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: $whiteColor;
    }
  }

  .size {
    width: 140px;
    height: 100%;
  }

  .select-btn {
    width: 30px;
    height: 100%;
    display: flex;
    // display: none; // 元素的隐藏
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: $whiteColor;
    }
  }

  .icon {
    margin-right: 10px;
    font-size: 20px;
    color: $blackColor;
  }
}

.label {
  font-size: 14px;
  color: $blackColor;
  width: 20px;
  margin-right: 5px;
  margin-left: 5px;
  cursor: grab;

  &.offset-left {
    position: relative;
    left: -4px;
  }

  &:active {
    cursor: grabbing;
  }
}

.page-number {
  height: 40px;
  font-size: 12px;
  // border-top: 1px solid $borderColor;
  line-height: 40px;
  margin-right: 5px;
  text-align: center;
  color: $blackColor;
}
</style>
