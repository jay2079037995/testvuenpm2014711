<template>
  <div class="dialog" v-if="isVisible">
    <div class="dialog-content">
      <header class="dialog-header" v-if="showHeader">
        <slot name="header">默认标题</slot>
      </header>
      <main class="dialog-body">
        <!-- <slot>默认内容</slot> -->
        <svg-icon icon="icon_generate_tips" size="48"/>
        <div class="generate_tips_consume">预计消耗{{ consumeCredit }}学分</div>
        <div class="generate_tips_total">可用AI学分{{ totalCredit }}</div>
      </main>
      <footer class="dialog-footer">
        <!-- <slot name="footer">默认按钮</slot> -->
        <button class="generate_confirm" @click="handleConfirmClick">Confirm</button>
        <button class="generate_cancel" @click="handleCancelClick">Cancel</button>
      </footer>
    </div>
  </div>
</template>
 
<script setup lang="ts">
import { ref, toRefs } from 'vue'
const showHeader = ref(false)
withDefaults(defineProps<{
  isVisible: boolean
  consumeCredit: string
  totalCredit: string
}>(), {
  isVisible: true,
  consumeCredit: '60',
  totalCredit: '200',
})

// const props = defineProps<{
//   isVisible: boolean
//   consumeCredit: string
//   totalCredit: string
// }>()
// const { isVisible, consumeCredit, totalCredit } = toRefs(props)

const emit = defineEmits(['update:isVisible', 'confirm', 'cancel'])
const openDialog = () => {
  emit('update:isVisible', true)
}
const closeDialog = () => {
  emit('update:isVisible', false)
}

const handleConfirmClick = () => {
  closeDialog()
  emit('confirm')
}
const handleCancelClick = () => {
  closeDialog()
  emit('cancel')
}

</script>
 
<style lang="scss" scoped>
.dialog {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 380px;
  min-height: 300px;
}

.dialog-header {
  padding-bottom: 10px;
  margin-top: 0;
}

.dialog-footer {
  margin: 5px 70px;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .generate_confirm {
    color: #fff;
    height: 40px;
    width: 100%;
    font-size: 15px;
    background-color: #2aba8a;
    font-weight: 400;
    cursor: pointer;
    border-radius: 7px;
    border: none;

    &:hover {
      background-color: #2aba8a90;
    }

    &:active {
      background-color: #2aba8a90;
    }
  }

  .generate_cancel {
    color: #344054;
    width: 100%;
    height: 40px;
    margin-top: 15px;
    font-size: 15px;
    background-color: #fff;
    font-weight: 400;
    margin-bottom: 25px;
    cursor: pointer;
    border: 1px solid #d0d5dd;
    border-radius: 7px;

    &:hover {
      border-color: #d0d5dd90;
      background-color: #d0d5dd;
    }

    &:active {
      border-color: #d0d5dd90;
      background-color: #d0d5dd;
    }
  }
}

.dialog-body {
  padding: 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .generate_tips_consume {
    color: #101828;
    font-size: 18px;
    font-weight: 600;
    margin-top: 15px;
  }

  .generate_tips_total {
    color: #667085;
    font-size: 13px;
    margin-top: 8px;
    font-weight: 300;
  }
}
</style>