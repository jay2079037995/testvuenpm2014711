<template>
  <div class="content">
    <div class="pptx_generate_top">
      <div class="pptx_generate_title">Title</div>
      <div class="pptx_generate_sub">环保的重要性</div>
    </div>
    <Draggable class="pptx_generate_slides"
      item-key="id"
      :list="dragSlideList"
      ghost-class="_ghost"
      chosen-class="_chosenClass"
      :animation="200"
      :scroll="false"
      :scrollSensitivity="50"
      @end="handleDragEnd"
    >
        <template #item="{ element, index }">
          <div class="pptx_generate_slide">
            <div class="pptx_slide_num">{{ index + 1 }}</div>
              <!-- <div v-if="element.type === 'edit'" class="pptx_slide_title_edit">{{ element.title }}</div> -->
              <template v-if="element.type === 'edit'">
                <input type="text" v-model="element.title" :placeholder="element.title || '请输入标题'" class="pptx_slide_title_edit" />
              </template>
              <div v-else class="pptx_slide_title">{{ element.title }}</div>
              <div class="pptx_slide_operate">
                  <svg-icon class="pptx_slide_drag" icon="drag2" color="#cecece" size="20"/>
                  <svg-icon class="pptx_slide_click" icon="add2" color="#cecece" size="10" @click="handleAddSlideClick(index)"/>
                  <svg-icon class="pptx_slide_click" icon="reduce2" color="#cecece" size="10" @click="handleRemoveSlideClick(element, index)"/>
              </div>
          </div>
        </template>
    </Draggable>
  <div class="pptx_generate" @click="handleGenerateClick()">
    <div class="pptx_generate_text">生成页面</div>
    <svg-icon icon="icon_generate" size="14"/>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="showSelectTheme" class="fullscreen-overlay">
      <div class="fullscreen-content">
        <SelectTheme v-model="parentGenerateLoading"
          @update:isShow="handleShowSelectThemeChange"
          @confirm="handleSelectTheme"
          @close="showSelectThemeClose" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { type PropType, type Ref, onMounted, ref, watchEffect } from 'vue'
import Draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/store'
import SelectTheme, { type ThemeTypeData } from './PPTXGenerateSelectTheme.vue'
const mainStore = useMainStore()
const router = useRouter()

interface GenerateSlideModel {
  id: string,
  title: string
  type?: string
}

const props = defineProps({
  generateSlideDatas: { type: Array as PropType<GenerateSlideModel[]>, required: true },
})

// 这里的数据供调试使用，亦可从外部传入数据配合watchEffect使用
const dragSlideList: Ref<GenerateSlideModel[]> = ref([
  {id: '1', title: '黄金保护意义'},
  {id: '3', title: '环保意识的提升'},
  {id: '0', title: '环境保护的必要性'},
  {id: '2', title: '可持续发展'},
  {id: '4', title: '环保行为的影响'},
  {id: '5', title: '环保政策与法规'},
  {id: '6', title: '黄金保护意义2'},
  {id: '7', title: '环保意识的提升2'},
  {id: '8', title: '环境保护的必要性2'}
])

const showSelectTheme = ref(false)
const parentGenerateLoading = ref(false)
onMounted(() => {
  // 初始化逻辑
})

watchEffect(() => {
  if ((props.generateSlideDatas ?? []).length > 0) {
    dragSlideList.value = props.generateSlideDatas
  }
  console.log('parentGenerateLoading的值已更新为:', parentGenerateLoading.value)
})

const handleDragEnd = (eventData: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = eventData
  // console.log('handleDragEnd newIndex:%d, oldIndex:%d', newIndex, oldIndex)
  if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) {
    return
  }
  console.log('handleDragEnd dragSlideList: ', dragSlideList.value)
}

const handleAddSlideClick = (index: number) => {
  const length = dragSlideList.value.length
  if (index < length && index >= 0) {
    dragSlideList.value.splice(index + 1, 0, {id: `${length + 1}`, title: `新增的标题${length + 1}`, type: 'edit'})
  }
  // console.log('handleAddSlideClick index: ', index)
}

const handleRemoveSlideClick = (slideData: GenerateSlideModel, index: number) => {
  const length = dragSlideList.value.length
  if (index < length && index >= 0) {
    dragSlideList.value.splice(index, 1)
  }
}

const handleShowSelectThemeChange = (newShow: boolean) => {
  showSelectTheme.value = newShow
}
const showSelectThemeClose = () => {
  handleShowSelectThemeChange(false)
  console.log('showSelectThemeClose parentGenerateLoading:', parentGenerateLoading.value)
}

const handleSelectTheme = (themeData: ThemeTypeData) => {
  mainStore.setCreateDocumentState(false)
  mainStore.setCreateNewPPTXState(false)
  router.replace({ name: 'Home' })
  console.log('handleSelectTheme parentGenerateLoading:%s, themeData:%o', parentGenerateLoading.value, themeData)
  handleShowSelectThemeChange(false)
}

const handleGenerateClick = () => {
  handleShowSelectThemeChange(true)
}
</script>

<style lang="scss" scoped>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(255, 255, 255, 1.0);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 11000 !important; //其他地方有9999了
}

.fullscreen-content {
  width: 100%;
  max-width: 100%;
  height: auto;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  margin: 35px 50px 65px !important;
  border: 1px solid #ddd;
  height: 370px;
  width: 100%;
  border-radius: 7px;
}

.pptx_generate_top {
  border-radius: 5px;
  display: flex;
  height: 50px;
  flex-direction: column;
  margin: 12px 18px 0 18px;
  background-color: #f5f5f5;
  padding: 5px 15px;

  .pptx_generate_title {
    color: #000;
    font-weight: 200;
    font-size: 10px;
  }

  .pptx_generate_sub {
    color: #000;
    margin-top: 1px;
    font-weight: 350;
    font-size: 15px;
  }
}

.pptx_generate_slides {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 10px 18px;
  overflow-y: auto;
  max-height: calc(100% - (50px + 55px + 40px));

  ._ghost {
    border: 1px solid #2aba8a;
  }
  ._chosenClass {
    background-color: #f1f1f1;
  }
}

.pptx_generate_slide {
  border-radius: 5px;
  background-color: #f5f5f5;
  padding: 5px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:active, &:hover {
    background-color: #f5f5f590 !important;
  }

  .pptx_slide_num {
    color: #667085;
    width: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 200;
    font-size: 10px;
  }

  .pptx_slide_title {
    color: #000;
    margin-top: 1px;
    margin-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    flex: 1;
    font-weight: 330;
    font-size: 12px;
  }

  .pptx_slide_title_edit {
    color: #000;
    margin-top: 1px;
    margin-right: 10px;
    flex: 1;
    font-weight: 330;
    font-size: 12px;
    padding: 5px 5px;
    border-radius: 5px;
    border: 1px solid #f1f1f1; 
    transition: border-color 0.3s ease;
    outline: none;

    &::placeholder {
      color: #999;
    }

    &:hover, &:active {
      // outline: none;
      border-color: #2aba8a;
    }

    &:focus {
      border-color: #2aba8a !important;
    }
  }

  .pptx_slide_operate {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    direction: rtl;
    gap: 10px;

    .pptx_slide_click {
      cursor: pointer;
    }

    .pptx_slide_drag {
      cursor: move;
      padding-right: 5px;
    }
  }
}

.pptx_generate_slide + .pptx_generate_slide {
  margin-top: 10px;
}

.pptx_generate {
  border-radius: 5px;
  height: 50px;
  width: calc(100% - 36px);
  margin-bottom: 13px;
  margin-left: 18px;
  margin-right: 18px;
  background-color: #2aba8a;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .pptx_generate_text {
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
</style>