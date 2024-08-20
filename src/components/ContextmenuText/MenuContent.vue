<template>
  <ul 
    class="text-content"
  >
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content has-children" 
      >
        <span>{{ $t('edit.title') }}</span>
        <EditMeun
          :menus="titleMenu"
          :handleClickMenuItem="handleClickMenuItem" 
        ></EditMeun>
      </div>
    </li>
    <li class="menu-item divider"></li>
    <!-- 项目符号 -->
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content has-selection"
        @click="emitRichTextCommand('bulletList')"
      >
        <span
          class="text"
          :class="{ active: richTextAttrs.bulletList }"
        >
          <img src="/icons/contextmenu/ordernum.svg" alt="...">
        </span>
        <EditMeun
          :menus="bulletMenu"
          :handleClickMenuItem="handleClickMenuItem" 
        ></EditMeun>
      </div>
    </li>
    <!-- 编号 -->
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content has-selection"
        @click="emitRichTextCommand('orderedList')"
      >
        <span
          class="text"
          :class="{ active: richTextAttrs.orderedList }"
        >
          <img src="/icons/contextmenu/orderly.svg" alt="...">
        </span>
        <EditMeun
          :menus="orderedMenu"
          :handleClickMenuItem="handleClickMenuItem" 
        ></EditMeun>
      </div>
    </li>
    <!-- 加粗 -->
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content" 
      >
        <span 
          class="text"
          :class="{ active: richTextAttrs.bold }"
          @click="emitRichTextCommand('bold')"
        >
          <img src="/icons/contextmenu/bold.svg" alt="...">
        </span>
      </div>
    </li>
    <!-- 斜体 -->
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content" 
      >
        <span 
          class="text"
          :class="{ active: richTextAttrs.em }"
          @click="emitRichTextCommand('em')"
        >
          <img src="/icons/contextmenu/italic.svg" alt="...">
        </span>
      </div>
    </li>
    <li class="menu-item divider"></li>
    <!-- <li
      class="menu-item"
    >
      <div 
        class="menu-item-content" 
      >
        <span>
          <img src="/icons/contextmenu/code.svg" alt="...">
        </span>
      </div>
    </li>
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content" 
      >
        <span>
          <img src="/icons/contextmenu/link.svg" alt="...">
        </span>
      </div>
    </li>
    <li class="menu-item divider"></li> -->
    <li
      class="menu-item"
    >
      <div 
        class="menu-item-content has-selection" 
      >
        <span>
          <img src="/icons/contextmenu/edit.svg" alt="...">
          {{ $t('edit.aiEdit') }}
        </span>
        <EditMeun
          :menus="aIMenus"
          :handleClickMenuItem="handleClickMenuItem" 
        ></EditMeun>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-var-requires */
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { ContextmenuItem } from './types'
import EditMeun from './EditMenu.vue'
import emitter, { EmitterEvents, type RichTextAction } from '@/utils/emitter'
import { useMainStore, useSlidesStore } from '@/store'
import i18n from '@/assets/locales/index'
const { global: { t: $t } } = i18n

const mainStore = useMainStore()
const { handleElement, handleElementId, richTextAttrs, availableFonts, textFormatPainter } = storeToRefs(mainStore)


defineProps<{
  menus: ContextmenuItem[]
  handleClickMenuItem: (item: ContextmenuItem) => void
}>()

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

// 发射富文本设置命令
const emitRichTextCommand = (command: string, value?: string) => {
  emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: { command, value } })
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

// 项目符号
const bulletListStyleTypeOption = ref(['disc', 'circle', 'square'])
const bulletMenu = computed(() => {
  return bulletListStyleTypeOption.value.map((item: any) => {
    return {
      text: item,
      handler: () => emitRichTextCommand('bulletList', item),
    }
  })
})

// 编号
const orderedListPanelVisible = ref(false)
const orderedListStyleTypeOption = ref(['decimal', 'lower-roman', 'upper-roman', 'lower-alpha', 'upper-alpha', 'lower-greek'])
const orderedMenu = computed(() => {
  return orderedListStyleTypeOption.value.map((item: any) => {
    return {
      text: item,
      handler: () => emitRichTextCommand('orderedList', item),
    }
  })
})


</script>

<style lang="scss" scoped>
$menuWidth: 240px;
$menuHeight: 30px;
$subMenuWidth: 160px;

.text-content {
  width: 400px;
  height: 48px;
  line-height: 42px;
  padding: 4px;
  padding-right: 16px;
  background: #fff;
  border: 1px solid $borderColor;
  box-shadow: $boxShadow;
  border-radius: 8px;
  list-style: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: left;
}
.menu-item {
  // padding: 0 24px 0 16px;
  color: $textColor;
  font-size: 14px;
  transition: all $transitionDelayFast;
  white-space: nowrap;
  // height: $menuHeight;
  // line-height: $menuHeight;
  background-color: #fff;
  cursor: pointer;
  // border-radius: 8px;

  &.divider {
    width: 1px;
    height: 22px;
    overflow: hidden;
    margin: 5px;
    background-color: #e5e5e5;
    line-height: 0;
    padding: 0;
  }

  &.disable {
    color: #b1b1b1;
    cursor: no-drop;
  }
}
.menu-item-content {
  // display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  // height: 48px;
  padding: 0 8px;
  span.text {
    border-radius: 4px;
    padding: 0 2px 2px;
    &.active {
      background-color: #2aba8a;
      color: #fff;
      img {
        filter: invert(100%) brightness(120%);
      }
    }
  }
  &.has-children,
  &.has-selection {
    padding: 0 16px;
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
    top: 20px;
    transform: translateY(-50%) rotate(135deg);
  }
  &.has-selection::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-width: 3px;
    border-style: solid;
    border-color: #666 #666 transparent transparent;
    position: absolute;
    right: 4px;
    top: 20px;
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
</style>