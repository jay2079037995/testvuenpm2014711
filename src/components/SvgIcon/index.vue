<template>
    <div
      v-if="isExternal"
      :style="styleExternalIcon"
      class="svg-external-icon svg-icon"
      :class="className"
    />
    <svg v-else class="svg-icon" :class="className" aria-hidden="true" :style="getStyle">
      <use :xlink:href="iconName" :fill="color"/>
    </svg>
  </template>
  
<script lang="ts" setup>
import { isExternal as external } from '@/utils/validate'
import { type CSSProperties, defineProps, computed } from 'vue'
  
const props = defineProps({
  // icon 图标
  icon: {
    type: String,
    required: true
  },
  // 图标类名
  className: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: 'icon'
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#00000000'
  },
  size: {
    type: [Number, String],
    default: 24
  }
})
  
/**
   * 判断是否为外部图标
   */
const isExternal = computed(() => external(props.icon))
/**
 * 外部图标样式
 */
const styleExternalIcon = computed(() => ({
  mask: `url(${props.icon}) no-repeat 50% 50%`,
  '-webkit-mask': `url(${props.icon}) no-repeat 50% 50%`
}))
/**
  * 项目内图标
  */
const iconName = computed(() => `#icon-${props.icon}`)

// const symbolId = computed(() => `#${props.prefix}-${props.name}`)

const getStyle = computed((): CSSProperties => {
  const size = `${props.size.toString().replace('px', '')}px`
  return {
    width: size,
    height: size
  }
})

</script>
  
<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>
  
  