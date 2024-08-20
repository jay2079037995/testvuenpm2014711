<template>
  <div class="thumbnail">
    <div class="thumbnail-slide"
      :style="{
        width: size + 'px',
        height: (size * viewportRatio) + 'px',
      }"
    >
      <div 
        class="elements"
        :style="{
          width: VIEWPORT_SIZE + 'px',
          height: VIEWPORT_SIZE * viewportRatio + 'px',
          transform: `scale(${scale})`,
          }"
        v-if="visible"
      >
        <div class="background" :style="backgroundStyle"></div>
        <ThumbnailElement
          v-for="(element, index) in slide.elements"
          :key="element.id"
          :elementInfo="element"
          :elementIndex="index + 1"
        />
      </div>
      <div class="placeholder" v-else>{{ $t('loading') }}</div>
    </div>
    <div class="layout-name">{{ slide.name ?? '' }}</div>
  </div>
</template>
  
<script lang="ts" setup>
import { computed, provide } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import { injectKeySlideScale } from '@/types/injectKey'
import { VIEWPORT_SIZE } from '@/configs/canvas'
import useSlideBackgroundStyle from '@/hooks/useSlideBackgroundStyle'
  
import ThumbnailElement from './ThumbnailElement.vue'
  
const props = withDefaults(defineProps<{
  slide: Slide
  size: number
  visible?: boolean
}>(), {
  visible: true,
})
  
const { viewportRatio } = storeToRefs(useSlidesStore())
  
const background = computed(() => props.slide.background)
const { backgroundStyle } = useSlideBackgroundStyle(background)
  
const scale = computed(() => props.size / VIEWPORT_SIZE)
provide(injectKeySlideScale, scale)
</script>
  
<style lang="scss" scoped>
.thumbnail {
  overflow: auto;
  user-select: none;
}

.thumbnail-slide {
  background-color: #fff;
  overflow: hidden;
}

.elements {
  transform-origin: 0 0;
}

.background {
  width: 100%;
  height: 100%;
  background-position: center;
  position: absolute;
}

.layout-name {
  width: 100%;
  height: 20px;
  font-size: 12px;
  margin: 5px 0;
  // border-left: 4px solid #aaa;
  // background-color: #ddd;
  padding: 2px 0 2px 2px;
  color: #3d3d3d;
  text-align: center;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>