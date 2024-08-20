<template>
  <div class="image-style-panel">
    <div class="panel-title">
      <div class="left">{{ $t('panel.generate') }}</div>
      <div> <svg-icon @click="closeEditor()" class="icon-file" icon="close" color="#fff" size="16"/> </div>
    </div>
    <Divider style="height: 1px; border-inline-start: 1px solid $canvasDividerColor; margin: 0 0;"/>
    <div class="origin-text divider-panel">{{ $t('panel.promptword') }}</div>

    <div class="input-area">
        <TextArea v-model:value="imageMsg" :placeholder="$t('toast.placeholderImageGenerate')" ref="textAreaRef" />
    </div>

    <div class="origin-text">{{ $t('panel.imageExclude') }}</div>

    <div class="origin-select"> 
      <Select 
        style="width: 100%;" 
        :value="theme.outline.style || ''"  
        :options="[
          { label: $t('edit.widescreen9'), value: 0.5625 },
          { label: $t('edit.widescreen10'), value: 0.625 },
          { label: $t('edit.standard3'), value: 0.75 },
          { label: $t('edit.paperA3'), value: 0.70710678 },
          { label: $t('edit.verticalA3'), value: 1.41421356 },
        ]"
      />
    </div>

    <div class="origin-text">{{ $t('panel.aspectRatio') }}</div>

    <div class="origin-select">
      <Select 
        style="width: 100%;" 
        :value="theme.outline.style || ''"  
        :options="[
          { label: $t('edit.square11'), value: 0.5625 },
          { label: $t('edit.widescreen10'), value: 0.625 },
          { label: $t('edit.standard3'), value: 0.75 },
          { label: $t('edit.paperA3'), value: 0.70710678 },
          { label: $t('edit.verticalA3'), value: 1.41421356 },
        ]"
      />
    </div>

    <div class="btn-generate">
      <!-- @click="generateClicek()" -->
      <div class="content-btn">{{ $t('panel.generate') }}</div>
      <div class="right-btn"> 
        <div class="scores">242</div>
        <svg-icon icon="ai-scores" color="#202124" size="9"/>
      </div>
    </div>

    <div class="origin-ai">
      <div><svg-icon icon="ai-scores" color="#000" size="12"/></div>
      <div class="text">{{ $t('scoresAI', {scores: 242}) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Ref, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTImageElement } from '@/types/slides'

import Divider from '@/components/Divider.vue'
import TextArea from '@/components/TextArea.vue'
import Select from '@/components/Select.vue'

const props = defineProps<{
  data: string | null
}>()

const emit = defineEmits<{
  (event: 'save', payload: string): void
  (event: 'close'): void
}>()

const imageMsg = ref('')
const textAreaRef = ref<InstanceType<typeof TextArea>>()

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { theme } = storeToRefs(slidesStore)
const { handleElement, handleElementId } = storeToRefs(mainStore)
const handleImageElement = handleElement as Ref<PPTImageElement>
// const { generateClicek, enterScreeningFromStart } = useScreening()

// 关闭图表数据编辑器
const closeEditor = () => emit('close')

// 初始化图表数据：将数据格式化并填充到DOM
const initData = () => {
  const _data: string[][] = []
}

onMounted(initData)

</script> 

<style lang="scss" scoped>
//   border-radius: 8px;
//  border: 1px solid #ddd;
.image-style-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.panel-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  .left {
    color: $textColor;
    font-size: 15px;
  }

  .icon-file {
    padding: 2px 5px;
    margin-bottom: 3px;
    align-items: center;
    cursor: pointer;

    .icon {
      font-size: 10px;
      color: $blackColor;
    }

    &:hover {
      background-color: #f1f1f1;
    }
  }
}
.origin-text {
  color: $textColor;
  margin-bottom: 10px;
  font-size: 13px;
}
.input-area {
  flex: 1;
  margin-top: 5px;
  margin-bottom: 8px;
  border-radius: 5px;

  textarea {
    height: 100% !important;
    border-color: $borderColor !important;
    padding: 10px !important;
    background-color: #ececec;
    font-size: 12px;
    color: $textColor;

    &:focus {
      box-shadow: none !important;
      background-color: #ececec;
      border: 1px solid $themeColor;
    }
  }
}
.divider-panel {
  margin-top: 10px;
}

.btn-generate {
  height: 30px;
  display: flex;
  flex-direction: row;
  background-color: $themeColor;
  border-radius: 5px;
  margin: 18px 4px 0 4px;

  &:hover {
    background-color: $themeHoverColor;
  }

  .content-btn {
    font-size: 11px;
    align-self: center;
    color: #fff;
    margin-left: 105px;
  }
}
.right-btn {
  height: 18px;
  display: flex;
  background-color: #fffc;
  align-items: center;
  align-self: center;
  padding: 0 7px;
  border-radius: 9px;
  margin-left: 55px;

  .scores {
    color: $textColor;
    font-size: 10px;
    margin-right: 3px;
  }
}

.origin-ai {
  margin-top: 10px;
  display: flex;
  justify-content: right;
  align-items: center;
  margin-right: 1px;
  .text {
    font-size: 12px;
    margin-left: 5px;
    margin-top: 3px;
  }
}
.origin-select {
  padding: 0 3px;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>