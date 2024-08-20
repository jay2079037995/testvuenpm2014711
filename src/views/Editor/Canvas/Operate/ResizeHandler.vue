<template>
  <div :class="['resize-handler', rotateClassName, type]"
  :style="{
    width: type === 'top' || type === 'bottom' ? '20px' : type === 'left' || type === 'right' ? '6px' : '10px',
    height: type === 'top' || type === 'bottom' ? '6px' : type === 'left' || type === 'right' ? '20px' : '10px',
    margin: type === 'top' || type === 'bottom' ? '-3px 0 0 -12px' : type === 'left' || type === 'right' ? '-12px 0 0 -3px' : '-5px 0 0 -5px',
    'border-radius': type === 'left' || type === 'right' || type === 'top' || type === 'bottom' ? '4px' : '50%',
  }"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { OperateResizeHandlers } from '@/types/edit'

const props = withDefaults(defineProps<{
  type?: OperateResizeHandlers
  rotate?: number,
  rect?: string
}>(), {
  rotate: 0,
})

const rotateClassName = computed(() => {
  const prefix = 'rotate-'
  const rotate = props.rotate
  if (rotate > -22.5 && rotate <= 22.5) return prefix + 0
  else if (rotate > 22.5 && rotate <= 67.5) return prefix + 45
  else if (rotate > 67.5 && rotate <= 112.5) return prefix + 90
  else if (rotate > 112.5 && rotate <= 157.5) return prefix + 135
  else if (rotate > 157.5 || rotate <= -157.5) return prefix + 0
  else if (rotate > -157.5 && rotate <= -112.5) return prefix + 45
  else if (rotate > -112.5 && rotate <= -67.5) return prefix + 90
  else if (rotate > -67.5 && rotate <= -22.5) return prefix + 135
  return prefix + 0
})
</script>

<style lang="scss" scoped>
.resize-handler {
  position: absolute;
  width: 10px;
  height: 10px;
  left: 0;
  top: 0;
  margin: -5px 0 0 -5px;
  border: 1px solid $themeColor;
  background-color: #fff;
  border-radius: 1px;
  cursor: pointer;

  &.left-top.rotate-0,
  &.right-bottom.rotate-0,
  &.left.rotate-45,
  &.right.rotate-45,
  &.left-bottom.rotate-90,
  &.right-top.rotate-90,
  &.top.rotate-135,
  &.bottom.rotate-135 {
    cursor: nwse-resize;
  }
  &.top.rotate-0,
  &.bottom.rotate-0,
  &.left-top.rotate-45,
  &.right-bottom.rotate-45,
  &.left.rotate-90,
  &.right.rotate-90,
  &.left-bottom.rotate-135,
  &.right-top.rotate-135 {
    cursor: ns-resize;
  }
  &.left-bottom.rotate-0,
  &.right-top.rotate-0,
  &.top.rotate-45,
  &.bottom.rotate-45,
  &.left-top.rotate-90,
  &.right-bottom.rotate-90,
  &.left.rotate-135,
  &.right.rotate-135 {
    cursor: nesw-resize;
  }
  &.left.rotate-0,
  &.right.rotate-0,
  &.left-bottom.rotate-45,
  &.right-top.rotate-45,
  &.top.rotate-90,
  &.bottom.rotate-90,
  &.left-top.rotate-135,
  &.right-bottom.rotate-135 {
    cursor: ew-resize;
  }
}
</style>