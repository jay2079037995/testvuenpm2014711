<template>
  <!-- status 弹框-->
  <div 
    class="status-modal"
    v-click-outside="handleOutside"
  >
    <ul>
      <li 
        v-for="item in list" 
        :key="item.id"
        @click="handleClick(item.id)"
      >
        <dev class="img-wrap"><img :src="item.icon"></dev>
        <span class="text">{{ item.text }}</span>
        <span
          v-if="item.id === currentId"
        ><img src="/icons/toolbar/status-bingo.svg"></span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { computed, watch, ref } from 'vue'
import { useDrawerStore } from '@/store'
import i18n from '@/assets/locales/index'
const { global: { t: $t } } = i18n

const list = [
  {
    id: 1,
    text: 'No status',
    icon: '/icons/toolbar/status-undefined.svg',
  },
  {
    id: 2,
    text: 'To do',
    icon: '/icons/toolbar/status-todo.svg',
  },
  {
    id: 3,
    text: 'In progress',
    icon: '/icons/toolbar/status-inprogress.svg',
  },
  {
    id: 4,
    text: $t('edit.finish'),
    icon: '/icons/toolbar/status-done.svg',
  },
]

const currentId = ref(1)

const drawerStore = useDrawerStore()
const handleOutside = () => {
  drawerStore.setDrawerState(false)
}

const handleClick = (id: number) => {
  currentId.value = id
}
</script>
<style lang="scss" scoped>

.status-modal {
  width: 177px;
  // height: 136px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 12px 16px -4px rgba(16, 24, 40, 0.2);
  background-color: #fff;
  font-size: 14px;
  position: absolute;
  bottom: -118px;
  right: 80px;
  ul {
    li {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: start;
      .img-wrap {
        width: 20px;
        height: 100%;
        display: flex;
        align-items: center;
      }
      span {
        cursor: pointer;
      }
      img {
        max-width: 24px;
        max-height: 24px;
      }
      .text {
        text-indent: 4px;
        flex: 1;
      }
    }
  }
}
</style>