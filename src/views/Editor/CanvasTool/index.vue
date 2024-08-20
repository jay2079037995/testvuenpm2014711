<template>
  <div class="canvas-tool">
    <div class="left-handler">
      <IconReturn class="handler-item" :class="{ 'disable': !canUndo }" v-tooltip="$t('canvasTool.undo')" @click="undo()" />
      <IconGoOn class="handler-item" :class="{ 'disable': !canRedo }" v-tooltip="$t('canvasTool.redo')" @click="redo()" />
      <Divider type="vertical" style="height: 20px; border-inline-start: 1px solid $canvasDividerColor; margin: 0 2px;" />
      <IconMoveOne class="handler-item" :class="{ 'active': showSelectPanel }" v-tooltip="$t('canvasTool.selectPanel')" @click="toggleSelectPanel()" />
      <Divider type="vertical" style="height: 20px; border-inline-start: 1px solid $canvasDividerColor; margin: 0 2px;" />
      <IconSearch class="handler-item" :class="{ 'active': showSearchPanel }" v-tooltip="$t('canvasTool.searchPanel')" @click="toggleSraechPanel()" />
      <Divider type="vertical" style="height: 20px; border-inline-start: 1px solid $canvasDividerColor; margin: 0 2px;" />
      
    </div>

    <div class="add-element-handler">
      <div class="handler-item group-btn" v-tooltip="$t('canvasTool.insertText')">
        <IconFontSize class="icon" :class="{ 'active': creatingElement?.type === 'text' }" @click="drawText()" />
        
        <Popover trigger="click" v-model:value="textTypeSelectVisible" style="height: 100%;">
          <template #content>
            <PopoverMenuItem center @click="() => { drawText(); textTypeSelectVisible = false }"><IconTextRotationNone />{{ $t('canvasTool.horizontalTextBox') }}</PopoverMenuItem>
            <PopoverMenuItem center @click="() => { drawText(true); textTypeSelectVisible = false }"><IconTextRotationDown />{{ $t('canvasTool.verticalTextBox') }}</PopoverMenuItem>
          </template>
          <IconDown class="arrow" />
        </Popover>
      </div>
      <FileInput @change="files => insertImageElement(files)">
        <IconPicture class="handler-item" v-tooltip="$t('canvasTool.insertImage')" />
      </FileInput>
      <Popover trigger="click" v-model:value="shapePoolVisible">
        <template #content>
          <ShapePool @select="shape => drawShape(shape)" />
        </template>
        <IconGraphicDesign class="handler-item" :class="{ 'active': creatingCustomShape || creatingElement?.type === 'shape' }" v-tooltip="$t('canvasTool.insertShare')" />
      </Popover>
      <Popover trigger="click" v-model:value="linePoolVisible">
        <template #content>
          <LinePool @select="line => drawLine(line)" />
        </template>
        <IconConnection class="handler-item" :class="{ 'active': creatingElement?.type === 'line' }" v-tooltip="$t('canvasTool.insertLine')" />
      </Popover>
      <Popover trigger="click" v-model:value="chartPoolVisible">
        <template #content>
          <ChartPool @select="chart => { createChartElement(chart); chartPoolVisible = false }" />
        </template>
        <IconChartProportion class="handler-item" v-tooltip="$t('canvasTool.insertChart')" />
      </Popover>
      <Popover trigger="click" v-model:value="tableGeneratorVisible">
        <template #content>
          <TableGenerator
            @close="tableGeneratorVisible = false"
            @insert="({ row, col }) => { createTableElement(row, col); tableGeneratorVisible = false }"
          />
        </template>
        <IconInsertTable class="handler-item" v-tooltip="$t('canvasTool.insertTable')" />
      </Popover>
      <IconFormula class="handler-item" v-tooltip="$t('canvasTool.insertLatex')" @click="latexEditorVisible = true" />
      <!-- accept="video/*, image/*, audio/*" accept=".mp3, .wav, .aiff, .mp4, .avi, .mov, .mp4, .avi, .mov"   -->
      <FileInput accept="video/*" @change="files => insertVideoElement(files)">
        <IconVideoTwo class="handler-item" v-tooltip="$t('canvasTool.insertVideo')" />
      </FileInput>
      <Popover trigger="click" v-model:value="mediaInputVisible">
        <template #content>
          <MediaInput 
            @close="mediaInputVisible = false"
            @insertVideo="src => { createVideoElement(src); mediaInputVisible = false }"
            @insertAudio="src => { createAudioElement(src); mediaInputVisible = false }"
          />
        </template>
        <svg-icon class="handler-item svg-margin" icon="tool-link" size="24" v-tooltip="$t('canvasTool.insertAudioVideo')"/>
      </Popover>
      <svg-icon class="handler-item hidden svg-margin" name="tool-record-icon" icon="tool-record" size="24" v-tooltip="$t('canvasTool.record')"/>
    </div>

    <div class="right-handler">
      <IconMinus class="handler-item viewport-size" @click="scaleCanvas('-')" />
      <Popover trigger="click" v-model:value="canvasScaleVisible">
        <template #content>
          <PopoverMenuItem
            center
            v-for="item in canvasScalePresetList" 
            :key="item" 
            @click="applyCanvasPresetScale(item)"
          >{{item}}%</PopoverMenuItem>
        </template>
        <span class="text">{{canvasScalePercentage}}</span>
      </Popover>
      <IconPlus class="handler-item viewport-size" @click="scaleCanvas('+')" />
      <IconFullScreen class="handler-item viewport-size-adaptation" v-tooltip="$t('canvasTool.adaptScreen')" @click="resetCanvas()" />

      <div class="group-menu-item">
        <div class="handler-item" v-tooltip="$t('slidePlay')" @click="enterScreening()">
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
      <div class="handler-item" v-tooltip="$t('export')" @click="setDialogForExport('pptx')">
        <IconDownload class="icon" />
      </div>
      <div class="play-button">
        <Popover trigger="click" center>
          <template #content>
            <PopoverMenuItem @click="enterScreeningFromStart()">{{$t('slidePlayStart')}}</PopoverMenuItem>
            <PopoverMenuItem @click="enterScreening()">{{$t('slidePlayCurrent')}}</PopoverMenuItem>
          </template>
          <div class="arrow-btn">
            <svg-icon icon="play-present" size="8"/>
          </div>
        </Popover>
        <p class="play-button-text" v-tooltip="$t('slidePlay')" @click="enterScreening()">{{ $t('canvasTool.present') }}</p>
      </div>
    </div>

    <Modal
      v-model:visible="latexEditorVisible" 
      :width="880"
    >
      <LaTeXEditor 
        @close="latexEditorVisible = false"
        @update="data => { createLatexElement(data); latexEditorVisible = false }"
      />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSnapshotStore } from '@/store'
import { getImageDataURL } from '@/utils/image'
import { getVideoDataURL } from '@/utils/audioVideo'
import type { ShapePoolItem } from '@/configs/shapes'
import type { LinePoolItem } from '@/configs/lines'
import useScaleCanvas from '@/hooks/useScaleCanvas'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useCreateElement from '@/hooks/useCreateElement'
import type { DialogForExportTypes } from '@/types/export'
import ShapePool from './ShapePool.vue'
import LinePool from './LinePool.vue'
import ChartPool from './ChartPool.vue'
import TableGenerator from './TableGenerator.vue'
import MediaInput from './MediaInput.vue'
import LaTeXEditor from '@/components/LaTeXEditor/index.vue'
import FileInput from '@/components/FileInput.vue'
import Modal from '@/components/Modal.vue'
import Divider from '@/components/Divider.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'
import useScreening from '@/hooks/useScreening'

const mainStore = useMainStore()
const { creatingElement, creatingCustomShape, showSelectPanel, showSearchPanel } = storeToRefs(mainStore)
const { canUndo, canRedo } = storeToRefs(useSnapshotStore())

const { redo, undo } = useHistorySnapshot()

const { enterScreening, enterScreeningFromStart } = useScreening()
const mainMenuVisible = ref(false)

const {
  scaleCanvas,
  setCanvasScalePercentage,
  resetCanvas,
  canvasScalePercentage,
} = useScaleCanvas()

const canvasScalePresetList = [200, 150, 125, 100, 75, 50]
const canvasScaleVisible = ref(false)

const applyCanvasPresetScale = (value: number) => {
  setCanvasScalePercentage(value)
  canvasScaleVisible.value = false
}

const {
  createImageElement,
  createChartElement,
  createTableElement,
  createLatexElement,
  createVideoElement,
  createAudioElement,
} = useCreateElement()

const insertImageElement = (files: FileList) => {
  const imageFile = files[0]
  if (!imageFile) return
  getImageDataURL(imageFile).then(dataURL => createImageElement(dataURL))
}

const insertVideoElement = (files: FileList) => {
  const videoFile = files[0]
  if (!videoFile) return
  getVideoDataURL(videoFile).then(dataURL => createVideoElement(dataURL))
}

const shapePoolVisible = ref(false)
const linePoolVisible = ref(false)
const chartPoolVisible = ref(false)
const tableGeneratorVisible = ref(false)
const mediaInputVisible = ref(false)
const latexEditorVisible = ref(false)
const textTypeSelectVisible = ref(false)

// 绘制文字范围
const drawText = (vertical = false) => {
  mainStore.setCreatingElement({
    type: 'text',
    vertical,
  })
}

// 绘制形状范围（或绘制自定义任意多边形）
const drawShape = (shape: ShapePoolItem) => {
  if (shape.title === '任意多边形') {
    mainStore.setCreatingCustomShapeState(true)
  }
  else {
    mainStore.setCreatingElement({
      type: 'shape',
      data: shape,
    })
  }
  shapePoolVisible.value = false
}

// 绘制线条路径
const drawLine = (line: LinePoolItem) => {
  mainStore.setCreatingElement({
    type: 'line',
    data: line,
  })
  linePoolVisible.value = false
}

// 打开选择面板
const toggleSelectPanel = () => {
  mainStore.setSelectPanelState(!showSelectPanel.value)
}

// 打开搜索替换面板
const toggleSraechPanel = () => {
  mainStore.setSearchPanelState(!showSearchPanel.value)
}

const setDialogForExport = (type: DialogForExportTypes) => {
  mainStore.setDialogForExport(type)
  mainMenuVisible.value = false
}

</script>

<style lang="scss" scoped>
.canvas-tool {
  position: relative;
  // border-bottom: 1px solid $borderColor;
  background-color: $canvasToolColor;
  border-radius: 360px;
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 13px;
  user-select: none;
}
.left-handler {
  display: flex;
  align-items: center;
  color: $blackColor;
}
.add-element-handler {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;

  .handler-item {
    width: 32px;
    color: $blackColor;

    &:not(.group-btn):hover {
      background-color: #f1f1f1;
    }

    &.active {
      color: $themeColor;
    }

    &.group-btn {
      width: auto;
      margin-right: 4px;

      &:hover {
        background-color: #f3f3f3;
      }

      .icon, .arrow {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .icon {
        width: 26px;
        padding: 0 2px;
        color: $blackColor;

        &:hover {
          background-color: #e9e9e9;
        }
        &.active {
          color: $themeColor;
        }
      }
      .arrow {
        font-size: 12px;
        color: #757575;

        &:hover {
          background-color: #e9e9e9;
        }
      }
    }
  }
}
.handler-item {
  height: 24px;
  font-size: 14px;
  margin: 0 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: $borderRadius;
  overflow: hidden;
  cursor: pointer;

  &.disable {
    opacity: .5;
  }
}
.left-handler, .right-handler {
  .handler-item {
    padding: 0 8px;

    &.active,
    &:not(.disable):hover {
      background-color: #f1f1f1;
    }
  }
}
.right-handler {
  display: flex;
  align-items: center;
  color: $blackColor;
  .text {
    display: inline-block;
    width: 40px;
    text-align: center;
    cursor: pointer;
  }

  .viewport-size {
    font-size: 13px;
  }

  .group-menu-item {
    height: 30px;
    display: none;
    margin: 0 8px;
    padding: 0 2px;
    // border-radius: $borderRadius;
    align-items: center;
    &:hover {
      background-color: #f1f1f1;
    }
    .arrow-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: #757575;
    }
  }

  .play-button {
    margin: 0 5px 0 10px;
    height: 25px;
    width: 85px;
    display: flex;
    background-color: $themeColor;
    padding: 0 10px 0 5px;
    border-radius: 5px;
    &:hover {
      background-color: $themeHoverColor;
    }

    .arrow-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2px 8px 2px 5px;
      cursor: pointer;
      color: #757575;
    }

    .play-button-text {
      display: flex;
      justify-content: center;
      align-items: center;
      color: $whiteColor;
    }
  }
}

.hidden {
  // display: none; // 将元素的显示设为无，即在网页中不占任何的位置。
  visibility: hidden;// 将元素隐藏，但是在网页中该占的位置还是占着

}

.svg-margin {
  margin-left: 5px;
  margin-right: 8px;
}

@media screen and (width <= 1024px) {
  .text {
    display: none;
  }
}
@media screen and (width <= 1000px) {
  .left-handler, .right-handler {
    // display: none;
  }
}
</style>