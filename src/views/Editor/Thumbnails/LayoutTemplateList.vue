<template>
    <div class="layout-pool">
      <div class="category" v-for="item in layoutTemplates" :key="item.type">
        <div class="category-name">{{item.type}}</div>
        <div class="layout-list">
          <div
            class="layout-item"
            v-for="slide in item.children" 
            :key="slide.id"
            @click="selectSlideTemplate(slide)"
          >
            <ThumbnailSlide class="thumbnail" :slide="slide" :size="130" />
          </div>
        </div>
      </div>
    </div>
</template>
  
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import ThumbnailSlide from '@/views/components/ThumbnailSlide/ThumbnailSlideNew.vue'

const emit = defineEmits<{
  (event: 'select', payload: Slide): void
}>()

const { layoutTemplates } = storeToRefs(useSlidesStore())

const selectSlideTemplate = (slide: Slide) => {
  emit('select', slide)
}
</script>
  
<style lang="scss" scoped>
.layout-pool {
  width: 100%;
  height: 490px;
  padding: 2px;
  margin-right: -12px;
  padding-right: 12px;
  overflow: auto;
}

.category-name {
  width: 100%;
  font-size: 13px;
  margin-bottom: 10px;
  // border-left: 4px solid #aaa;
  // background-color: #ddd;
  color: $textColor;
}

.layout-list {
  @include flex-grid-layout();

  margin-bottom: 10px;
}

// .layout-item {
//   @include flex-grid-layout-children(10, 8%);
//   height: 0;
//   padding-bottom: 8%;
//   flex-shrink: 0;
// }

.layout-text {
  width: 100%;
  color: $textColor;
  font-size: 13px;
  margin-bottom: 10px;
}

.layout-item {
  @include flex-grid-layout-children(3, 31%);

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