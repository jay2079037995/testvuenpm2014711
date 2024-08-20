<template>
  <div class="text-element-operate">
    <BorderLine 
      class="operate-border-line"
      v-for="line in borderLines" 
      :key="line.type" 
      :type="line.type" 
      :style="line.style"
    />
    <template v-if="handlerVisible">
      <ResizeHandler
        class="operate-resize-handler" 
        v-for="point in resizeHandlers"
        :key="point.direction"
        :type="point.direction"
        :rotate="elementInfo.rotate"
        :style="point.style"
        @mousedown.stop="$event => scaleElement($event, elementInfo, point.direction)"
      />
      <RotateHandler
        class="operate-rotate-handler" 
        :style="{ left: scaleWidth / 2 - 22 * canvasScale  - 8 * canvasScale * canvasScale + 'px' , top: offy + 'px', width: 26 * canvasScale + 'px', height: 26 * canvasScale + 'px' }"
        @mousedown.stop="$event => rotateElement($event, elementInfo)"
      />
      <MoveHandler
        :style="{ left: scaleWidth / 2 + 22 * canvasScale  - 8 * canvasScale * canvasScale + 'px' , top: offy + 'px', width: 26 * canvasScale + 'px', height: 26 * canvasScale + 'px' }"
        @mousedown.stop="$event => dragElement($event, elementInfo)"
      />
      <TextElementMenu
        :style="{
          // left: menuOffX * canvasScale + scaleWidth / 2 - 350 * (canvasScale > 1 ? 1 : canvasScale) + 'px', 
          // top: menuOffY * canvasScale - 58 * (canvasScale > 1 ? 1 : canvasScale) + 'px',
          transform: `translate(${menuOffX}px, ${menuOffY}px) rotate(${-elementInfo.rotate}deg)`,
          'transform-origin': `${0}px ${0}px`, /* 设置旋转中心为偏移100px, 200px的位置 */
          }"
        @mousedown.stop=""
      />
    </template>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import type { PPTTextElement, PPTElement } from '@/types/slides'
import type { OperateResizeHandlers } from '@/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'

import VerticalScaleHandler from './VerticalScaleHandler.vue'
import RotateHandler from './RotateHandler.vue'
import MoveHandler from './MoveHandler.vue'
import ResizeHandler from './ResizeHandler.vue'
import BorderLine from './BorderLine.vue'
import TextElementMenu from './TextElementMenu.vue'

const props = defineProps<{
  elementInfo: PPTTextElement
  handlerVisible: boolean
  rotateElement: (e: MouseEvent, element: PPTTextElement) => void
  scaleElement: (e: MouseEvent, element: PPTTextElement, command: OperateResizeHandlers) => void
  dragElement: (e: MouseEvent | TouchEvent, element: PPTElement) => void
}>()

const { canvasScale } = storeToRefs(useMainStore())


const scaleWidth = computed(() => props.elementInfo.width * canvasScale.value)
const scaleHeight = computed(() => props.elementInfo.height * canvasScale.value)
const offy = computed(() => (props.elementInfo.height + 10) * canvasScale.value)
const menuOffX = ref(0)
const menuOffY = ref(0)

const { textElementResizeHandlers, verticalTextElementResizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)
const resizeHandlers = computed(() => props.elementInfo.vertical ? verticalTextElementResizeHandlers.value : textElementResizeHandlers.value)

let playFrame = true
onMounted(() => {
  playFrame = true
  // console.log('start next frame')
  const nextFrame = () => {
    if (!playFrame) return
    const scale = canvasScale.value
    const width = props.elementInfo.width
    const height = props.elementInfo.height
    let rad = props.elementInfo.rotate
    while (rad < -180) rad += 360
    while (rad > 180) rad -= 360
    const rot = props.elementInfo.rotate * Math.PI / 180
    let offx = 0
    let offy = 0
    const off = Math.sqrt(width * width * 0.25 + height * height * 0.25)
    if (rad >= 0 && rad < 90) {
      if (canvasScale.value < 1) {
        offx = -700 * 0.5
        offy = -48 - 10
      }
      else {
        offx = -700 * 0.5 / scale
        offy = -48 / scale - 10
      }
      const startRot = Math.atan2(-height, -width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    else if (rad >= 90 && rad <= 180) {
      if (canvasScale.value < 1) {
        offx = -700 * 0.5
      }
      else {
        offx = -700 * 0.5 / scale
      }
      offy = 10
      const startRot = Math.atan2(-height, width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    else if (rad < -90 && rad >= -180) {
      if (canvasScale.value < 1) {
        offx = -700 * 0.5
      }
      else {
        offx = -700 * 0.5 / scale
      }
      offy = 10
      const startRot = Math.atan2(-height, -width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    else {
      if (canvasScale.value < 1) {
        offx = -700 * 0.5
        offy = -48 - 10
      }
      else {
        offx = -700 * 0.5 / scale
        offy = -48 / scale - 10
      }
      const startRot = Math.atan2(-height, width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    const offlen = Math.sqrt(offx * offx + offy * offy)
    const offrot = Math.atan2(offy, offx)
    const newoffx = offlen * Math.cos(-rot + offrot)
    const newoffy = offlen * Math.sin(-rot + offrot)
    menuOffX.value = newoffx * scale + width * 0.5 * scale
    menuOffY.value = newoffy * scale + height * 0.5 * scale
    requestAnimationFrame(nextFrame)
  }
  requestAnimationFrame(nextFrame)
})


onUnmounted(() => {
  playFrame = false
  // console.log('onDispose next frame')
})
</script>