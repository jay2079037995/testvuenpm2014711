<template>
  <div class="shape-element-operate">
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
        :style="{ left: scaleWidth / 2 - 8 * canvasScale * canvasScale + 'px' , top: (props.elementInfo.height + 20) * canvasScale + 'px', width: 26 * canvasScale + 'px', height: 26 * canvasScale + 'px' }"
        @mousedown.stop="$event => rotateElement($event, elementInfo)"
      />
      <div 
        class="operate-keypoint-handler" 
        v-if="elementInfo.keypoint !== undefined"
        :style="keypointStyle"
        @mousedown.stop="$event => moveShapeKeypoint($event, elementInfo)"
      ></div>
      <ShapeElementMenu
        :style="{
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
import type { PPTShapeElement } from '@/types/slides'
import type { OperateResizeHandlers } from '@/types/edit'
import { SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import useCommonOperate from '../hooks/useCommonOperate'

import RotateHandler from './RotateHandler.vue'
import ResizeHandler from './ResizeHandler.vue'
import BorderLine from './BorderLine.vue'
import ShapeElementMenu from './ShapeElementMenu.vue'
import VerticalScaleHandler from './VerticalScaleHandler.vue'

const props = defineProps<{
  elementInfo: PPTShapeElement
  handlerVisible: boolean
  rotateElement: (e: MouseEvent, element: PPTShapeElement) => void
  scaleElement: (e: MouseEvent, element: PPTShapeElement, command: OperateResizeHandlers) => void
  moveShapeKeypoint: (e: MouseEvent, element: PPTShapeElement) => void
}>()

const { canvasScale } = storeToRefs(useMainStore())

const scaleWidth = computed(() => props.elementInfo.width * canvasScale.value)
const scaleHeight = computed(() => props.elementInfo.height * canvasScale.value)
const { resizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)

const keypointStyle = computed(() => {
  if (!props.elementInfo.pathFormula || props.elementInfo.keypoint === undefined) return {}

  const pathFormula = SHAPE_PATH_FORMULAS[props.elementInfo.pathFormula]
  if ('editable' in pathFormula) {
    const keypointPos = pathFormula.getBaseSize(props.elementInfo.width, props.elementInfo.height) * props.elementInfo.keypoint
    if (pathFormula.relative === 'left') return { left: keypointPos * canvasScale.value + 'px' }
    if (pathFormula.relative === 'right') return { left: (props.elementInfo.width - keypointPos) * canvasScale.value + 'px' }
    if (pathFormula.relative === 'center') return { left: (props.elementInfo.width - keypointPos) / 2 * canvasScale.value + 'px' }
    if (pathFormula.relative === 'top') return { top: keypointPos * canvasScale.value + 'px' }
    if (pathFormula.relative === 'bottom') return { top: (props.elementInfo.height - keypointPos) * canvasScale.value + 'px' }
  }
  return {}
})

const menuOffX = ref(0)
const menuOffY = ref(0)

let playFrame = true
onMounted(() => {
  playFrame = true
  console.log('start next frame')
  const nextFrame = () => {
    if (!playFrame) return
    const scale = canvasScale.value
    const width = props.elementInfo.width
    const height = props.elementInfo.height
    const rad = props.elementInfo.rotate
    const rot = props.elementInfo.rotate * Math.PI / 180
    let offx = 0
    let offy = 0
    const off = Math.sqrt(width * width * 0.25 + height * height * 0.25)
    if (rad >= 0 && rad < 90) {
      if (canvasScale.value < 1) {
        offx = -400 * 0.5
        offy = -48 - 10
      }
      else {
        offx = -400 * 0.5 / scale
        offy = -48 / scale - 10
      }
      const startRot = Math.atan2(-height, -width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    else if (rad >= 90 && rad <= 180) {
      if (canvasScale.value < 1) {
        offx = -400 * 0.5
      }
      else {
        offx = -400 * 0.5 / scale
      }
      offy = 10
      const startRot = Math.atan2(-height, width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    else if (rad < -90 && rad >= -180) {
      if (canvasScale.value < 1) {
        offx = -400 * 0.5
      }
      else {
        offx = -400 * 0.5 / scale
      }
      offy = 10
      const startRot = Math.atan2(-height, -width)
      const offRot = startRot + rot
      offy += off * Math.sin(offRot)
    }
    else {
      if (canvasScale.value < 1) {
        offx = -400 * 0.5
        offy = -48 - 10
      }
      else {
        offx = -400 * 0.5 / scale
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
  console.log('onDispose next frame')
})
</script>

<style lang="scss" scoped>
.operate-keypoint-handler {
  position: absolute;
  width: 10px;
  height: 10px;
  left: 0;
  top: 0;
  margin: -5px 0 0 -5px;
  border: 1px solid $themeColor;
  background-color: #ffe873;
  border-radius: 1px;
}
</style>