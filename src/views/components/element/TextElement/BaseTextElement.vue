<template>
  <div 
    class="base-element-text"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
      height: elementInfo.height + 'px',
    }"
  >
    <div
      class="rotate-wrapper"
      :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
    >
      <div 
        class="element-content"
        :style="(backgroundStyle !== '' && backgroundStyle !== null) ? {
          width: elementInfo.vertical ? 'auto' : elementInfo.width + 'px',
          height: elementInfo.vertical ? elementInfo.height + 'px' : 'auto',
          backgroundImage: backgroundStyle,
          opacity: elementInfo.opacity,
          textShadow: shadowStyle,
          lineHeight: elementInfo.lineHeight,
          letterSpacing: (elementInfo.wordSpace || 0) + 'px',
          color: elementInfo.defaultColor,
          fontFamily: elementInfo.defaultFontName,
          writingMode: elementInfo.vertical ? 'vertical-rl' : 'horizontal-tb',
        } : {
          width: elementInfo.vertical ? 'auto' : elementInfo.width + 'px',
          height: elementInfo.vertical ? elementInfo.height + 'px' : 'auto',
          backgroundColor: elementInfo.fill,
          opacity: elementInfo.opacity,
          textShadow: shadowStyle,
          lineHeight: elementInfo.lineHeight,
          letterSpacing: (elementInfo.wordSpace || 0) + 'px',
          color: elementInfo.defaultColor,
          fontFamily: elementInfo.defaultFontName,
          writingMode: elementInfo.vertical ? 'vertical-rl' : 'horizontal-tb',
        }"
        
      >
        <ElementOutline
          :width="elementInfo.width"
          :height="elementInfo.height"
          :outline="elementInfo.outline"
        />
        <div 
          class="text ProseMirror-static" 
          ref="editorViewRef"
          :style="{
            '--paragraphSpace': `${elementInfo.paragraphSpace === undefined ? 0 : elementInfo.paragraphSpace}px`,
            'white-space': `${elementInfo.lock ? 'nowrap' : 'normal'}`,
            'margin-top': `${elementInfo.height < 35 ? '-10px' : '0px'}`,
            'margin-left': `${elementInfo.width < 100 ? '-7px' : '-4px'}`,
            'margin-right': `${elementInfo.width < 100 ? '-7px' : '-4px'}`,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// v-html="elementInfo.content"
import { computed, ref, onMounted, watch, onUnmounted} from 'vue'
import type { PPTTextElement } from '@/types/slides'
import ElementOutline from '@/views/components/element/ElementOutline.vue'

import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useElementGradient from '@/views/components/element/hooks/useElementGradient'
import { needYJS, yjsGetAwareness, yjsGetTextXML } from '@/utils/yjs-init'
import { type EditorView } from 'prosemirror-view'
import { yCursorPlugin, ySyncPlugin } from 'y-prosemirror'
import { initProsemirrorEditor } from '@/utils/prosemirror'

const editorViewRef = ref<HTMLElement>()
let editorView: EditorView

const props = defineProps<{
  elementInfo: PPTTextElement
}>()

const shadow = computed(() => props.elementInfo.shadow)
const { shadowStyle } = useElementShadow(shadow)

const background = computed(() => props.elementInfo.gradient)
const { backgroundStyle } = useElementGradient(background)


const textContent = computed(() => props.elementInfo.content)

watch(textContent, () => {
  if (!needYJS) {
    editorView.destroy()
    editorView = initProsemirrorEditor((editorViewRef.value as Element), textContent.value, {
      editable: () => false,
    })
  }
})

onMounted(() => {
  if (needYJS && yjsGetTextXML(props.elementInfo.id)) {
    const xml = yjsGetTextXML(props.elementInfo.id)
    editorView = initProsemirrorEditor((editorViewRef.value as Element), textContent.value, {
      editable: () => false,
    }, {
      ySyncPlugin: ySyncPlugin(xml),
      // yCursorPlugin: yCursorPlugin(yjsGetAwareness()),
    })
  }
  else {
    editorView = initProsemirrorEditor((editorViewRef.value as Element), textContent.value, {
      editable: () => false,
    })
  }
})

onUnmounted(() => {
  editorView && editorView.destroy()
})

</script>

<style lang="scss" scoped>
.base-element-text {
  position: absolute;
}
.rotate-wrapper {
  width: 100%;
  height: 100%;
}
.element-content {
  position: relative;
  padding: 10px;
  line-height: 1.2;
  word-break: break-word;

  .text {
    position: relative;
  }
}
</style>
