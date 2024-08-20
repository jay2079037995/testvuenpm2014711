<template>
  <div class="layout">
    <div class="layout-text">{{ $t('selectLayouts') }}</div>
    <div class="layout-pool">
      <div 
        class="layout-item"
        v-for="slide in layouts" 
        :key="slide.id"
        @click="selectSlideTemplate(slide)"
      >
        <ThumbnailSlide class="thumbnail" :slide="slide" :size="180" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'

const emit = defineEmits<{
  (event: 'select', payload: Slide): void
}>()

const { layouts } = storeToRefs(useSlidesStore())

const selectSlideTemplate = (slide: Slide) => {
  emit('select', slide)
}
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  width: 394px;
  padding-left: 5px;
}

.layout-pool {
  width: 100%;
  height: 480px;
  padding: 2px;
  margin-right: -12px;
  padding-right: 12px;
  overflow: auto;

  @include flex-grid-layout();
}

.layout-text {
  width: 100%;
  color: $textColor;
  font-size: 14px;
  margin-bottom: 15px;
}

.layout-item {
  @include flex-grid-layout-children(2, 48%);

  &:nth-last-child(2), &:last-child {
    margin-bottom: 0;
  }

  .thumbnail {
    outline: 2px solid $boxStrokeColor;
    border-radius: $borderRadius;
    transition: outline $transitionDelay;
    cursor: pointer;

    &:hover {
      outline-color: $themeColor;
    }
  }
}
</style>