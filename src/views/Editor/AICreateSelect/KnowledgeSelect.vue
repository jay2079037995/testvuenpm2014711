<template>
  <div class="layout" :style="{ width: `${props.popoverWidth}px` }">
    <div class="layout_content">
      <div v-if="knowledgeDatas.length > 0" class="layout_content_list" >
        <div v-for="knowledgeData in knowledgeDatas" :key="knowledgeData.id" 
          class="layout_content_item" @click="handleSelectItemClick(knowledgeData, $event)">
          <!--  -->
          <div class="content_item_left">
            <Checkbox @update:value="value => handleCheckboxItemClick(!value, knowledgeData)"
              :value="isItemSelected(knowledgeData)" 
            />
          </div>
          <svg-icon class="content_item_left_icon" icon="file-pptx" size="20"/>
          <div class="content_item_name">{{ knowledgeData.name }}</div>
          <svg-icon class="content_item_right" icon="icon_book" size="14"/>
        </div>
      </div>
      <div v-else class="layout_no_content">
        <div class="layout_no_content_tip" >暂无数据</div>
      </div>
    </div>
    <button class="layout_close" @click="handleKnowledgeClose">close</button>
  </div>
</template>
<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { KnowledgeData } from './CreateSelectInput.vue'
import Checkbox from '@/components/Checkbox.vue'

const props = defineProps({
  knowledgeDatas: { type: Array as PropType<KnowledgeData[]>, required: true },
  selectKnowledgeDatas: { type: Array as PropType<KnowledgeData[]>, required: true },
  popoverWidth: { type: Number, required: false, default: 695,
  }
})
const localSelectedItems = ref([...props.selectKnowledgeDatas])
const isItemSelected = (knowledgeData: KnowledgeData): boolean => {
//   return props.selectKnowledgeDatas.some((selectedItem: KnowledgeData) => selectedItem.id === knowledgeData.id)
  return localSelectedItems.value.some((selectedItem: KnowledgeData) => selectedItem.id === knowledgeData.id)
}

const emit = defineEmits([
  'selectKnowledgeItemClick',
  'removeKnowledgeItemClick',
  'closeKnowledgeSelect'
])

const handleSelectItemClick = (knowledgeData: KnowledgeData, event: Event) => {
  event.stopPropagation()
  const isChecked = isItemSelected(knowledgeData)
  // console.log('handleSelectItemClick 0000 isChecked:%s, length:%o', isChecked, localSelectedItems.value.length)
  handleCheckboxItemClick(!isChecked, knowledgeData)
}

const handleCheckboxItemClick = (isChecked: boolean, knowledgeData: KnowledgeData) => {
  // console.log('handleCheckboxItemClick 1111 isChecked:%s, length:%o', isChecked, localSelectedItems.value.length)
  if (isChecked) {
    if (!isItemSelected(knowledgeData)) {
      localSelectedItems.value.push(knowledgeData)
      // console.log('handleCheckboxItemClick 2222 isChecked:%s, length:%o', isItemSelected(knowledgeData), localSelectedItems.value.length)
      emit('selectKnowledgeItemClick', knowledgeData)
    }
  }
  else {
    if (isItemSelected(knowledgeData)) {
      localSelectedItems.value = localSelectedItems.value.filter(k => k.id !== knowledgeData.id)
      // console.log('handleCheckboxItemClick 3333 isChecked:%s, length:%o', isItemSelected(knowledgeData), localSelectedItems.value.length)
      emit('removeKnowledgeItemClick', knowledgeData)
    }
  }
  // console.log('handleCheckboxItemClick 4444 newLength:%s, knowledgeData:%o', localSelectedItems.value.length, knowledgeData)
}

const handleKnowledgeClose = () => {
  emit('closeKnowledgeSelect', true)
}

</script>
<style lang="scss" scoped>
.layout {
  display: flex; /* 改为网格布局以便更好地控制子元素位置 */
  width: 695px;
  min-height: 100px;
  max-height: 230px;
}

.layout_close {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  padding: 5px;
  height: 25px;
  width: 50px;
}

.layout_content {
  padding: 10px 15px;
  display: flex;
  flex-grow: 1;
  position: relative;
}

.layout_content_list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none; // 隐藏Firefox的滚动条
  // 隐藏滚动条的样式
  &::-webkit-scrollbar {
    display: none;
  }

  .layout_content_item {
    display: flex;
    align-items: center;

    .content_item_left {
      display: flex;
      align-items: center;
    }
    .content_item_left_icon {
      margin-left: 2px;
    }
    .content_item_name {
      margin: 6px 5px;
      color: #000;
      font-size: 12px;
      font-weight: 400;
      align-self: center;
    }
    .content_item_right {
      margin-left: auto;
    }
  }
}

.layout_no_content {
  align-items: center;
  justify-content: center;
  display: flex;
  width: 100%;
  height: 100%;

  .layout_no_content_tip {
    color: #000;
    height: 100%;
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }
}
</style>