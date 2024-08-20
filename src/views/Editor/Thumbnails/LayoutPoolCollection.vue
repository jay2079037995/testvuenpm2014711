<template>
    <div class="layout">
      <Tabs 
        :tabs="tabs" 
        v-model:value="toolbarState"
        :tabsStyle="{ height: '30px' }"
        :tabStyle="{ height: '23px' }" 
        flex-start
      />
      <div class="content">
        <div class="cardT" v-if="toolbarState === 'card'">
          <CardTemplateList @select="slide => { selectSlideTemplate(slide); }" />
        </div>
        <div class="layoutT" v-else>
          <LayoutTemplateList @select="slide => { selectSlideTemplate(slide); }" />
        </div>
      </div>
    </div>
  </template>
   
<script lang="ts" setup>
import { ref } from 'vue'
import CardTemplateList from './CardTemplateList.vue'
import LayoutTemplateList from './LayoutTemplateList.vue'
import type { Slide } from '@/types/slides'
import Tabs from '@/components/TabsLayoutPool.vue'
import i18n from '@/assets/locales/index'

interface TabItem {
  key: 'card' | 'layout'
  label: string
}

const tabs: TabItem[] = [
  { label: i18n.global.t('cardLemplate'), key: 'card' },
  { label: i18n.global.t('layoutTemplate'), key: 'layout' },
]

const toolbarState = ref<'card' | 'layout'>('card')

const emit = defineEmits<{
  (event: 'select', payload: Slide): void
}>()

const selectSlideTemplate = (slide: Slide) => {
  emit('select', slide)
}

</script>
   
<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  width: 454px;
  padding-left: 5px;
}

.content {
  height: calc(100% - 35px);
  font-size: 13px;
  margin-top: 10px;
}

.cardT .layoutT {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// .formula {
//   height: 100%;
//   padding: 12px;

//   @include overflow-overlay();
// }

</style>