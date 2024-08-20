<template>
    <div class="content">
        <div v-show="pageState === 'select'" class="create_doc_select" 
          @dragover.prevent="handleFileDragOver" @drop.prevent="handleFileDrop" @click="handleSelectFileClick()"
        >
            <input type="file" accept=".ppt,.pptx,.pdf,.doc,.docx" ref="fileInput" style="display: none" @change="handleSelectFileChange">
            <div class="create_doc_select_icon">
                <svg-icon class="create_doc_select_ppt" icon="icon_pageslides" size="20"/>
                <svg-icon class="create_doc_select_docx" icon="icon_pageedocs" size="20"/>
                <svg-icon class="create_doc_select_pdf" icon="icon_pdf" size="20"/>
            </div>
            <!-- <input class="create_doc_select_hint" type="file" ref="fileInput" accept=".ppt,.pptx,.pdf,.doc,.docx" @change="handleClickSelectFile"> -->
            <div >点击此处或拖动以上传<br>支持PDF,PPT,DOCX</div>
        </div>
        <div v-show="pageState === 'upload'" class="create_doc_upload">
          <svg-icon :icon="uploadFileTypeIcon" size="32"/>
          <div class="create_upload_hint">正在上传文件</div>
          <div class="create_upload_progress" :class="{ rotating: isRotating }">
            <svg-icon icon="loading_green" size="56"/>
          </div>
          <div class="create_upload_big_hint">对于较大的文件，可能需要几分钟</div>
        </div>
        <div v-show="pageState === 'done'" class="create_doc_done">
          <div class="create_upload_done_icon">
            <svg-icon icon="icon_upload_done_green" size="44"/>
          </div>
          <div class="create_upload_done_hint">文件导入成功</div>
          <div class="create_slide_select">
            <select v-model="selectCardNum" class="custom-select" style="width: 100%; height: 100%;">
              <option v-for="cardNumData in cardNumDatas" :key="cardNumData.id" :value="cardNumData.cardNum">
                {{ cardNumData.cardNum }}
              </option>
            </select>
            <svg-icon class="arrow-icon" icon="angle-top" size="10"/>
          </div>
          <div class="create_generate" @click="handleGenerateClick()">
            <div class="create_generate_text">生成大纲</div>
            <svg-icon icon="icon_generate" size="14"/>
          </div>
        </div>
        <GenerateSureDialog 
          :isVisible="isDialogVisible"
          :consumeCredit="'60'"
          :totalCredit="'230'"
          @update:isVisible="handleVisibilityChange"
          @confirm="handleDialogSure"
          @cancel="handleDialogCancel"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter} from 'vue-router'
import GenerateSureDialog from './CreatePPTXGenerateDialog.vue'
const route = useRoute()
const router = useRouter()
const initialPageState = route.query.pageState || route.params.pageState || 'select' // 默认值为'select'
const pageState = ref(initialPageState)
// const pageState = ref('select')
// const pageState = ref('upload')
// const pageState = ref('done')
const changeCurrentState = (newValue: string) => {
  if (pageState.value !== newValue) {
    pageState.value = newValue
  }
}

const isRotating = ref(false)
const selectUploadFile = ref<File | null>(null)
const fileInput = ref(null)
const handleSelectFileClick = () => {
  if (fileInput.value && fileInput.value !== null) {
    const fileInputValue: FileList = fileInput.value
    if (fileInputValue instanceof HTMLInputElement) {
      fileInputValue.click()
    }
  }
}

const handleFileDragOver = (event: DragEvent) => {
  if (event.target instanceof HTMLElement) {
    event.target.classList.add('create_file_select_dragover')
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.target instanceof HTMLElement) {
    event.target.classList.remove('create_file_select_dragover')
  }
  const files = event.dataTransfer?.files
  if (files !== undefined && files.length > 0) {
    handleSelectFiles(files)
  }
}

const handleSelectFileChange = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  if (inputElement.files === null) {
    return
  }
  const files = inputElement.files
  if (files !== undefined && files.length > 0) {
    handleSelectFiles(files)
  }
}

const handleSelectFiles = (files: FileList) => {
  const validFiles = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileName: string = (file ? file.name : '') ?? ''
    const fileExtension = (fileName.split('.').pop() ?? '').toLowerCase()
    if (['ppt', 'pptx', 'pdf', 'doc', 'docx'].includes(fileExtension)) {
      validFiles.push(file)
    }
    else {
      alert(`不支持的文件类型：${file.name}`)
    }
  }
  if (validFiles.length > 0) {
    selectUploadFile.value = validFiles[0]
    console.log('handleSelectFiles suc ', selectUploadFile.value)
    isRotating.value = true
    changeCurrentState('upload')
    setTimeout(() => {
      changeCurrentState('done')
      isRotating.value = false
    }, 5000)
  }
  else {
    console.log('handleSelectFiles fail ', files)
  }
}

const uploadFileTypeIcon = computed(() => {
  if (!selectUploadFile.value) return ''
  const fileExtension = (selectUploadFile.value.name.split('.').pop() ?? '').toLowerCase()
  switch (fileExtension) {
    case 'ppt':
    case 'pptx':
      return 'icon_pageslides'
    case 'pdf':
      return 'icon_pdf'
    case 'doc':
    case 'docx':
      return 'icon_pageedocs'
    default:
      return 'file-pptx'
  }
})

const cardNumDatas = [
  { cardNum: '5张卡片', id: 'id1'},
  { cardNum: '10张卡片', id: 'id2'},
  { cardNum: '20张卡片', id: 'id3'},
  { cardNum: '30张卡片', id: 'id4'},
  { cardNum: '40张卡片', id: 'id5'},
]
const selectCardNum = ref(cardNumDatas[3].cardNum)

const isDialogVisible = ref(false)
const handleVisibilityChange = (newVisibility: boolean) => {
  isDialogVisible.value = newVisibility
}
const handleDialogSure = () => {
  handleVisibilityChange(false)
  router.push('/FileGenerateOutline').catch(error => console.warn('FileGenerateOutline Navigation failed:', error))
}
const handleDialogCancel = () => {
  handleVisibilityChange(false)
}
const handleGenerateClick = () => {
  handleVisibilityChange(true)
}

onBeforeUnmount(() => {
  // 清理
})

</script>

<style lang="scss" scoped>

.content {
  margin: 45px 50px 65px !important;
  background-color: #f9f9f9;
  border: 1px dashed #ebebeb;
  height: 370px;
  border-radius: 20px;
}

.create_doc_select {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 200px;
  cursor: pointer;

  .create_doc_select_icon {
    position: relative;
    display: flex;
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
    justify-content: center;
    align-items: center;

    .create_doc_select_pdf {
      position: absolute;
      padding: 7px;
      border-radius: 3px;
      border: #ebebeb 1px solid;
      background-color: #fff;
    }
    .create_doc_select_ppt {
      position: absolute;
      padding: 7px;
      border-radius: 3px;
      left: 25px;
      top: 15px;
      border: #ebebeb 1px solid;
      background-color: #fff;
      transform: rotate(345deg);
    }
    .create_doc_select_docx {
      position: absolute;
      padding: 7px;
      right: 25px;
      top: 15px;
      border-radius: 3px;
      border: #ebebeb 1px solid;
      background-color: #fff;
      transform: rotate(15deg);
    }
  }
  .create_doc_select_hint {
    font-weight: 200;
    font-size: 14px;
    color: #3d3d3d;
    margin-top: 20px;
    text-align: center;
  }
}

.create_doc_upload {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .create_upload_hint {
    font-size: 13px;
    color: #3d3d3d;
    margin-top: 15px;
    text-align: center;
  }

  .create_upload_progress {
    width: 56px;
    height: 56px;
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .create_upload_progress svg {
    animation: rotateLoading 1s linear infinite;
  }

  @keyframes rotateLoading {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .create_upload_big_hint {
    font-size: 13px;
    color: #3d3d3d;
    margin-top: 15px;
    text-align: center;
  }
}

.create_doc_done {
  display: flex;
  width: 100%;
  padding: 35px;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .create_upload_done_icon {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 44px;
    height: 44px;
  }

  .create_upload_done_hint {
    font-size: 13px;
    color: #3d3d3d;
    margin-top: 10px;
    text-align: center;
  }

  .create_slide_select {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    margin-top: 25px;
    background-color: #fff;

    .custom-select {
      appearance: none; /* 移除默认样式 */
      -webkit-appearance: none; /* 针对 WebKit 浏览器 */
      -moz-appearance: none; /* 针对 Firefox 浏览器 */
      background-color: transparent;
      border-radius: 5px;
      border: 1px solid #dbdbdb;
      padding: 6px 10px;
      width: 100%;
      outline: none;
      color: #000;
      font-weight: 450;
      font-size: 13px;
      cursor: pointer;
    }

    /* 自定义下拉箭头样式 */
    .custom-select::after {
      content: "\25BC"; /* 下三角符号 */
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      pointer-events: none; /* 避免点击箭头时影响选择框 */
      color: #000;
      font-weight: 400;
      font-size: 14px;
    }

    .arrow-icon {
      position: absolute;
      top: 38%;
      right: 10px;
      margin-right: 5px;
      transform: translateY(-50%);
      transform: rotate(180deg);
      pointer-events: none; /* 避免点击箭头时影响选择框 */
      color: #999;
      font-size: 0.8em; /* 调整箭头大小 */
    }
  }

  .create_generate {
    width: 100%;
    border-radius: 5px;
    height: 50px;
    margin-top: 25px;
    background-color: #2aba8a;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .create_generate_text {
      color: #fff;
      font-size: 14px;
    }

    &:active {
      background-color: #2aba8a80;
    }

    &:hover {
      background-color: #2aba8a99;
    }
  }
}

</style>