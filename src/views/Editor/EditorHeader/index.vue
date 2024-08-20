<template>
  <div class="editor-header">
    <div class="left">
      <Popover trigger="click" placement="bottom-start" v-model:value="mainMenuVisible">
        <template #content>
          <FileInput accept="application/vnd.openxmlformats-officedocument.presentationml.presentation"  @change="files => {
            importPPTXFileFusion(files)
            mainMenuVisible = false
          }">
            <PopoverMenuItem>{{$t('importPptxFile')}}</PopoverMenuItem>
          </FileInput>
          <FileInput accept="application/vnd.openxmlformats-officedocument.presentationml.presentation"  @change="files => {
            importPPTXFileGenerate(files)
            mainMenuVisible = false
          }">
            <PopoverMenuItem>{{$t('importPptist')}}</PopoverMenuItem>
          </FileInput>
          <FileInput accept="application/vnd.openxmlformats-officedocument.presentationml.presentation"  @change="files => {
            importPPTXFile(files)
            mainMenuVisible = false
          }">
            <PopoverMenuItem>{{$t('importPptxTest')}}</PopoverMenuItem>
          </FileInput>

          <FileInput accept="application/json"  @change="files => {
            importJSONFile(files)
            mainMenuVisible = false
          }">

            <PopoverMenuItem>导入 json 文件</PopoverMenuItem>
          </FileInput>
          <PopoverMenuItem @click="setDialogForExport('pptx')">{{$t('exportFile')}}</PopoverMenuItem>
          <PopoverMenuItem @click="resetSlides(); mainMenuVisible = false">{{$t('resetSlide')}}</PopoverMenuItem>
          <!-- <PopoverMenuItem @click="goLink('https://github.com/pipipi-pikachu/GenerativePPT/issues')">{{$t('feedback')}}</PopoverMenuItem>
          <PopoverMenuItem @click="goLink('https://github.com/pipipi-pikachu/GenerativePPT/blob/master/doc/Q&A.md')">{{$t('commonProblem')}}</PopoverMenuItem> -->
          <PopoverMenuItem @click="mainMenuVisible = false; hotkeyDrawerVisible = true">{{$t('shortcutKey')}}</PopoverMenuItem>
          <PopoverMenuItem @click="setCreateDocument()">创建文档</PopoverMenuItem>
        </template>
        <div class="menu-item"><IconHamburgerButton class="icon" /></div>
      </Popover>

      <div>
        <svg-icon class="menu-item" icon="file-pptx" size="28"/>
      </div>

      <div class="toolbar">
        <div class="left-up">
          <div class="title">
            <Input 
              class="title-input"
              ref="titleInputRef"
              v-model:value="titleValue" 
              @blur="handleUpdateTitle()" 
              v-if="editingTitle" 
            ></Input>
            <div 
              class="title-text"
              @click="startEditTitle()"
              :title="title"
              v-else
            >{{ title }}</div>
          </div>
          <div><svg-icon class="icon-file" icon="star" color="#444746" size="18"/></div>
          <div><svg-icon class="icon-file" icon="cloud" color="#444746" size="18"/></div>
        </div>

        <div class="left-down">
          <NavigationMenu></NavigationMenu>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="group-menu-item">
        <div class="menu-item" v-tooltip="$t('slidePlay')" @click="enterScreening()">
          <IconPpt class="icon" />
        </div>
        <Popover trigger="click" center>
          <template #content>
            <PopoverMenuItem @click="enterScreeningFromStart()">{{$t('slidePlayStart')}}</PopoverMenuItem>
            <PopoverMenuItem @click="enterScreening()">{{$t('slidePlayCurrent')}}</PopoverMenuItem>
          </template>
          <div class="arrow-btn"><IconDown class="arrow" /></div>
        </Popover>
      </div>
      <!-- <div class="menu-item" v-tooltip="$t('export')" @click="setDialogForExport('pptx')">
        <IconDownload class="icon" />
      </div> -->
      <!-- <a class="github-link" href="https://github.com/pipipi-pikachu/GenerativePPT" target="_blank">
        <div class="menu-item"><IconGithub class="icon" /></div>
      </a> -->
    </div>

    <Drawer
      :width="320"
      v-model:visible="hotkeyDrawerVisible"
      placement="right"
    >
      <HotkeyDoc />
    </Drawer>

    <FullscreenSpin :loading="exporting" :tip="$t('importing')" />
    <FullscreenSpin :loading="exportingTest" :tip="$t('importing')" />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useScreening from '@/hooks/useScreening'
import useImport from '@/hooks/useImport'
import useImportTest from '@/hooks/useImportTest'
import useSlideHandler from '@/hooks/useSlideHandler'
import type { DialogForExportTypes } from '@/types/export'

import HotkeyDoc from './HotkeyDoc.vue'
import FileInput from '@/components/FileInput.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import Drawer from '@/components/Drawer.vue'
import Input from '@/components/Input.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'
import NavigationMenu from '@/components/Navigations/NavigationMenu.vue'

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { title } = storeToRefs(slidesStore)
const { enterScreening, enterScreeningFromStart } = useScreening()
const { importPPTXFileFusion, exporting } = useImport()
const { importPPTXFile, importJSONFile, importPPTXFileGenerate, exportingTest } = useImportTest()
const { resetSlides } = useSlideHandler()

const mainMenuVisible = ref(false)
const hotkeyDrawerVisible = ref(false)
const editingTitle = ref(false)
const titleInputRef = ref<InstanceType<typeof Input>>()
const titleValue = ref('')

const startEditTitle = () => {
  titleValue.value = title.value
  editingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

const handleUpdateTitle = () => {
  slidesStore.setTitle(titleValue.value)
  editingTitle.value = false
}

// const goLink = (url: string) => {
//   window.open(url)
//   mainMenuVisible.value = false
// }

const setDialogForExport = (type: DialogForExportTypes) => {
  mainStore.setDialogForExport(type)
  mainMenuVisible.value = false
}

const setCreateDocument = () => {
  mainStore.setCreateDocumentState(true)
  mainMenuVisible.value = false
}
</script>

<style lang="scss" scoped>
.editor-header {
  background-color: $lightGray;
  user-select: none;
  // border-bottom: 1px solid $borderColor;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}
.left, .right {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
}
.menu-item {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 0 5px;
  // border-radius: $borderRadius;
  cursor: pointer;

  .icon {
    font-size: 18px;
    color: $blackColor;
  }

  &:hover {
    background-color: #f1f1f1;
  }
}
.group-menu-item {
  height: 30px;
  display: none;
  margin: 0 8px;
  padding: 0 2px;
  border-radius: $borderRadius;

  &:hover {
    background-color: #f1f1f1;
  }

  .menu-item {
    padding: 0 3px;
  }
  .arrow-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 0;
  margin-bottom: 5px;
  .left-up {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .icon-file {
      padding: 2px 5px;
      margin-bottom: 3px;
      align-items: center;
      cursor: pointer;

      .icon {
        font-size: 10px;
        color: $blackColor;
      }

      &:hover {
        background-color: #f1f1f1;
      }
    }
  }
  .title {
    height: 30px;
    margin-left: 2px;
    font-size: 13px;
    color: $blackColor;
    margin-right: 5px;

    .title-input {
      width: 200px;
      height: 100%;
      padding-left: 0;
    }
    .title-text {
      min-width: 20px;
      max-width: 400px;
      line-height: 30px;
      padding: 0 1px;
      border-radius: $borderRadius;
      cursor: pointer;

      @include ellipsis-oneline();

      &:hover {
        background-color: #f1f1f1;
      }
    }
  }
  .left-down {
    height: 20px;
    margin-left: 2px;
  }
}
.github-link {
  display: inline-block;
  height: 30px;
}
</style>