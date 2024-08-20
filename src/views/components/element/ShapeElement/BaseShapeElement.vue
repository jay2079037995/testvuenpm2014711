<template>
  <div 
    class="base-element-shape"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
      height: elementInfo.height + 'px',
    }"
  >
    <div
      class="rotate-wrapper"
      :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
    >
      <div 
        class="element-content"
        :style="{
          opacity: elementInfo.opacity,
          filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
          transform: flipStyle,
          color: text.defaultColor,
          fontFamily: text.defaultFontName,
          lineHeight: text.lineHeight,
          writingMode: text.vertical ? 'vertical-rl' : 'horizontal-tb',
        }"
      >
        <svg 
          overflow="visible" 
          :width="elementInfo.width"
          :height="elementInfo.height"
        >
          <defs v-if="elementInfo.gradient">
            <GradientDefs
              :id="`base-gradient-${elementInfo.id}`" 
              :type="elementInfo.gradient.type"
              :color1="elementInfo.gradient.color[0]"
              :color2="elementInfo.gradient.color[1]"
              :rotate="elementInfo.gradient.rotate"
            />
          </defs>
          <g 
            :transform="`scale(${scaleW}, ${scaleH}) translate(0,0) matrix(1,0,0,1,0,0)`"
          >
            <path 
              vector-effect="non-scaling-stroke" 
              stroke-linecap="butt" 
              stroke-miterlimit="8"
              :d="elementInfo.path" 
              :fill="elementInfo.gradient ? `url(#base-gradient-${elementInfo.id})` : elementInfo.fill"
              :stroke="outlineColor"
              :stroke-width="outlineWidth" 
              :stroke-dasharray="strokeDashArray" 
            ></path>
          </g>
        </svg>

        <div class="shape-text" :class="text.align">
          <div class="ProseMirror-static" v-html="text.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { PPTShapeElement, ShapeText } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useElementFlip from '@/views/components/element/hooks/useElementFlip'
import useElementSVGScale from '@/views/components/element/hooks/useElementSVGScale'

import GradientDefs from './GradientDefs.vue'
import i18n from '@/assets/locales/index'

const props = defineProps<{
  elementInfo: PPTShapeElement
}>()

const outline = computed(() => props.elementInfo.outline)
const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)

const shadow = computed(() => props.elementInfo.shadow)
const { shadowStyle } = useElementShadow(shadow)

const flipH = computed(() => props.elementInfo.flipH)
const flipV = computed(() => props.elementInfo.flipV)
const { flipStyle } = useElementFlip(flipH, flipV)

const viewBox = computed(() => props.elementInfo.viewBox)
const width = computed(() => props.elementInfo.width)
const height = computed(() => props.elementInfo.height)
const { scaleW, scaleH } = useElementSVGScale(viewBox, width, height)

const text = computed<ShapeText>(() => {
  const defaultText: ShapeText = {
    content: '',
    defaultFontName: i18n.global.t('font.microsoftYahei'),
    defaultColor: '#000',
    align: 'middle',
  }
  if (!props.elementInfo.text) return defaultText

  return props.elementInfo.text
})
</script>

<style lang="scss" scoped>
.base-element-shape {
  position: absolute;
}
.rotate-wrapper {
  width: 100%;
  height: 100%;
}
.element-content {
  width: 100%;
  height: 100%;
  position: relative;

  svg {
    position: absolute;
    transform-origin: 0 0;
    overflow: visible;
  }
}
.shape-text {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2px;
  right: 0;
  display: flex;
  flex-direction: column;
  padding-top: 1px;
  padding-left: 2px;
  padding-bottom: 1px;
  padding-right: 1px;
  line-height: 1.0;
  word-break: break-word;

  &.top {
    justify-content: flex-start;
  }
  &.middle {
    justify-content: center;
  }
  &.bottom {
    justify-content: flex-end;
  }
}
</style>
