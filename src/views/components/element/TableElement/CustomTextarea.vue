<template>
  <div 
    class="custom-textarea"
    ref="textareaRef"
    :contenteditable="true"
    @focus="handleFocus()"
    @blur="handleBlur()"
    @input="handleInput($event)"
    @keydown="inputPosChange()"
    @click="inputPosChange()"
    @focusout="outPosChange()"
  ></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watch, onMounted } from 'vue'
import { pasteCustomClipboardString, pasteExcelClipboardString } from '@/utils/clipboard'
import { type TableCell, type PPTTableElement } from '@/types/slides'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import { yjsEditTableTextInsert, yjsSetTextChangeBack, setEditorElementInput } from '@/utils/yjs-init'

const props = withDefaults(defineProps<{
  value?: string
  elementInfo: PPTTableElement
  cell: TableCell
}>(), {
  value: '',
})

const emit = defineEmits<{
  (event: 'updateValue', payload: string): void
  (event: 'insertExcelData', payload: string[][]): void
}>()

const textareaRef = ref<HTMLElement>()
const isFocus = ref(false)
const { canvasScale } = storeToRefs(useMainStore())
let lastText = ''

const onTextChange = (elementId:string, gridId:string, text:string) => {
  if (elementId !== props.elementInfo.id || gridId !== props.cell.id) return
  if (isFocus.value) {
    const old = lastText
    if (textareaRef.value) {
      if (text !== old) {
        // console.log('other input:')
        if (text.length > old.length) {
          let addText = ''
          let pos = -1
          for (let i = 0; i < old.length; i++) {
            if (old.charAt(i) !== text.charAt(i)) {
              pos = i
              addText = text.slice(i, i + text.length - old.length)
              break
            }
          }
          if (addText === '') {
            pos = old.length
            addText = text.slice(old.length, text.length)
          }
          const myFoucsPos = getInputPos()
          console.log('检测到增加文字', pos, addText, myFoucsPos)
          if (textareaRef.value) {
            if (textareaRef.value.innerHTML !== text) {
              textareaRef.value.innerHTML = text
              if (pos <= myFoucsPos) {
                setInputPos(myFoucsPos + addText.length)
              }
              else {
                setInputPos(myFoucsPos)
              }
            }
          }
          lastText = text
        }
        else {
          console.log('检测到删除文字')
          let start = -1
          let end = -1
          for (let i = 0; i < text.length; i++) {
            if (old.charAt(i) !== text.charAt(i)) {
              start = i
              for (let j = 0; j < text.length; j++) {
                if (old.charAt(old.length - 1 - j) !== text.charAt(text.length - 1 - j)) {
                  end = old.length - 1 - j
                  break
                }
              }
              break
            }
          }
          console.log('start - end', start, end, text, old)
          if (start === -1) {
            start = text.length
            end = start + old.length - text.length - 1
          }
          let inputPos = getInputPos()
          lastText = text
          console.log('inputPos', inputPos, start, end, text, textareaRef.value.innerHTML)
          if (end < inputPos) {
            inputPos -= end + 1 - start
          }
          else if (start < inputPos) {
            inputPos = start
          }
          if (textareaRef.value.innerHTML !== text) {
            textareaRef.value.innerHTML = text
            if (inputPos > text.length) {
              inputPos = text.length
            }
            setInputPos(inputPos)
          }
        }
      }
    }
  } 
}

// 自定义v-modal，同步数据
// 当文本框聚焦时，不执行数据同步
watch(() => props.value, () => {
  // console.log('changed grid text!', props.value)
  if (!isFocus.value) {
    if (textareaRef.value) textareaRef.value.innerHTML = props.value
  }
}, { immediate: true })

const getInputPos = ():number => {
  let myFoucsPos = 0
  const selection = window.getSelection() as any
  if (selection && selection.rangeCount) {
    const range = selection.getRangeAt(0)
    myFoucsPos = range.startOffset
  }
  return myFoucsPos
}

const setInputPos = (position:number) => {
  const divElement = textareaRef.value as any
  if (!divElement.childNodes.length) return
  const range = document.createRange()
  const sel = window.getSelection() as any

  console.log('setInputPos', position, divElement.childNodes[0])
  range.setStart(divElement.childNodes[0], position) // 设置光标位置
  range.collapse(true)

  sel.removeAllRanges()
  sel.addRange(range)
  divElement.focus()
  inputPosChange()
}

const inputPosChange = () => {
  console.log('pos change')
  const selection = window.getSelection() as any
  if (selection && selection.rangeCount) {
    const range = selection.getRangeAt(0)
    console.log('input pos:', range.startOffset)
  }
  setTimeout(() => {
    const selection = window.getSelection() as any
    if (!selection) return
    const range = selection.getRangeAt(0)
    if (!range) return
    if (range.startOffset !== range.endOffset) {
      console.log(range)
    }
    console.log(range.startOffset, range.endOffset, range)
    const containerRect = { x: 0, y: 0 }
    containerRect.x = textareaRef?.value?.parentElement?.parentElement?.parentElement?.getBoundingClientRect().x || 0
    containerRect.y = textareaRef?.value?.parentElement?.parentElement?.parentElement?.getBoundingClientRect().y || 0
    const rect = range.getBoundingClientRect()
    setEditorElementInput(props.elementInfo.id, {
      start: range.startOffset,
      end: range.endOffset,
      cellId: props.cell.id,
      rect: {
        left: (rect.left - containerRect.x) / canvasScale.value,
        top: (rect.top - containerRect.y) / canvasScale.value,
        height: rect.height / canvasScale.value
      }
    })
  }, 50)
}

const outPosChange = () => {
  console.log('out foucus')
  // setEditorElementInput(props.elementInfo.id, null)
}

// let composingText = ''
// let composingPos = -1

const handleInput = (e:any) => {
  console.log('handleInput', e.type, e.isComposing, e.inputType, e.inputType, e.data)
  if (!textareaRef.value) return
  const selection = window.getSelection() as any
  const range = selection.getRangeAt(0)
  if (e.inputType === 'deleteContentBackward' || !e.data && lastText !== textareaRef.value.innerHTML) {
    let deleteText = ''
    deleteText = lastText.slice(range.startOffset, range.startOffset + (lastText.length - textareaRef.value.innerHTML.length))
    yjsEditTableTextInsert(props.elementInfo.id, props.cell.id, range.startOffset, '', deleteText)
  }
  else {
    console.log('input pos:', range.endOffset, e.data)
    const beforeIndex = range.startOffset - e.data.length
    // if (e.isComposing) {
    //   composingPos = beforeIndex
    //   composingText = e.data
    //   return
    // }
    let deleteText = ''
    if (lastText.slice(beforeIndex, lastText.length).length > textareaRef.value.innerHTML.slice(range.startOffset, textareaRef.value.innerHTML.length).length) {
      deleteText = lastText.slice(beforeIndex, lastText.length - (textareaRef.value.innerHTML.length - range.startOffset))
      console.log('输入时删除了部分文字', beforeIndex, deleteText)
    } 
    else if (lastText.slice(beforeIndex, lastText.length).length < textareaRef.value.innerHTML.slice(range.startOffset, textareaRef.value.innerHTML.length).length) {
      console.error('判断出错')
    }
    // textareaRef.value.innerHTML = lastText
    // setInputPos(beforeIndex)
    yjsEditTableTextInsert(props.elementInfo.id, props.cell.id, beforeIndex, e.data, deleteText)
    // yjsedi
    // lastText = textareaRef.value.innerHTML
    // const text = textareaRef.value.innerHTML
    // emit('updateValue', text)
  }
  // TODO 更新其他人的焦点位置
  fixOtherFoucesPosition()
  // EndTODO
  inputPosChange()
}

const fixOtherFoucesPosition = () => {
  console.log('other focus!')
}

// 聚焦时更新焦点标记，并监听粘贴事件
const handleFocus = () => {
  isFocus.value = true
  lastText = props.value
  yjsSetTextChangeBack(onTextChange)

  // if (!textareaRef.value) return

  // textareaRef.value.innerHTML = props.value

  // textareaRef.value.onpaste = (e: ClipboardEvent) => {
  //   e.preventDefault()
  //   if (!e.clipboardData) return

  //   const clipboardDataFirstItem = e.clipboardData.items[0]

  //   if (clipboardDataFirstItem && clipboardDataFirstItem.kind === 'string' && clipboardDataFirstItem.type === 'text/plain') {
  //     clipboardDataFirstItem.getAsString(text => {
  //       const clipboardData = pasteCustomClipboardString(text)
  //       if (typeof clipboardData === 'object') return
  //       const excelData = pasteExcelClipboardString(text)
  //       if (excelData) {
  //         emit('insertExcelData', excelData)
  //         if (textareaRef.value) textareaRef.value.innerHTML = excelData[0][0]
  //         return
  //       }
  //       document.execCommand('insertText', false, text)
  //     })
  //   }
  // }

  // inputPosChange()
}

// 失焦时更新焦点标记，清除粘贴事件监听
const handleBlur = () => {
  isFocus.value = false
  if (textareaRef.value) textareaRef.value.onpaste = null
}

// 清除粘贴事件监听
onBeforeUnmount(() => {
  if (textareaRef.value) textareaRef.value.onpaste = null
})

onMounted(() => {
  if (textareaRef.value) textareaRef.value.innerHTML = props.value
  lastText = props.value
})
</script>

<style lang="scss" scoped>
.custom-textarea {
  border: 0;
  outline: 0;
  -webkit-user-modify: read-write-plaintext-only;
}
</style>