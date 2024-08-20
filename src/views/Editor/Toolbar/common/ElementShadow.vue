<template>
  <div class="element-shadow">
    <div class="row">
      <div style="width: 40%;">{{ $t('panel.enableShadow') }}</div>
      <div class="switch-wrapper" style="width: 60%;">
        <Switch :value="hasShadow" @update:value="value => toggleShadow(value)" />
      </div>
    </div>
    <template v-if="hasShadow && shadow">
      <div class="row">
        <div style="width: 40%;">{{ $t('panel.horizontalShadow') }}</div>
        <Slider 
          style="width: 60%;"
          :min="-10" 
          :max="10" 
          :step="1" 
          :value="shadow.h" 
          @update:value="value => updateShadow({ h: value as number })"
        />
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('panel.verticalShadow') }}</div>
        <Slider
          style="width: 60%;"
          :min="-10"
          :max="10"
          :step="1"
          :value="shadow.v"
          @update:value="value => updateShadow({ v: value as number })"
        />
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('panel.blurDistance') }}</div>
        <Slider
          style="width: 60%;"
          :min="1"
          :max="20"
          :step="1"
          :value="shadow.blur"
          @update:value="value => updateShadow({ blur: value as number })"
        />
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('panel.shadowColor') }}</div>
        <Popover trigger="click" style="width: 60%;">
          <template #content>
            <ColorPicker
              :modelValue="shadow.color"
              @update:modelValue="value => updateShadow({ color: value })"
            />
          </template>
          <ColorButton :color="shadow.color" />
        </Popover>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElementShadow } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ColorButton from './ColorButton.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'
import Popover from '@/components/Popover.vue'
import { yjsDeleteElementAttributes, yjsSetElementAttributes } from '@/utils/yjs-init'
import emitter, { EmitterEvents } from '@/utils/emitter'

const slidesStore = useSlidesStore()
const { theme } = storeToRefs(slidesStore)
const { handleElement } = storeToRefs(useMainStore())

const shadow = ref<PPTElementShadow>()
const hasShadow = ref(false)

watch(handleElement, () => {
  if (!handleElement.value || (handleElement.value.type !== 'line' && handleElement.value.type !== 'text')) return
  shadow.value = 'shadow' in handleElement.value ? handleElement.value.shadow : undefined
  hasShadow.value = !!shadow.value
}, { deep: true, immediate: true })

const { addHistorySnapshot } = useHistorySnapshot()

const updateShadow = (shadowProps: Partial<PPTElementShadow>) => {
  if (!handleElement.value || !shadow.value) return
  const _shadow = { ...shadow.value, ...shadowProps }
  if (handleElement.value.type === 'line' || handleElement.value.type === 'text') {
    slidesStore.updateElement({ id: handleElement.value.id, props: { shadow: _shadow } })
  }
  else {
    emitRichTextCommand('shadow', JSON.stringify(_shadow))
  }
  addHistorySnapshot()
  yjsSetElementAttributes(handleElement.value.id, { shadow: _shadow })
}

const toggleShadow = (checked: boolean) => {
  if (!handleElement.value) return
  if (checked) {
    const _shadow: PPTElementShadow = theme.value.shadow
    if (handleElement.value.type === 'line' || handleElement.value.type === 'text') {
      slidesStore.updateElement({ id: handleElement.value.id, props: { shadow: _shadow } })
    }
    else {
      shadow.value = _shadow
      emitRichTextCommand('shadow', JSON.stringify(_shadow))
      hasShadow.value = true
    }
    yjsSetElementAttributes(handleElement.value.id, { shadow: _shadow })
  }
  else {
    if (handleElement.value.type === 'line' || handleElement.value.type === 'text') {
      slidesStore.removeElementProps({ id: handleElement.value.id, propName: 'shadow' })
    }
    else {
      shadow.value = undefined
      hasShadow.value = false
      emitRichTextCommand('shadow')
    }
    yjsDeleteElementAttributes(handleElement.value.id, ['shadow'])
  }
  addHistorySnapshot()
}

// 发射富文本设置命令
const emitRichTextCommand = (command: string, value?: string) => {
  emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, {target: handleElement.value?.id, action: { command, value } })
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.switch-wrapper {
  text-align: right;
}
</style>