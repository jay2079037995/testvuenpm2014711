<template>
  <div 
    class="viewport-background"
    :style="backgroundStyle"
  >
    <GridLines v-if="gridLineSize" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement, SlideBackground } from '@/types/slides'
import GridLines from './GridLines.vue'
import useSlideBackgroundStyle from '@/hooks/useSlideBackgroundStyle'
import { SlidesState } from '@/store/slides'

const props = defineProps<{
  slide: any
}>()

const { gridLineSize } = storeToRefs(useMainStore())
const { currentSlide } = storeToRefs(useSlidesStore())
const background = computed<SlideBackground | undefined>(() => props.slide.background)

const { backgroundStyle } = useSlideBackgroundStyle(background)
</script>

<style lang="scss" scoped>
.viewport-background {
  width: 100%;
  height: 100%;
  background-position: center;
  border-radius: 10px;
  position: absolute;
}
</style>
