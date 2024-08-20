<template>
  <!-- <div class="tabs"
    :class="{
      'card': card,
      'space-around': spaceAround,
      'space-between': spaceBetween,
    }" 
    :style="tabsStyle || {}"
  >
    <div 
      class="tab" 
      :class="{ 'active': tab.key === value }"
      v-for="tab in tabs" 
      :key="tab.key"
      :style="{
        ...(tabStyle || {}),
        '--color': tab.color,
      }"
      @click="emit('update:value', tab.key)"
    >{{tab.label}}</div>
  </div> -->
  <div 
    class="tabs"
    :class="{
      'card': card,
      'space-around': spaceAround,
      'space-between': spaceBetween,
    }" 
    :style="tabsStyle || {}"
  >
    <div 
      class="tab" 
      :class="{ 'active': tab.key === value && !!drawerVisible}"
      v-for="tab in tabs" 
      :key="tab.key"
      :style="{
        ...(tabStyle || {}),
        '--color': tab.color,
      }"
      @click="handleClick(tab)"
    >
      <img 
        alt="..." 
        :src="tab.icon"
        v-tooltipleft="tab.label"
      />
    </div>
  </div>

</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import { useDrawerStore } from '@/store'
const drawerStore = useDrawerStore()
const { drawerVisible } = storeToRefs(drawerStore)

interface TabItem {
  key: string
  label: string
  color?: string
  icon?: string
}

const props = withDefaults(defineProps<{
  value: string
  tabs: TabItem[]
  card?: boolean
  tabsStyle?: CSSProperties
  tabStyle?: CSSProperties
  spaceAround?: boolean
  spaceBetween?: boolean
}>(), {
  card: false,
  spaceAround: false,
  spaceBetween: false,
})

const emit = defineEmits<{
  (event: 'update:value', payload: string): void
}>()

const getImgUrl = (name: string | undefined) => {
  const url = new URL(`@/assets/icons/${name}.png`, import.meta.url).href
  console.log(url)
  return url
}

/* const getSrc = (tab: TabItem) => {
  return (tab.key === props.value && !!drawerVisible.value) ? tab.active : tab.icon
} */

const handleClick = (tab: TabItem) => {
  emit('update:value', tab.key)
  if ( tab.key === props.value && !!drawerVisible.value ) {
    drawerStore.setDrawerState(!drawerVisible.value)
  } 
  else {
    drawerStore.setDrawerState(true)
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  // display: flex;
  user-select: none;
  line-height: 1;
  // height: 100%;
  flex-direction: column;
  background-color: #fff;

  &:not(.card) {
    font-size: 13px;
    align-items: center;
    justify-content: flex-start;
    border-bottom: 1px solid $borderColor;

    &.space-around {
      justify-content: space-around;
    }
    &.space-between {
      justify-content: space-between;
    }

    .tab {
      text-align: center;
      border-bottom: 2px solid transparent;
      padding: 8px 10px;
      cursor: pointer;

      &.active {
        border-bottom: 2px solid var(--color, $themeColor);
      }
    }
  }

  &.card {
    // height: 40px;
    // height: max-content;
    font-size: 12px;
    flex-shrink: 0;
    // margin-right: 20px;
    border-radius: 8px;
    // box-shadow: 0 1px 2px 0 rgba(13,14,19,0.02), 0 2px 6px 0 rgba(13,14,19,0.06), 0 0 0 1px rgba(13,14,19,0.04);
    border: 1px solid #ddd;
    padding: 4px;
    width: 50px;
    display: grid;
    grid-gap: 8px;
    align-items: center;
    justify-content: center;

    .tab {
      // flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      // background-color: $lightGray;
      // border-bottom: 1px solid $borderColor;
      border-radius: 4px;
      cursor: pointer;
      width: 38px;
      height: 38px;
      img {
        // max-width: 38px;
        // max-height: 38px;
        max-width: 24px;
        max-height: 24px;
      }

      &:hover {
        background-color: #edf2fa;
      }

      &.active {
        // background-color: transparent;
        // border-bottom-color: transparent;
        background-color: #c2e7ff;
        // color: #2aba8a;
        img {
          filter: invert(50%) sepia(94%) saturate(321%) hue-rotate(109deg) brightness(100%) contrast(93%);
        }
      }
      & + .tab {
        // border-left: 1px solid $borderColor;
      }
    }
  }
}

</style>