<template>
    <div class="create-dialog">
        <div class="top_style">
            <div class="top_title">AI Writing</div>
            <div class="top_sub">选择创作的文本类型</div>
            <svg-icon class="close_icon" icon="close" size="24" @click="handleCloseClick()"/>
        </div>
        <div class="top_line"></div>
        <div class="content">
            <div class="pagesslides subcontent" @click="handleCreatePPTXClick()">
                <div class="subcontent_icon">
                  <svg-icon icon="icon_pageslides" size="24"/>
                </div>
                <div class="subcontent_title">PageSlides</div>
                <div class="subcontent_sub">帮助用户创建演示文稿</div>
            </div>
            <div class="pageedocs subcontent" @click="handleCreateDocsClick()">
                <div class="subcontent_icon">
                  <svg-icon icon="icon_pageedocs" size="24"/>
                </div>
                <div class="subcontent_title">Pageedocs</div>
                <div class="subcontent_sub">帮助用户写论文的草稿</div>
            </div>
        </div>
    </div>

    <Modal
      :visible="!!createNewPPTXState"
      :width="800"
      @closed="closeCreateNewPPTX()"
    >
      <CreateNewPPTX />
    </Modal>

</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import Modal from '@/components/Modal.vue'
import CreateNewPPTX from './index.vue'
const mainStore = useMainStore()
const { createNewPPTXState } = storeToRefs(mainStore)

const handleCloseClick = () => {
  mainStore.setCreateDocumentState(false)
}

const handleCreatePPTXClick = () => {
  mainStore.setCreateNewPPTXState(true)
}

const handleCreateDocsClick = () => {
  mainStore.setCreateNewPPTXState(true)
}

const closeCreateNewPPTX = () => mainStore.setCreateNewPPTXState(false)

</script>

<style lang="scss" scoped>
.create-dialog {
  margin: -20px;
}

.top_style {
  display: flex;
  margin-left: 50px;
  position: relative;
  flex-direction: column; /* 设置主轴方向为垂直 */
  gap: 10px;

  .top_title {
    color: 000;
    font-size: 19px;
    margin-top: 40px;
    font-weight: 500;
  }
  .top_sub {
    color: #dbdbdb;
    margin-top: 3px;
    font-size: 14px;
  }

  .close_icon {
    position: absolute;
    top: 0;
    background-color: #fff;
    border-radius: 50%;
    padding: 10px;
    right: 0;
    margin-top: 10px;
    margin-right: 10px;
    cursor: pointer;

    &:active {
      color: #0009;
      background-color: #0009;
    }

    &:hover {
      color: #0009;
      background-color: #0001;
    }
  }
}

.top_line {
  width: calc(100% - 100px);
  height: 1px;
  background-color: #f9f9f9;
  margin-top: 10px !important;
  margin-left: 50px !important;
  margin-right: 50px !important;
}

.content {
  height: 250px;
  padding: 45px;
  display: flex;
  margin-bottom: 25px;
  margin-top: 10px;
  justify-content: space-between;
  gap: 40px;

  @include overflow-overlay();

  .subcontent {
    flex: 1;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;

    .subcontent_icon {
      background-color: #fff;
      border-radius: 50%;
      padding: 8px;
    }

    .subcontent_title {
      color: #fff;
      margin-top: 5px;
      font-size: 18px;
    }
    .subcontent_sub {
      color: #fff;
      font-size: 14px;
    }
  }

  .pagesslides {
    // background-color: #e46350;
    background-image: url('@/assets/images/bg_pageslides_type.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .pageedocs {
    // background-color: #4286cc;
    background-image: url('@/assets/images/bg_pageedocs_type.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
}
</style>