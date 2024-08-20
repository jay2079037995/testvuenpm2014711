<template>
  <div class="toolbar">
    <!-- <div class="content">
      <component :is="currentPanelComponent"></component>
    </div> -->
    <!-- <div class="content">
    </div> -->
    
    <!-- v-model:visible="showDrawer" -->
    <section 
      class="draw-wrap"
      v-if="!showStatus"
    >
      <DrawerPanel
        :width="250"
        placement="right"
        :style="{
          background: '#f9fbfd',
        }"
      >
        <template #title>{{ currentPanelTitle }}</template>
        <component :is="currentPanelComponent"></component>
      </DrawerPanel>
    </section>
    <section class="tab-wrap">
      <div class="fill-wrap">
        <Tabs 
          :tabs="currentTabs" 
          :value="toolbarState" 
          card 
          @update:value="key => setToolbarState(key as ToolbarStates)"
        />
        <Status v-if="showStatusBox"></Status>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useDrawerStore } from '@/store'
import { ToolbarStates } from '@/types/toolbar'

import ElementStylePanel from './ElementStylePanel/index.vue'
import ElementPositionPanel from './ElementPositionPanel.vue'
import ElementAnimationPanel from './ElementAnimationPanel.vue'
import SlideDesignPanel from './SlideDesignPanel.vue'
import SlideAnimationPanel from './SlideAnimationPanel.vue'
import MultiPositionPanel from './MultiPositionPanel.vue'
import SymbolPanel from './SymbolPanel.vue'
import Remark from '../Remark/index.vue'
import Comments from '../Comments/index.vue'
import Tabs from '@/components/Tabs.vue'
import DrawerPanel from '../DrawerPanel.vue'
import Status from '../Status/Status.vue'
// toolbar 国际化 ---- start ----
import i18n from '@/assets/locales/index'
const { global: { t: $t } } = i18n
// toolbar 国际化 ---- end ----

interface ElementTabs {
  label: string
  key: ToolbarStates
  icon?: string
}

const mainStore = useMainStore()
const { activeElementIdList, handleElement, toolbarState } = storeToRefs(mainStore)
const drawerStore = useDrawerStore()
const { drawerVisible } = storeToRefs(drawerStore)

const showStatus = computed(() => {
  return ToolbarStates.STATUS === toolbarState.value
})

const showStatusBox = computed(() => {
  return showStatus.value && !!drawerVisible.value
})

const elementTabs = computed<ElementTabs[]>(() => {
  if (handleElement.value?.type === 'text') {
    return [
      { 
        // toolbar 国际化 ---- start ----
        label: $t('edit.style'), 
        // toolbar 国际化 ---- end ----
        key: ToolbarStates.EL_STYLE,
        icon: 'icons/toolbar/design.svg',
      },
      { 
        // toolbar 国际化 ---- start ----
        label: $t('edit.animation'), 
        // toolbar 国际化 ---- end ----
        key: ToolbarStates.EL_ANIMATION,
        icon: 'icons/toolbar/animation.svg',
      },
      { 
        // toolbar 国际化 ---- start ----
        label: $t('edit.symbol'), 
        // toolbar 国际化 ---- end ----
        key: ToolbarStates.SYMBOL,
        icon: 'icons/toolbar/symbol.svg',
      },
      { 
        // toolbar 国际化 ---- start ----
        label: $t('edit.position'), 
        key: ToolbarStates.EL_POSITION,
        icon: 'icons/toolbar/location.svg',
      },
      { 
        // toolbar 国际化 ---- start ----
        label: $t('edit.remark'), 
        // toolbar 国际化 ---- end ----
        key: ToolbarStates.REMARK,
        icon: 'icons/toolbar/remark.svg',
      },
      { 
        // toolbar 国际化 ---- start ----
        label: $t('edit.status'), 
        // toolbar 国际化 ---- end ----
        key: ToolbarStates.STATUS,
        icon: 'icons/toolbar/status.svg',
      },
    ]
  }
  return [
    { 
      label: $t('edit.style'),  
      key: ToolbarStates.EL_STYLE,
      icon: 'icons/toolbar/design.svg',
    },
    { 
      label: $t('edit.animation'),  
      key: ToolbarStates.EL_ANIMATION,
      icon: 'icons/toolbar/animation.svg',
    },
    { 
      label: $t('edit.position'), 
      key: ToolbarStates.EL_POSITION,
      icon: 'icons/toolbar/location.svg',
    },
    { 
      label: $t('edit.remark'), 
      key: ToolbarStates.REMARK,
      icon: 'icons/toolbar/remark.svg',
    },
    { 
      label: $t('edit.status'), 
      key: ToolbarStates.STATUS,
      icon: 'icons/toolbar/status.svg',
    },
  ]
})
const slideTabs = [
  { 
    label: $t('edit.design'),  
    key: ToolbarStates.SLIDE_DESIGN,
    icon: 'icons/toolbar/design.svg',
  },
  { 
    label: $t('edit.animation'),  
    key: ToolbarStates.EL_ANIMATION,
    icon: 'icons/toolbar/animation.svg',
  },
  { 
    label: $t('edit.switch'),  
    key: ToolbarStates.SLIDE_ANIMATION,
    icon: 'icons/toolbar/switch.svg',
  },
  { 
    label: $t('edit.comments'),   
    key: ToolbarStates.COMMENTS,
    icon: 'icons/toolbar/edit.svg',
  },
  { 
    label: $t('edit.remark'), 
    key: ToolbarStates.REMARK,
    icon: 'icons/toolbar/remark.svg',
  },
  { 
    label: $t('edit.status'), 
    key: ToolbarStates.STATUS,
    icon: 'icons/toolbar/status.svg',
  },
]
const multiSelectTabs = [
  { 
    label: $t('edit.style'),
    key: ToolbarStates.EL_STYLE,
    icon: 'icons/toolbar/design.svg',
  },
  { 
    label: $t('edit.position'), 
    key: ToolbarStates.MULTI_POSITION,
    icon: 'icons/toolbar/location.svg',
  },
  { 
    label: $t('edit.remark'), 
    key: ToolbarStates.REMARK,
    icon: 'icons/toolbar/remark.svg',
  },
  { 
    label: $t('edit.status'), 
    key: ToolbarStates.STATUS,
    icon: 'icons/toolbar/status.svg',
  },
]

const setToolbarState = (value: ToolbarStates) => {
  mainStore.setToolbarState(value)
}

const currentTabs = computed(() => {
  if (!activeElementIdList.value.length) return slideTabs
  else if (activeElementIdList.value.length > 1) return multiSelectTabs
  return elementTabs.value
})

watch(currentTabs, () => {
  const currentTabsValue: ToolbarStates[] = currentTabs.value.map(tab => tab.key)
  if (!currentTabsValue.includes(toolbarState.value)) {
    mainStore.setToolbarState(currentTabsValue[0])
  }
})

const currentPanelComponent = computed(() => {
  const panelMap = {
    [ToolbarStates.EL_STYLE]: ElementStylePanel,
    [ToolbarStates.EL_POSITION]: ElementPositionPanel,
    [ToolbarStates.EL_ANIMATION]: ElementAnimationPanel,
    [ToolbarStates.SLIDE_DESIGN]: SlideDesignPanel,
    [ToolbarStates.SLIDE_ANIMATION]: SlideAnimationPanel,
    [ToolbarStates.MULTI_POSITION]: MultiPositionPanel,
    [ToolbarStates.SYMBOL]: SymbolPanel,
    // 新增
    [ToolbarStates.REMARK]: Remark,
    [ToolbarStates.COMMENTS]: Comments,
    [ToolbarStates.STATUS]: Status,
  }
  return panelMap[toolbarState.value] || null
})

// 展示的 title
const currentPanelTitle = computed(() => {
  return [...elementTabs.value, ...slideTabs, ...multiSelectTabs].find((item) => item.key === toolbarState.value)?.label
})
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  padding: 40px 0 10px;
  // position: relative;
}
.content {
  width: 250px;
  // padding: 12px;
  font-size: 13px;
  @include overflow-overlay();

  flex: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.tab-wrap {
  width: 70px;
  height: 100%;
}
.draw-wrap {
  // margin-right: 10px;
  height: 100%;
  overflow: hidden;
}

.fill-wrap {
  position: relative;
}
</style>