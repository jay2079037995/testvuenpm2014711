<template>
    <div :class="'border'"
    v-if="editors.length > 0"
    :style="{
            'pointer-events': 'none',
            position: 'absolute',
            top: elementInfo.top * canvasScale + 'px',
            left: elementInfo.left * canvasScale + 'px',
            transform: `rotate(${rotate}deg)`,
            transformOrigin: `${elementInfo.width * canvasScale / 2}px ${height * canvasScale / 2}px`,
            width: `${elementInfo.width * canvasScale}px`,
            height: `${height * canvasScale}px`,
            border: `1px solid rgb(${~~(editors[0].color / (255 * 255))},${(~~(editors[0].color / 255)) % 255},${editors[0].color % 255}, 1)`,
    }"
    >
    <div :style="{
              position: `absolute`,
              top: `-23px`,
              left: `-2px`,
              // transform: `scale(${canvasScale})`,
    }">
      <div :style="{
        display: 'flex',
        'flex-direction': 'row-reverse',
      }">
        <div v-for="(editor, index) in editors"
        :key="index"
        :style="{
          margin: '1px',
          color: '#fff',
          'background-color': `rgba(${~~(editor.color / (255 * 255))},${(~~(editor.color / 255)) % 255},${editor.color % 255}, 1)`,
        }">{{editor.uuid}}</div>
      </div>
    </div>
    
    <div 
      :style="{
        position: 'relative' ,
        // left: `0px`,
        // top: `0px`,
      }"
      >
      <div
        v-for="(editor, index) in inputs"
        :key="index"
        :style="{
          position: 'absolute',
          left: `${editor.inputRange.rect.left * canvasScale}px`,
          top: `${editor.inputRange.rect.top * canvasScale}px`,
          width: '1px', /* 设置竖线的宽度 */
          height: `${editor.inputRange.rect.height * canvasScale}px`, /* 设置竖线的高度 */
          'border-left': `1px solid rgba(${~~(editor.color / (255 * 255))},${(~~(editor.color / 255)) % 255},${editor.color % 255}, 1)`, /* 使用 border-left 画竖线，可调整颜色和线条粗细 */
        }">
        <div
          :style="{
            opacity: 0.65,
            'font-size': '6px',
            color: '#fff',
            'vertical-align': 'top',
            display: 'inline',
            // display: 'flex',
            // border: '1px solid black',
            'background-color': `rgba(${~~(editor.color / (255 * 255))},${(~~(editor.color / 255)) % 255},${editor.color % 255}, 1)`,
          }">{{editor.uuid}}</div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts" setup>

import { useMainStore } from '@/store'
import { type Slide, type PPTElement } from '@/types/slides'
import { yjsUuid } from '@/utils/yjs-init'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'


const { canvasScale } = storeToRefs(useMainStore())

const props = defineProps<{
  elementInfo: PPTElement,
  slideInfo: any
}>()

const rotate = computed(() => 'rotate' in props.elementInfo ? props.elementInfo.rotate : 0)
const height = computed(() => 'height' in props.elementInfo ? props.elementInfo.height : 0)
const editors = computed(() => {
  const list:any[] = []
  if (props.slideInfo.editors) {
    for (let i = 0; i < props.slideInfo.editors.length; i++) {
      const editor = props.slideInfo.editors[i]
      if (editor.elements && editor.elements.indexOf(props.elementInfo.id) !== -1 && editor.uuid !== yjsUuid) { // && editor.uuid !== yjsUuid) {
        list.push(editor)
      }
    }
  }
  return list
  // const editors = props.elementInfo.editors
})

const inputs = computed(() => {
  const list:any[] = []
  if (props.slideInfo.editors) {
    for (let i = 0; i < props.slideInfo.editors.length; i++) {
      const editor = props.slideInfo.editors[i]
      if (editor.elements && editor.elements.indexOf(props.elementInfo.id) !== -1 && editor.inputRange !== undefined && editor.uuid !== yjsUuid) { // && editor.uuid !== yjsUuid) {
        list.push(editor)
        console.log(editor.inputRange.rect)
      }
    }
  }
  return list
  // const editors = props.elementInfo.editors
})

// const offsetx = computed(() => {
//   props.elementInfo.left,props.elementInfo.top
//   const rect = divElement.getBoundingClientRect();
//   const scrollTop = window.scrollY || window.pageYOffset;
//   const scrollLeft = window.scrollX || window.pageXOffset;
//   const top = rect.top + scrollTop;
//   const left = rect.left + scrollLeft;
//   console.log('Element top (relative to screen): ' + top);
//   console.log('Element left (relative to screen): ' + left);
// })
</script>
  
<style lang="scss" scoped>
.border {
  position: absolute;
  }
</style>