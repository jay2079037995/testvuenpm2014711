<template>
  <div 
    class="ai-bot"
    :style="{
      width: viewportStyles.width * canvasScale -20 + 'px',
    }"
    v-click-outside="handleOutside"
  >
    <!-- AI 列表 -->
    <section 
      class="ai-list"
      v-show="showAIList"
    >
      <ul>
        <li>
          <p>{{ $t('edit.addTextModule') }}</p>
        </li>
        <li>
          <p>{{ $t('edit.searchImage') }}</p>
        </li>
        <li>
          <p>Upload medie</p>
        </li>
        <li>
          <p>{{ $t('edit.generateImage') }}</p>
        </li>
        <li>
          <p>{{ $t('edit.aiCreateSlide') }}...</p>
        </li>
      </ul>
    </section>

    <Input 
      class="input" 
      v-model:value="aiTalk" 
      :placeholder="$t('edit.youWantToDo')"
      @enter="handleEnter()"
    ></Input>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-var-requires */
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore, useMainStore, useAIBotStore } from '@/store'
import useViewportSize from '../Canvas/hooks/useViewportSize'
import Input from '@/components/Input.vue'
import i18n from '@/assets/locales/index'
const { global: { t: $t } } = i18n


const aiBotStore = useAIBotStore()

const mainStore = useMainStore()
const {
  canvasScale,
} = storeToRefs(mainStore)
const canvasRef = ref<HTMLElement>()
const { dragViewport, viewportStyles } = useViewportSize(canvasRef)

const aiTalk = ref('')

const props = defineProps<{
  height: number
}>()

const emit = defineEmits<{
  (event: 'update:height', payload: number): void
}>()

const slidesStore = useSlidesStore()
const { currentSlide } = storeToRefs(slidesStore)

/* const editorRef = ref<InstanceType<typeof Editor>>()
watch(() => currentSlide.value.id, () => {
  nextTick(() => {
    editorRef.value!.updateTextContent()
  })
}, {
  immediate: true,
}) */

const remark = computed(() => currentSlide.value?.remark || '')

const showAIList = ref(false)

const handleInput = (content: string) => {
  slidesStore.updateSlide({ remark: content })
}

const resize = (e: MouseEvent) => {
  let isMouseDown = true
  const startPageY = e.pageY
  const originHeight = props.height

  document.onmousemove = e => {
    if (!isMouseDown) return

    const currentPageY = e.pageY

    const moveY = currentPageY - startPageY
    let newHeight = -moveY + originHeight

    if (newHeight < 40) newHeight = 40
    if (newHeight > 360) newHeight = 360

    emit('update:height', newHeight)
  }

  document.onmouseup = () => {
    isMouseDown = false
    document.onmousemove = null
    document.onmouseup = null
  }
}

const handleEnter = () => {
  showAIList.value = aiTalk.value.length ? true : false
}

const handleOutside = () => {
  // aiBotStore.setAIBotState(false)
}
</script>

<style lang="scss" scoped>
.ai-bot {
  position: absolute;
  // border-top: 1px solid $borderColor;
  background-color: $lightGray;
  width: calc(100% - 200px);
  min-width: 300px;
  max-width: 1000px;
  // height: 96px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid #ddd;
  box-shadow: 0 12px 16px -4px rgba(16,24,40, 0.2);
  border-radius: 8px;
  z-index: 100;
  // padding-left: 10%;
  padding: 26px 16px;
}
.resize-handler {
  height: 7px;
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  cursor: n-resize;
  z-index: 2;
}

.input {
  height: 40px;
  line-height: 42px;
  align-items: center;
}

// AI 列表
.ai-list {
  ul {
    li {
      height: 40px;
      p {
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #344054;
        text-indent: 10px;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          background-color: #edf2fa;
        }
      }
    }
  }
}
</style>