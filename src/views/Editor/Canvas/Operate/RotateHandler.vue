<template>
  <div class="rotate-handler">
    <svg-icon name="rotate-icon" icon="rotate" color="#202124" :size="26  * canvasScale" />
  </div>
</template>

<script lang="ts" setup>


import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'

const { canvasScale } = storeToRefs(useMainStore())

</script>

<style lang="scss" scoped>
.rotate-handler {
  position: absolute;
  width: 26px;
  height: 26px;
  top: -25px;
  margin-left: -5px;
  border-radius: 50%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>