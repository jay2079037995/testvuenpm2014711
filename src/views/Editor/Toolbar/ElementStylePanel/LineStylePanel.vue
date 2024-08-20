<template>
  <div class="line-style-panel">
    <div class="row">
      <div style="width: 40%;">{{ $t('panel.lineStyle') }}</div>
      <Select 
        style="width: 60%;" 
        :value="handleLineElement.style" 
        @update:value="value => updateLine({ style: value as 'solid' | 'dashed' })"
        :options="[
          { label: $t('panel.solidLine'), value: 'solid' },
          { label: $t('panel.dashedLine'), value: 'dashed' },
        ]"
      />
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('panel.lineColor') }}</div>
      <Popover trigger="click" style="width: 60%;">
        <template #content>
          <ColorPicker
            :modelValue="handleLineElement.color"
            @update:modelValue="value => updateLine({ color: value })"
          />
        </template>
        <ColorButton :color="handleLineElement.color" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('panel.lineWidth') }}</div>
      <NumberInput 
        :value="handleLineElement.width" 
        @update:value="value => updateLine({ width: value })" 
        style="width: 60%;" 
      />
    </div>
    
    <div class="row">
      <div style="width: 40%;">{{ $t('panel.startStyle') }}</div>
      <Select 
        style="width: 60%;" 
        :value="handleLineElement.points[0]" 
        @update:value="value => updateLine({ points: [value as 'arrow' | 'dot', handleLineElement.points[1]] })"
        :options="[
          { label: $t('link.linkTargetNone'), value: '' },
          { label: $t('canvasTool.arrow'), value: 'arrow' },
          { label: $t('panel.dot'), value: 'dot' },
        ]"
      />
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('panel.endStyle') }}</div>
      <Select 
        style="width: 60%;" 
        :value="handleLineElement.points[1]" 
        @update:value="value => updateLine({ points: [handleLineElement.points[0], value as 'arrow' | 'dot'] })"
        :options="[
          { label: $t('link.linkTargetNone'), value: '' },
          { label: $t('canvasTool.arrow'), value: 'arrow' },
          { label: $t('panel.dot'), value: 'dot' },
        ]"
      />
    </div>

    <Divider />
    <ElementShadow />
  </div>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTLineElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ElementShadow from '../common/ElementShadow.vue'
import ColorButton from '../common/ColorButton.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Divider from '@/components/Divider.vue'
import NumberInput from '@/components/NumberInput.vue'
import Select from '@/components/Select.vue'
import Popover from '@/components/Popover.vue'
import { yjsSetElementAttributes } from '@/utils/yjs-init'

const slidesStore = useSlidesStore()
const { handleElement } = storeToRefs(useMainStore())

const handleLineElement = handleElement as Ref<PPTLineElement>

const { addHistorySnapshot } = useHistorySnapshot()

const updateLine = (props: Partial<PPTLineElement>) => {
  if (!handleElement.value) return
  slidesStore.updateElement({ id: handleElement.value.id, props })
  addHistorySnapshot()
  yjsSetElementAttributes(handleElement.value.id, props)
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.line-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 !important;

  .line-wrapper {
    margin-left: 8px;
  }
}
.line-wrapper {
  overflow: visible;
}
.line-btn-icon {
  width: 30px;
  font-size: 12px;
  margin-top: 2px;
  color: #bfbfbf;
}
.preset-point-style {
  padding: 0 10px;

  & + .preset-point-style {
    margin-top: 10px;
  }
}
</style>