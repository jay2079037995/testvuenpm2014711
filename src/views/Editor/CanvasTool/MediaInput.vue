<template>
  <div class="media-input">
    <Tabs 
      :tabs="tabs" 
      v-model:value="type" 
      :tabsStyle="{ marginBottom: '15px' }" 
    />

    <template v-if="type === 'video'">
      <Input v-model:value="videoSrc" :placeholder="$t('toast.placeholderVideo')"></Input>
      <div class="btns">
        <Button @click="emit('close')" style="margin-right: 10px;">{{ $t('cancel') }}</Button>
        <Button type="primary" @click="insertVideo()">{{ $t('sure') }}</Button>
      </div>
    </template>

    <template v-if="type === 'audio'">
      <Input v-model:value="audioSrc" :placeholder="$t('toast.placeholderAudio')"></Input>
      <div class="btns">
        <Button @click="emit('close')" style="margin-right: 10px;">{{ $t('cancel') }}</Button>
        <Button type="primary" @click="insertAudio()">{{ $t('sure') }}</Button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import message from '@/utils/message'
import Tabs from '@/components/TabsSecondary.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import i18n from '@/assets/locales/index'

type TypeKey = 'video' | 'audio'
interface TabItem {
  key: TypeKey
  label: string
}

const emit = defineEmits<{
  (event: 'insertVideo', payload: string): void
  (event: 'insertAudio', payload: string): void
  (event: 'close'): void
}>()

// const placeholderVideo = i18n.global.t('toast.placeholderVideo')

const type = ref<TypeKey>('video')

const videoSrc = ref(i18n.global.t('demo.videoAddr'))
const audioSrc = ref(i18n.global.t('demo.audioAddr'))

const tabs: TabItem[] = [
  { key: 'video', label: i18n.global.t('canvasTool.video') },
  { key: 'audio', label: i18n.global.t('canvasTool.audio') },
]

const insertVideo = () => {
  if (!videoSrc.value) return message.error(i18n.global.t('toast.videoAddr'))
  emit('insertVideo', videoSrc.value)
}

const insertAudio = () => {
  if (!audioSrc.value) return message.error(i18n.global.t('toast.audioAddr'))
  emit('insertAudio', audioSrc.value)
}
</script>

<style lang="scss" scoped>
.media-input {
  width: 480px;
}
.btns {
  margin-top: 10px;
  text-align: right;
}
</style>
