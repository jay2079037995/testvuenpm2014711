<template>
  <div class="container">
    <div class="left_content">
      <div class="left_item"
        v-for="leftItem in leftListData" :key="leftItem"
        :class="{ 'active': selectedLeftItem === leftItem }"
        @click="updateSelectedLeftItem(leftItem)"
      >
        {{leftItem}}
      </div>
    </div>
    <div class="right_content">
      <div class="right_top">
        <div class="right_top_item"
          v-for="rightTopItem in rightTopData" :key="rightTopItem"
          :class="{ 'active': selectedRightTopItem === rightTopItem }"
          @click="updateSelectedRightTopItem(rightTopItem)"
        >
          {{rightTopItem}}
        </div>
      </div>
      <div class="right_list">
        <CardTemplateList @select="slide => { selectSlideTemplate(slide); }"
          :leftItemValue="selectedLeftItem" @leftItemClick="updateFromChild"
          :rightTopItemValue="selectedRightTopItem"
          @leftItemChange="(categoryType: any) => scrollToCategory?.(categoryType)"
        />
      </div>
      <svg-icon class="right_top_close" icon="close" color="#000" size="18" @click="rightTopCloseClick()"/>
   </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import CardTemplateList from './../CardTemplateList.vue'
import type { Slide } from '@/types/slides'

const leftListData: string[] = ['Cover', 'Outline', 'Chapter', 'End page', 'Main content', 'Texts', 'Charts']
const rightTopData: string[] = ['Variation1', 'Variation2', 'Variation3', 'Variation4', 'Variation5', 'Variation6']

withDefaults(defineProps<{
  leftValue: string
  rightTopValue: string
}>(), {
  leftValue: 'Cover',
  rightTopValue: 'Variation1',
})

const selectedLeftItem = ref('Cover')
const selectedRightTopItem = ref('Variation1')
const categoryRefs = ref<{ [key: string]: HTMLElement | null }>({})

const scrollToCategory = (categoryType: string) => {
  nextTick(() => {
    const targetRef = categoryRefs.value[categoryType]
    if (targetRef) {
      // 这里简化处理，实际应用中可能需要更复杂的滚动逻辑，如使用scrollIntoView等
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    else {
      console.warn(`No scroll 11 reference found for category: ${categoryType}`)
      // 这里可以添加额外的逻辑，比如默认滚动到顶部或其他处理
    }
  })
}

const emit = defineEmits<{
  (event: 'select', payload: Slide): void,
  // (event: 'update:selectedLeftItem', payload: string): void
  // (event: 'update:selectedRightTopItem', payload: string): void
  (event: 'closeDialog', payload: boolean): void
}>()

const selectSlideTemplate = (slide: Slide) => {
  emit('select', slide)
}

const updateFromChild = (newValue: string) => {
  // emit('update:selectedLeftItem', item)
  if (selectedLeftItem.value !== newValue) {
    selectedLeftItem.value = newValue
  }
}

const updateSelectedLeftItem = (item: string) => {
  // emit('update:selectedLeftItem', item)
  selectedLeftItem.value = item
  scrollToCategory(item)
}

const updateSelectedRightTopItem = (item: string) => {
  // emit('update:selectedRightTopItem', item)
  // console.log('updateSelectedRightTopItem', item)
  selectedRightTopItem.value = item
}

const rightTopCloseClick = () => {
  emit('closeDialog', true)
}
</script>
   
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.left_content {
  width: 100px; /* 左侧宽度固定为100px */
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;

  .left_item {
    height: 30px;
    width: 100%;
    font-size: 12px;
    color: #545454;
    display: flex; /* 使用Flex布局 */
    align-items: center; /* 垂直居中对齐文本 */
    justify-content: center; /* 水平居中对齐文本 */
    text-align: center;

    &:hover {
      // border-bottom: 2px solid var(--color, $themeColor);
      background-color: #2aba8a90;
      border-radius: 5px;
      color: #fff;
    }

    &.active {
      background-color: #2aba8a;
      border-radius: 5px;
      color: #fff;
    }
  }
}

.right_content {
  flex-grow: 1; /* 右侧自适应剩余空间 */
  display: flex;
  margin-left: 10px;
  flex-direction: column;
}

.right_top_close {
  position: absolute;
  top: 0;
  background-color: #fff;
  border-radius: 50%;
  padding: 10px;
  right: 0;
  margin-top: 8px;
  margin-right: 8px;
  cursor: pointer;

  &:active {
    color: #0009;
    background-color: #0009;
  }

  &:hover {
    color: #0009;
    background-color: #0001;
  }
}

.right_top {
  height: 32px;
  background-color: #f9f9f9;
  border-radius: 5px;
  margin-right: 40px;
  display: flex;
  line-height: 1;
  user-select: none;

  .right_top_item {
    height: 28px;
    margin: 2px;
    width: 90px;
    font-size: 12px;
    color: #545454;
    display: flex; /* 使用Flex布局 */
    align-items: center; /* 垂直居中对齐文本 */
    justify-content: center; /* 水平居中对齐文本 */
    text-align: center;

    &.active {
      background-color: #fff !important; /* 或者使用更具体的选择器提升优先级，而不是使用 !important */
      border-radius: 5px;
      color: #000;
    }

    &:hover:not(.active) {
      background-color: #fff8;
      border-radius: 5px;
      color: #0008;
    }

    &:active:not(.active) {
      background-color: #fff8;
      border-radius: 5px;
      color: #0008;
    }
  }
}

.right_list {
  overflow-y: auto;
  margin-top: 10px;
  padding-left: 10px;
  width: 610px;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
}

</style>