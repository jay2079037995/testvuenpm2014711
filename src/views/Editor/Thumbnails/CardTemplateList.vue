<template>
  <div class="layout-pool" @scroll="handleScroll($event)" :id="'categoryRef'">
    <div class="category" v-for="item in cardLayouts" 
      :key="item.type" @click="triggerLeftItemChangeEvent(item.type)"
      :ref="setCategoryRef" :id="item.type"
    >
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
import { ref, onMounted, watchEffect, toRefs, onBeforeUnmount, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import type { SlideTypeItem } from '@/store/slides'
import ThumbnailSlide from '@/views/components/ThumbnailSlide/ThumbnailSlideNew.vue'

const props = defineProps<{
  leftItemValue?: string;
  rightTopItemValue?: string;
  scrollToCategory?: (categoryType: string) => void
}>()

const { leftItemValue, rightTopItemValue, scrollToCategory } = toRefs(props)
const scrollTimeout = ref<number | null>(null)
const isScrolling = ref(false)
const currentLeftItem = ref('Cover')
const currentRightTopItem = ref('Variation1')

const handleScroll = (e: Event) => {
  if (!isScrolling.value) {
    isScrolling.value = true
    clearTimeout(scrollTimeout.value === null ? undefined : scrollTimeout.value)
    scrollTimeout.value = setTimeout(() => {
      isScrolling.value = false
      detectVisibleCategories(e)
    }, 100)
  }
}

const detectVisibleCategories = (e: Event) => {
  // const windowHeight = window.innerHeight
  const windowHeight = (e.target as HTMLElement).clientHeight - 15
  const scrollTop = (e.target as HTMLElement).scrollTop
  // console.log('detectVisibleCategories 111 scrollTop:%s, windowHeight:%s', scrollTop, windowHeight)
  const visibleItems: string[] = []
  categoryRefs.value.forEach((categoryEl) => {
    const offsetTop = categoryEl.offsetTop - 50
    const offsetBottom = offsetTop + categoryEl.offsetHeight
    // console.log('detectVisibleCategories 111 offsetTop:%s, offsetBottom:%s ,categoryEl:%o', offsetTop, offsetBottom, categoryEl)
    if (offsetTop <= scrollTop + windowHeight && offsetBottom >= scrollTop) {
      visibleItems.push(categoryEl.id)
    }
  })
  const firstVisibleItem = visibleItems.length > 0 ? visibleItems[0] : undefined
  // console.log('当前可视区域内的item.firstVisibleItem:%o, visibleItems:%o', firstVisibleItem, visibleItems)
  if (firstVisibleItem) {
    triggerLeftItemChangeEvent(firstVisibleItem)
  }
}

// 在组件挂载后立即尝试滚动到指定类别
onMounted(() => {
  // console.log('scrollToCategory 22 is not a function %o', scrollToCategory.value)
  if (scrollToCategory.value && typeof scrollToCategory.value === 'function') {
    scrollToCategory.value(leftItemValue.value ?? 'Cover')
  }
  else {
    console.warn('scrollToCategory onMounted is not a function %o', scrollToCategory.value)
  }

  const container = document.querySelector('.layout-pool') // layout-pool是滚动容器
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

watchEffect(() => {
  // 维持原有的watchEffect逻辑，以便在props变化时响应
  // console.log('scrollToCategory 33 is not a function %o', scrollToCategory)
  if (scrollToCategory.value && typeof scrollToCategory.value === 'function') {
    scrollToCategory.value(leftItemValue.value ?? 'Cover')
  }
  else {
    console.warn('scrollToCategory watchEffect is not a function %o', scrollToCategory)
  }
})

// 在组件卸载前，移除滚动事件监听器
onBeforeUnmount(() => {
  const container = document.querySelector('.layout-pool')
  // console.log('onBeforeUnmount 44 container %o', container)
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})

watch(
  () => [leftItemValue.value, rightTopItemValue.value],
  ([newLeftValue, newRightTopValue]) => {
    if (newLeftValue && currentLeftItem.value !== newLeftValue) {
      // console.log('watch(() => [leftItemValue.value] 00 (newLeftValue) %s', newLeftValue)
      // document.getElementById(newLeftValue)?.scrollIntoView({ behavior: 'smooth' })
      document.getElementById(newLeftValue)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      currentLeftItem.value = newLeftValue
    }

    if (newRightTopValue && currentRightTopItem.value !== newRightTopValue) {
      // console.log('watch(() => [rightTopItemValue.value] 11 (newValue):%s, filterCardLayouts:%o', newRightTopValue, filterCardLayouts.value)
      currentRightTopItem.value = newRightTopValue
      console.log('watch(() => [rightTopItemValue.value] 22 (currentRightTopItem):%s, rightTopItemValue:%o', currentRightTopItem.value, newRightTopValue)
    }
  },
  { immediate: true } // 添加此选项以在初始渲染时立即触发watcher
)

const { cardLayouts } = storeToRefs(useSlidesStore())
const filterCardLayouts = computed(() => {
  console.log('filterCardLayouts 33 (rightTopItemValue) %s, (currentRightTopItem) %s', rightTopItemValue.value, currentRightTopItem.value)
  return cardLayouts.value.filter((slideTypeItem: SlideTypeItem) => slideTypeItem.type === currentRightTopItem.value)
})

const categoryRefs = ref<HTMLElement[]>([])
// 用于设置ref的函数，这里简单示例，实际情况可能需要更复杂的逻辑处理
const setCategoryRef = (el: any) => {
  if (el && (el instanceof HTMLElement) && !categoryRefs.value.includes(el)) {
    categoryRefs.value.push(el)
  }
}

const emit = defineEmits<{
  (event: 'select', payload: Slide): void
  (event: 'leftItemClick', payload: string): void;
}>()
  
const selectSlideTemplate = (slide: Slide) => {
  emit('select', slide)
}

const triggerLeftItemChangeEvent = (type: string) => {
  emit('leftItemClick', type)
  if (currentLeftItem.value !== type) {
    currentLeftItem.value = type
  }
}

</script>
  
<style lang="scss" scoped>
.layout-pool {
  width: 100%;
  height: 490px;
  padding: 2px;
  padding-right: 6px;
  overflow: auto;

  // @include flex-grid-layout();
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

.layout-text {
  width: 100%;
  color: $textColor;
  font-size: 13px;
  margin-bottom: 10px;
}

.layout-item {
  @include flex-grid-layout-children(4, 24%);

  &:nth-last-child(2), &:last-child {
    margin-bottom: 0;
  }

  .thumbnail {
    outline: 2px solid $boxStrokeColor;
    border-radius: $borderRadius;
    transition: outline $transitionDelay;
    background-color: #fff;
    cursor: pointer;

    &:hover {
      outline-color: $themeColor;
    }
  }
}
</style>