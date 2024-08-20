<template>
  <div 
    class="editor" 
    v-click-outside="hideMenuInstance"
  >
    <div 
      class="prosemirror-editor"
      ref="editorViewRef"
    >
    </div>
    <!-- 评论回复 -->
    <div class="comments-btn">
      <Button style="margin-left: 5px;">{{ $t('comments.cancel') }}</Button>
      <Button type="primary" style="margin-left: 5px;">{{ $t('comments.reply') }}</Button>
    </div>
    <!-- 评论第一条 -->
    <Comments :show-modal="showFirstModal" @switchModal="switchModalFirseCall"></Comments>
    <section class="show-comments">
      <a class="btn">Hide resolved comments</a>
    </section>

    <!-- 评论列表 -->
    <div class="comments-list">
      <ul>
        <li>
          <Comments :show-modal="showModal" @switchModal="switchModalCall"></Comments>
        </li>
      </ul>
    </div>
    
    <Divider />

  
    <!-- <div class="menu" ref="menuRef">
      <button :class="{ 'active': attr?.bold }" @click="execCommand('bold')"><IconTextBold /></button>
      <button :class="{ 'active': attr?.em }" @click="execCommand('em')"><IconTextItalic /></button>
      <button :class="{ 'active': attr?.underline }" @click="execCommand('underline')"><IconTextUnderline /></button>
      <button :class="{ 'active': attr?.strikethrough }" @click="execCommand('strikethrough')"><IconStrikethrough /></button>
      <Popover trigger="click" style="width: 30%;">
        <template #content>
          <ColorPicker :modelValue="attr?.color" @update:modelValue="value => execCommand('color', value)" />
        </template>
        <button><IconText /></button>
      </Popover>
      <Popover trigger="click" style="width: 30%;">
        <template #content>
          <ColorPicker :modelValue="attr?.backcolor" @update:modelValue="value => execCommand('backcolor', value)" />
        </template>
        <button><IconHighLight /></button>
      </Popover>
      <button :class="{ 'active': attr?.bulletList }" @click="execCommand('bulletList')"><IconList /></button>
      <button :class="{ 'active': attr?.orderedList }" @click="execCommand('orderedList')"><IconOrderedList /></button>
      <button @click="execCommand('clear')"><IconFormat /></button>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { debounce } from 'lodash'
import { useMainStore } from '@/store'
import type { EditorView } from 'prosemirror-view'
import { initProsemirrorEditor, createDocument } from '@/utils/prosemirror'
import { addMark, autoSelectAll, getTextAttrs, type TextAttrs } from '@/utils/prosemirror/utils'
import { toggleList } from '@/utils/prosemirror/commands/toggleList'
import tippy, { type Instance } from 'tippy.js'

import ColorPicker from '@/components/ColorPicker/index.vue'
import Popover from '@/components/Popover.vue'
import { toggleMark } from 'prosemirror-commands'
import Button from '@/components/Button.vue'
import Divider from '@/components/Divider.vue'
import Comments from './Comments.vue'

const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  (event: 'update', payload: string): void
}>()

const mainStore = useMainStore()

const editorViewRef = ref<HTMLElement>()
let editorView: EditorView

const attr = ref<TextAttrs>()

const menuInstance = ref<Instance>()
const menuRef = ref<HTMLElement>()

const showFirstModal = ref(false)
const showModal = ref(false)

const hideMenuInstance = () => {
  if (menuInstance.value) menuInstance.value.hide()
}

const handleInput = debounce(function() {
  emit('update', editorView.dom.innerHTML)
}, 300, { trailing: true })

const handleFocus = () => {
  mainStore.setDisableHotkeysState(true)
}

const handleBlur = () => {
  mainStore.setDisableHotkeysState(false)
}

const updateTextContent = () => {
  if (!editorView) return
  const { doc, tr } = editorView.state
  editorView.dispatch(tr.replaceRangeWith(0, doc.content.size, createDocument(props.value)))
}

defineExpose({ updateTextContent })

const handleMouseup = () => {
  const selection = window.getSelection()

  if (
    !selection ||
    !selection.anchorNode ||
    !selection.focusNode ||
    selection.isCollapsed ||
    selection.type === 'Caret' ||
    selection.type === 'None'
  ) return

  const range = selection.getRangeAt(0)

  if (menuInstance.value) {
    attr.value = getTextAttrs(editorView)

    const { x, y, left, top } = range.getBoundingClientRect()

    menuInstance.value.setProps({
      getReferenceClientRect: () => ({
        x, y, left, top,
        height: 0,
        width: 0,
        right: left,
        bottom: top,
      } as DOMRect),
    })
    menuInstance.value.show()
  }
}

const execCommand = (command: string, value?: string) => {
  if (command === 'color' && value) {
    const mark = editorView.state.schema.marks.forecolor.create({ color: value })
    autoSelectAll(editorView)
    addMark(editorView, mark)
  }
  else if (command === 'backcolor' && value) {
    const mark = editorView.state.schema.marks.backcolor.create({ backcolor: value })
    autoSelectAll(editorView)
    addMark(editorView, mark)
  }
  else if (command === 'bold') {
    autoSelectAll(editorView)
    toggleMark(editorView.state.schema.marks.strong)(editorView.state, editorView.dispatch)
  }
  else if (command === 'em') {
    autoSelectAll(editorView)
    toggleMark(editorView.state.schema.marks.em)(editorView.state, editorView.dispatch)
  }
  else if (command === 'underline') {
    autoSelectAll(editorView)
    toggleMark(editorView.state.schema.marks.underline)(editorView.state, editorView.dispatch)
  }
  else if (command === 'strikethrough') {
    autoSelectAll(editorView)
    toggleMark(editorView.state.schema.marks.strikethrough)(editorView.state, editorView.dispatch)
  }
  else if (command === 'bulletList') {
    const { bullet_list: bulletList, list_item: listItem } = editorView.state.schema.nodes
    toggleList(bulletList, listItem, '')(editorView.state, editorView.dispatch)
  }
  else if (command === 'orderedList') {
    const { ordered_list: orderedList, list_item: listItem } = editorView.state.schema.nodes
    toggleList(orderedList, listItem, '')(editorView.state, editorView.dispatch)
  }
  else if (command === 'clear') {
    autoSelectAll(editorView)
    const { $from, $to } = editorView.state.selection
    editorView.dispatch(editorView.state.tr.removeMark($from.pos, $to.pos))
  }

  editorView.focus()
  handleInput()
  attr.value = getTextAttrs(editorView)
}

onMounted(() => {
  editorView = initProsemirrorEditor((editorViewRef.value as Element), props.value, {
    handleDOMEvents: {
      focus: handleFocus,
      blur: handleBlur,
      mouseup: handleMouseup,
      mousedown: () => {
        window.getSelection()?.removeAllRanges()
        hideMenuInstance()
      },
      keydown: hideMenuInstance,
      input: handleInput,
    },
  }, {
    placeholder: '点击评论',
  })

  menuInstance.value = tippy(editorViewRef.value!, {
    duration: 0,
    content: menuRef.value!,
    interactive: true,
    trigger: 'manual',
    placement: 'top-start',
    hideOnClick: 'toggle',
    offset: [0, 6],
  })
})

const switchModalFirseCall = (status: boolean) => {
  showFirstModal.value = status
}
const switchModalCall = (status: boolean) => {
  showModal.value = status
}

onUnmounted(() => {
  editorView && editorView.destroy()
})
</script>

<style lang="scss" scoped>
.editor {
  height: 100%;
  // overflow: auto;
}
.prosemirror-editor {
  height: 100%;
  cursor: text;
  background-color: $lightGray;
  border-radius: 4px;
  border: 1px solid #2ababa;

  ::v-deep(.ProseMirror) {
    height: 100%;
    font-size: 12px;
    overflow: auto;
    padding: 8px;
    line-height: 1.5;

    & > p[data-placeholder]::before {
      content: attr(data-placeholder);
      pointer-events: none;
      position: absolute;
      font-size: 12px;
      color: rgba(#666, 0.5);
    }
  }
}
.menu {
  display: flex;
  background-color: #fff;
  padding: 6px 4px;
  border-radius: $borderRadius;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, .15);

  button {
    outline: 0;
    border: 0;
    background-color: #fff;
    padding: 3px;
    border-radius: $borderRadius;
    font-size: 16px;
    margin: 0 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover, &.active {
      background-color: $themeColor;
      color: #fff;
    }
  }
}

// 按钮样式
.comments-btn {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  :deep(.button) {
    height: 36px;
    line-height: 36px;
  }
}
// 是否展示
.show-comments {
  height: 50px;
  overflow: hidden;
  .btn {
    display: block;
    width: 100%;
    height: 28px;
    line-height: 26px;
    font-size: 12px;
    color: #202124;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 10px;
    text-align: center;
    cursor: pointer;
  }
}
// 评论列表

.comments-list {
  width: 100%;
  li {
    width: 100%;
  }
}
</style>
