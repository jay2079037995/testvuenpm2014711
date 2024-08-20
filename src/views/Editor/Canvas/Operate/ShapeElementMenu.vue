<template>
    <div :style="{
        position: 'absolute'
    }">
        <div
        class="shape-element-menu"
        :style="{
            transform: `scale(${(canvasScale > 1 ? 1 : canvasScale)})`,
            'transform-origin': 'top left',
            width: 400 + 'px',
            height: 48 + 'px',
        }">

        
        <div 
            v-on:mouseover="enterShapeMenu()"
            v-on:mouseout="leaveShapeMenu()"
            ref="shapeMenuRef"
            class="menu-item-content has-selection" 
            :style="{
              width: '30px',
            }"
          >
            <span>
              <div :style="{
              width: '20px',
              height: '30px',
            }">
                <img :style="{
                  position: 'absolute',
                  top: '11px'
            }" 
            src="/icons/contextmenu/shape.svg" alt="...">
              </div>
            </span>
            
          <ul
          :style="{
              position: 'absolute',
              background: '#fff',
              display: 'none',
            }"
            :handleClickMenuItem="handleClickMenuItem" >
            <div class="shape-pool" 
            ref="shapeScrollerRef"
            @wheel.prevent="$event => handleMousewheelThumbnails($event)">
              <div class="category" v-for="item in SHAPE_LIST" :key="item.type">
                <div class="shape-list">
                  <template v-for="(shape, index) in item.children">
                    <ShapeItemThumbnail 
                      class="shape-item"
                      :key="index"
                      :shape="shape"
                      @click="changeShape(shape)"
                      v-if="shape.title !== $t('canvasTool.arbitraryPolygon')"
                    />
                  </template>
                </div>
              </div>
            </div>
          </ul>
          </div>

        <div class="device">
        </div>
          
        <Popover trigger="click" style="width: 30px">
          <template #content>
            <ColorPicker
              :modelValue="richTextAttrs.color"
              @update:modelValue="value => emitRichTextCommand('color', value)"
            />
          </template>
          <TextColorItem first v-tooltip="$t('panel.textColor')" :color="richTextAttrs.color">
            <img src="/icons/contextmenu/font-menu.svg" alt="...">
          </TextColorItem>
        </Popover>
          
          <ButtonGroup class="row">
            
              <div 
                class="menu-item-content" 
              >
                <span 
                  class="text"
                  :class="{ active: richTextAttrs.bold }"
                  @click="emitRichTextCommand('bold')"
                >
                  <img src="/icons/contextmenu/bold-menu.svg" alt="...">
                </span>
              </div>

              
              <div 
                class="menu-item-content" 
              >
                <span 
                  class="text"
                  :class="{ active: richTextAttrs.em }"
                  @click="emitRichTextCommand('em')"
                >
                  <img src="/icons/contextmenu/italic-menu.svg" alt="...">
                </span>
              </div>

              
              <div 
                class="menu-item-content" 
              >
                <span 
                  class="text"
                  :class="{ active: richTextAttrs.underline }"
                  @click="emitRichTextCommand('underline')"
                >
                <img src="/icons/contextmenu/underline.svg" alt="...">
                </span>
              </div>
            
              <div 
                class="menu-item-content" 
              >
                <span 
                  class="text"
                  :class="{ active: richTextAttrs.strikethrough }"
                  @click="emitRichTextCommand('strikethrough')"
                >
                <img src="/icons/contextmenu/strikethrough.svg" alt="...">
                </span>
              </div>


              
          </ButtonGroup>

          
          <div 
            ref="alginRef"
            class="menu-item-content has-selection" 
            :style="{
              width: '30px',
            }"
          >
            <span>
              <div :style="{
              width: '20px',
              height: '30px',
            }">
                <img :style="{
                  position: 'absolute',
                  top: '11px'
            }" src="/icons/contextmenu/algin-left.svg" alt="...">
              </div>
            </span>
            <EditMeun
              :menus="alginMenus"
              :handleClickMenuItem="handleClickMenuItem" 
              :style="{ top: '30px'}"
            ></EditMeun>
          </div>

          <div class="device">
          </div>

          

          
          <div class="menu-item-content" 
          @click="() => console.log('more!')">
            <span 
            class="text"
            >
              <img src="/icons/contextmenu/more.svg" alt="...">
            </span>
          </div>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { ref, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { WEB_FONTS } from '@/configs/font'
import type { PPTShapeElement, ShapeGradient, ShapeText } from '@/types/slides'
import { useMainStore, useSlidesStore } from '@/store'
import emitter, { EmitterEvents, type RichTextAction } from '@/utils/emitter'
import message from '@/utils/message'
import { type ShapePoolItem, SHAPE_LIST, SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import TextColorItem from '../../Toolbar/common/TextColorItem.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import SelectRound from '@/components/SelectRound.vue'
import Popover from '@/components/Popover.vue'
import i18n from '@/assets/locales/index'
import type { ContextmenuItem } from './../../../../components/Contextmenu/types'
import EditMeun from './../../../../components/ContextmenuText/EditMenu.vue'
import { yjsSetElementAttributes } from '@/utils/yjs-init'
import ShapeItemThumbnail from '../../CanvasTool/ShapeItemThumbnail.vue'

const { global: { t: $t } } = i18n

const alginRef = ref<HTMLElement>()
const shapeMenuRef = ref<HTMLElement>()
const shapeScrollerRef = ref<HTMLElement>()
  
const { addHistorySnapshot } = useHistorySnapshot()

const updateElement = (props: Partial<PPTShapeElement>) => {
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
  const { id } = handleElement.value as PPTShapeElement
  yjsSetElementAttributes(id, props)
}

// 修改形状
const changeShape = (shape: ShapePoolItem) => {
  const { width, height } = handleElement.value as PPTShapeElement
  const props: Partial<PPTShapeElement> = {
    viewBox: shape.viewBox,
    path: shape.path,
    special: shape.special,
  }
  if (shape.pathFormula) {
    props.pathFormula = shape.pathFormula
    props.viewBox = [width, height]

    const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula]
    if ('editable' in pathFormula) {
      props.path = pathFormula.formula(width, height, pathFormula.defaultValue)
      props.keypoint = pathFormula.defaultValue
    }
    else props.path = pathFormula.formula(width, height)
  }
  else {
    props.pathFormula = undefined
    props.keypoint = undefined
  }
  updateElement(props)
  if (shapeMenuRef.value) {
    (shapeMenuRef.value.children[1] as any).style.display = 'none'
  }
}

const handleMousewheelThumbnails = (e: WheelEvent) => {
  e.stopPropagation()
  // console.log('滚动 ', e.deltaY)
  // console.log((scrollContainer as any).value.clientHeight, (scrollContainer as any).value.scrollHeight, (scrollContainer as any).value.scrollTop)
  // if (moveScrollToIntervalCall) {
  //   moveScrollTo(getScrollEndY() + e.deltaY * 1)
  // }
  // else {
  //   moveScrollTo((scrollContainer as any).value.scrollTop + e.deltaY * 1)
  // }
  if (shapeScrollerRef.value) {
    shapeScrollerRef.value.scrollTop += e.deltaY
  }
}


const presetStyles = [
  {
    label: $t('edit.bigTitle'),
    style: {
      fontSize: '26px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '66px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: $t('edit.smallTitle'),
    style: {
      fontSize: '22px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '40px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: $t('edit.text'),
    style: {
      fontSize: '20px',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '20px' },
    ],
  },
  {
    label: $t('edit.textSmall'),
    style: {
      fontSize: '18px',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '18px' },
    ],
  },
  {
    label: $t('edit.comment1'),
    style: {
      fontSize: '16px',
      fontStyle: 'italic',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '16px' },
      { command: 'em' },
    ],
  },
  {
    label: $t('edit.comment2'),
    style: {
      fontSize: '16px',
      textDecoration: 'underline',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '16px' },
      { command: 'underline' },
    ],
  },
]


// 标题下拉菜单
const titleMenu = computed(() => {
  return presetStyles.map((item: any) => {
    const { label, cmd } = item
    return {
      text: label,
      handler: () => emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: cmd }),
    }
  })
})

const enterShapeMenu = () => {
  if (shapeMenuRef.value) {
    (shapeMenuRef.value.children[1] as any).style.display = ''
  }
}

const leaveShapeMenu = () => {
  if (shapeMenuRef.value) {
    (shapeMenuRef.value.children[1] as any).style.display = 'none'
  }
}

const handleClickMenuItem = (item: ContextmenuItem) => {
  if (item.disable) return
  if (item.children && !item.handler) return
  console.log('click item:', item)
  if (item.handler) item.handler(item as any)

  // if (shapeMenuRef.value && shapeMenuRef.value.children.length > 1) {
  //   (shapeMenuRef.value.children[1] as any).style.display = 'none',
  //   setTimeout(() => {
  //     (shapeMenuRef.value?.children[1] as any).style.display = ''
  //   }, 200)
  // }

  if (alginRef.value && alginRef.value.children.length > 1) {
    (alginRef.value.children[1] as any).style.display = 'none',
    setTimeout(() => {
      (alginRef.value?.children[1] as any).style.display = ''
    }, 200)
  }
  
  // props.removeContextmenu()
}

// AI 编辑下拉菜单
const aIMenus = computed(() => {
  return [
    {
      text: $t('edit.rewrite'),
      handler: () => console.log(1),
      icon: '/icons/contextmenu/stars.svg'
    },
    {
      text: $t('edit.adjustTone'),
      handler: () => console.log(1),
      icon: '/icons/contextmenu/wave.svg',
      children: [
        {
          text: $t('edit.objectiveNeutral'),
          handler: () => console.log(1),
        },
        {
          text: $t('edit.cordialFriendly'),
          handler: () => console.log(1),
        },
        {
          text: $t('edit.enthusiasticExcited'),
          handler: () => console.log(1),
        },
        {
          text: $t('edit.persuasive'),
          handler: () => console.log(1),
        },
        {
          text: $t('edit.academicRationality'),
          handler: () => console.log(1),
        },
      ],
    },
    {
      text: $t('edit.spellingGrammar'),
      handler: () => console.log(1),
      icon: '/icons/contextmenu/bingo.svg',
    },
    {
      text: $t('edit.abbreviation'),
      handler: () => console.log(1),
      icon: '/icons/contextmenu/fold.svg',
    },
    {
      text: $t('edit.expand'),
      handler: () => console.log(1),
      icon: '/icons/contextmenu/unfold.svg',
    },
  ]
})

// 对齐 编辑下拉菜单
const alginMenus = computed(() => {
  return [
    {
      text: $t('panel.leftAligned'),
      handler: () => emitRichTextCommand('align', 'left'),
      icon: '/icons/contextmenu/algin-left.svg'
    },
    {
      text: $t('panel.center'),
      handler: () => emitRichTextCommand('align', 'center'),
      icon: '/icons/contextmenu/algin-center.svg',
    },
    {
      text: $t('panel.rightAligned'),
      handler: () => emitRichTextCommand('align', 'right'),
      icon: '/icons/contextmenu/algin-right.svg',
    },
    {
      text: $t('panel.alignBothEnds'),
      handler: () => emitRichTextCommand('align', 'justify'),
      icon: '/icons/contextmenu/algin-justify.svg',
    },
  ]
})

const fontSizeOptions = [
  '12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px',
  '36px', '40px', '44px', '48px', '54px', '60px', '66px', '72px', '76px',
  '80px', '88px', '96px', '104px', '112px', '120px',
]
  
const { canvasScale } = storeToRefs(useMainStore())

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { handleElement, handleElementId, richTextAttrs, availableFonts, textFormatPainter } = storeToRefs(mainStore)


// 发射富文本设置命令
const emitRichTextCommand = (command: string, value?: string) => {
  emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: { command, value } }) 
}

// 设置富文本超链接
const link = ref('')
const linkPopoverVisible = ref(false)

watch(richTextAttrs, () => linkPopoverVisible.value = false)

const openLinkPopover = () => {
  link.value = richTextAttrs.value.link
}
const updateLink = (link?: string) => {
  const linkRegExp = /^(https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/
  if (!link || !linkRegExp.test(link)) return message.error('不是正确的网页链接地址')

  emitRichTextCommand('link', link)
  linkPopoverVisible.value = false
}
  
</script>
  
<style lang="scss" scoped>

$menuWidth: 240px;
$menuHeight: 30px;
$subMenuWidth: 80px;

.shape-element-menu {
    display: flex;
    box-sizing: border-box;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 12px;
    gap: 10px;
    background: #F9F9F9;
    border: 1px solid #DBDBDB;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
}

.row {
  gap: 10px;
  display: flex;
  align-items: center;
}

.device {
  border-left: 1px solid #DBDBDB;; /* 设置垂直分割线的样式 */
  height: 32px; /* 设置分割线的高度 */
}



.link-popover {
  width: 240px;

  .btns {
    margin-top: 10px;
    text-align: right;
  }
}

.list-wrap {
  width: 176px;
  color: #e6e6e6;
  padding: 8px;
  margin: -12px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}
.list {
  background-color: $lightGray;
  padding: 4px 4px 4px 20px;
  cursor: pointer;

  &:not(:nth-child(3n)) {
    margin-right: 8px;
  }

  &:nth-child(4),
  &:nth-child(5),
  &:nth-child(6) {
    margin-top: 8px;
  }

  &:hover {
    color: $themeColor;

    span {
      background-color: $themeColor;
    }
  }
}
.list-item {
  width: 24px;
  height: 12px;
  position: relative;
  font-size: 12px;
  top: -5px;

  span {
    width: 100%;
    height: 2px;
    display: inline-block;
    position: absolute;
    top: 10px;
    background-color: #e6e6e6;
  }
}
.popover-btn {
  padding: 0 3px;
}

.menu-item-content {
  position: relative;
  span.text {
    border-radius: 4px;
    padding: 0 2px 2px;
    &.active {
      background-color: #DBDBDB;
      color: #fff;
    }
  }
  &.has-children,
  &.has-selection {
    padding: 0 0px;
  }

  &.has-children::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-width: 1px;
    border-style: solid;
    border-color: #666 #666 transparent transparent;
    position: absolute;
    right: 4px;
    top: 0px;
    transform: translateY(-50%) rotate(135deg);
  }
  &.has-selection::before {
    content: '';
    display: inline-block;
    width: 0px;
    height: 6px;
    border-width: 3px;
    border-style: solid;
    border-color: #666 #666 transparent transparent;
    position: absolute;
    right: 4px;
    top: 15px;
    transform: translateY(-50%) rotate(135deg);
  }
  &.has-handler::after {
    content: '';
    display: inline-block;
    width: 1px;
    height: 24px;
    background-color: #f1f1f1;
    position: absolute;
    right: 18px;
    top: 3px;
    transform: scale(0);
    transition: transform $transitionDelay;
  }
  .sub-text {
    opacity: 0.6;
  }
  .sub-menu {
    width: $subMenuWidth;
    position: absolute;
    display: none;
    // left: 112%;
    left: 108%;
    top: -6px;
  }
  &:hover .menu-content {
    display: block;
  }
}

.shape-pool {
  width: 235px;
  height: 150px;
  overflow: auto;
  padding: 5px;
  padding-right: 10px;
  border: 1px solid $borderColor;
  margin-bottom: 20px;
}
.shape-list {
  @include flex-grid-layout();
}
.shape-item {
  @include flex-grid-layout-children(6, 14%);

  height: 0;
  padding-bottom: 14%;
  flex-shrink: 0;
}

</style>