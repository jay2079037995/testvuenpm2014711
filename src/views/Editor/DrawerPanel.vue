<template>
  <!-- <Teleport to="body"> -->
    <Transition :name="`drawer-slide-${placement}`"
      @afterLeave="contentVisible = false"
      @before-enter="contentVisible = true"
    >
      <div :class="['drawer', placement]" v-show="drawerVisible">
        <div class="header">
          <slot name="title"></slot>
          <span 
            class="close-btn" 
            @click="handleClick"
          >
            <IconClose />
          </span>
        </div>
        <div class="content" v-if="contentVisible" :style="contentStyle">
          <slot></slot>
        </div>
        <div class="footer"></div>
      </div>
    </Transition>
  <!-- </Teleport> -->
</template>

<script lang="ts" setup>
import { computed, ref, type CSSProperties } from 'vue'

import { storeToRefs } from 'pinia'
import { useDrawerStore } from '@/store'

const drawerStore = useDrawerStore()
const { drawerVisible } = storeToRefs(drawerStore)

const props = withDefaults(defineProps<{
  visible?: boolean
  width?: number
  contentStyle?: CSSProperties
  placement?: 'left' | 'right'
}>(), {
  width: 320,
  placement: 'right',
})

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void
}>()

const contentVisible = ref(true)

const contentStyle = computed(() => {
  return {
    width: props.width + 'px',
    ...(props.contentStyle || {})
  }
})

const handleClick = () => {
  // emit('update:visible', false)
  // 关闭
  drawerStore.setDrawerState(false)
}
</script>

<style lang="scss" scoped>
.drawer {
  height: auto;
  max-height: 100%;
  // background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-right: 10px;

  &.left {
    left: 0;
  }
  &.right {
    right: 0;
  }
}
.header {
  height: 38px;
  padding: 0 8px;
  position: relative;
  display: flex;
  align-items: center;
  // border-bottom: 1px solid #ddd;
  // justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 1px 2px 0 #ddd;
  .close-btn {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 9px;
    right: 15px;
    cursor: pointer;
  }
}
.footer {
  height: 38px;
  flex-shrink: 0;
  box-shadow: 0 -1px 2px 0 #ddd;
}
.content {
  padding: 8px;
  overflow: auto;
  flex: 1;
}

.drawer-slide-right-enter-active {
  animation: drawer-slide-right-enter .25s both ease;
}
.drawer-slide-right-leave-active {
  animation: drawer-slide-right-leave .25s both ease;
}
.drawer-slide-left-enter-active {
  animation: drawer-slide-left-enter .25s both ease;
}
.drawer-slide-left-leave-active {
  animation: drawer-slide-left-leave .25s both ease;
}

@keyframes drawer-slide-right-enter {
  from {
    transform: translateX(100%);
  }
}
@keyframes drawer-slide-right-leave {
  to {
    transform: translateX(100%);
  }
}
@keyframes drawer-slide-left-enter {
  from {
    transform: translateX(-100%);
  }
}
@keyframes drawer-slide-left-leave {
  to {
    transform: translateX(-100%);
  }
}
</style>