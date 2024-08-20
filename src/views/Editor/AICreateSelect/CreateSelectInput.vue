<template>
    <div class="content">
      <div class="item knowledge_title">关联知识库</div>
        <div class="item knowledge_select_collect" ref="knowledgeSelectCollect">
            <div class="knowledge_select_collect_judge">
              <div v-if="selectKnowledgeDatas.length > 0" class="knowledge_select_collect_list">
                <div v-for="knowledgeItem in selectKnowledgeDatas" :key="knowledgeItem.id" class="knowledge_select_item">
                  <svg-icon class="knowledge_select_icon" icon="file-pptx" size="20"/>
                  <div class="knowledge_select_title">{{ knowledgeItem.name }}</div>
                  <svg-icon class="knowledge_select_close" icon="close" size="10" @click="removeKnowledgeItemClick(knowledgeItem)"/>
                </div>
              </div>
              <div v-else class="knowledge_no_select_tips" @click="handlerAllKnowledgeListClick()">
                <svg-icon class="knowledge_no_select_tips_icon" icon="file-pptx" size="20"/>
                <div class="knowledge_no_select_tips_title">请关联知识库</div>
              </div>
            </div>
          <div class="knowledge_select_controls" @click="handlerAllKnowledgeListClick()">
            <svg-icon class="knowledge_select_down" icon="angle-top" size="12"/>
          </div>
          <Popover
            trigger="click"
            placement="bottom-start"
            v-model:value="knowledgeSelectPopoverVisible"
            :contentStyle="{
              borderColor: '#dbdbdb',
            }"
            :offset="offset"
            center
          >
            <template #content>
              <KnowledgeSelect
                :knowledgeDatas="knowledgeDatas"
                :selectKnowledgeDatas="selectKnowledgeDatas"
                @selectKnowledgeItemClick="selectKnowledgeItemClick"
                @removeKnowledgeItemClick="removeKnowledgeItemClick"
                @closeKnowledgeSelect="handleCloseKnowledgeSelect"
                :popoverWidth="knowledgeSelectPopoverWidth"
              />
            </template>
          </Popover>
        </div>
        <div class="item create_input_select">
            <div class="create_input_title">你想创建一个什么演示文稿</div>
            <div class="create_slide_card_select custom-select-wrapper">
                <select v-model="selectCardNum" class="custom-select" style="width: 100px">
                  <option v-for="cardNumData in cardNumDatas" :key="cardNumData.id" :value="cardNumData.cardNum">
                    {{ cardNumData.cardNum }}
                  </option>
                </select>
                <svg-icon class="arrow-icon" icon="angle-top" size="10"/>
            </div>
            <textarea class="create_input_desc" v-model="createSlideDesc" placeholder="请输入任何语言的主题"></textarea>
            <div class="create_input_point"></div>
            <div class="create_input_divider"></div>
            <div class="create_generate" @click="handleGenerateClick()">
                <div class="create_generate_text">生成大纲</div>
                <svg-icon icon="icon_generate" size="14"/>
            </div>
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
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, onMounted, watch } from 'vue'
import { useRouter} from 'vue-router'
import GenerateSureDialog from './CreatePPTXGenerateDialog.vue'
import Popover from '@/components/PopoverNoBorder.vue'
import KnowledgeSelect from './KnowledgeSelect.vue'
const router = useRouter()

const knowledgeSelectCollect = ref(null)
const knowledgeSelectPopoverVisible = ref(false)
const knowledgeSelectPopoverWidth = ref(697)
const offset = ref([-knowledgeSelectPopoverWidth.value, 30])

export interface KnowledgeData {
  name: string;
  id: string;
  icon: string;
}

const knowledgeDatas: KnowledgeData[] = [
  { name: '关联知识库1', id: 'id1', icon: 'id1'},
  { name: '关联知识库2', id: 'id2', icon: 'id2'},
  { name: '关联知识库3', id: 'id3', icon: 'id3'},
  { name: '关联知识库4', id: 'id4', icon: 'id4'},
  { name: '关联知识库5', id: 'id5', icon: 'id5'},
  { name: '关联知识库6', id: 'id6', icon: 'id6'},
  { name: '关联知识库7', id: 'id7', icon: 'id7'},
  { name: '关联知识库8', id: 'id8', icon: 'id8'},
]
// const selectKnowledgeDatas = ref<KnowledgeData[]>([{ name: '关联知识库1', id: 'id1', icon: 'id1'}])
const selectKnowledgeDatas = ref<KnowledgeData[]>(Array.from(knowledgeDatas.values()))

const selectKnowledgeItemClick = (item: KnowledgeData) => {
  const length = selectKnowledgeDatas.value.length ?? 0
  if (!selectKnowledgeDatas.value.some(k => k.id === item.id)) {
    selectKnowledgeDatas.value.push(item)
  }
  // console.log('selectKnowledgeItemClick 7777 length:%d, newLenght:%d', length, selectKnowledgeDatas.value.length)
}

const handleCloseKnowledgeSelect = (isClose: boolean) => {
  knowledgeSelectPopoverVisible.value = !isClose
}

const handlerAllKnowledgeListClick = () => {
  // selectKnowledgeDatas.value = Array.from(knowledgeDatas.values())
  if (knowledgeSelectCollect.value) {
    const { top, left, width, height } = (knowledgeSelectCollect.value as Element).getBoundingClientRect()
    knowledgeSelectPopoverWidth.value = width - 5
    offset.value = [-knowledgeSelectPopoverWidth.value + 4, height / 2]
  } 
  else {
    knowledgeSelectPopoverWidth.value = 697
    offset.value = [-knowledgeSelectPopoverWidth.value, 30]
  }
  knowledgeSelectPopoverVisible.value = true
}

const removeKnowledgeItemClick = (item: KnowledgeData) => {
  const length = selectKnowledgeDatas.value.length ?? 0
  // if (length <= 1) {
  //   return
  // }
  selectKnowledgeDatas.value = selectKnowledgeDatas.value.filter(k => k.id !== item.id)
  // console.log('removeKnowledgeItemClick 888 length:%d, newLenght:%d', length, selectKnowledgeDatas.value.length)
}

const cardNumDatas = [
  { cardNum: '5张卡片', id: 'id1'},
  { cardNum: '10张卡片', id: 'id2'},
  { cardNum: '20张卡片', id: 'id3'},
  { cardNum: '30张卡片', id: 'id4'},
  { cardNum: '40张卡片', id: 'id5'},
]
const selectCardNum = ref(cardNumDatas[3].cardNum)
const createSlideDesc = ref('')
const isDialogVisible = ref(false)
const handleVisibilityChange = (newVisibility: boolean) => {
  isDialogVisible.value = newVisibility
}
const handleDialogSure = () => {
  handleVisibilityChange(false)
  router.push('/InputGenerateOutline').catch(error => console.warn('InputGenerateOutline Navigation failed:', error))
}
const handleDialogCancel = () => {
  handleVisibilityChange(false)
}
const handleGenerateClick = () => {
  handleVisibilityChange(true)
}

// 在组件挂载后获取元素信息
onMounted(() => {
  if (knowledgeSelectCollect.value) {
    // if (knowledgeSelectCollect.value instanceof Element) {
    const { top, left, width, height } = (knowledgeSelectCollect.value as Element).getBoundingClientRect()
    // }
    knowledgeSelectPopoverWidth.value = width - 5
    offset.value = [-knowledgeSelectPopoverWidth.value + 4, height / 2]
  }
})

watch(createSlideDesc, (newValue, oldValue) => {
  console.log('新的值:', newValue)
})

onBeforeUnmount(() => {
  // 清理
})

</script>

<style lang="scss" scoped>
// ::v-deep(.el-select-dropdown) {
//   z-index: 2000 !important;
// }

.content {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 30px;
  margin-bottom: 70px;
  width: 100%;
}

.item {
  margin-left: 48px;
  margin-right: 48px;
  width: calc(100% - 96px);
}

.knowledge_title {
  color: #000;
  font-size: 12px;
}

.knowledge_select_collect {
  border-radius: 5px;
  display: flex;
  border: 1px solid #dbdbdb;
  align-items: center;
  height: 50px;
  padding: 5px 5px 5px 8px;
  position: relative;

  .knowledge_select_collect_judge {
    height: 100%;
    width: 100%;
    margin-right: 35px;
    align-items: flex-start;
    overflow-x: auto;
    scrollbar-width: none; // 隐藏Firefox的滚动条
      // 隐藏滚动条的样式
    &::-webkit-scrollbar {
      display: none;
    }

    &::before {
      content: "";
      flex: 1;
    }

    .knowledge_select_collect_list {
      width: 100%;
      height: 100%;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .knowledge_select_item {
      background-color: #f9f9f9;
      height: 100%;
      display: flex;
      border-radius: 5px;
      align-items: center;

      .knowledge_select_icon {
        margin-left: 8px;
      }

      .knowledge_select_title {
        margin-left: 5px;
        margin-right: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .knowledge_select_close {
        padding: 10px;
        cursor: pointer;
      }
    }

    .knowledge_no_select_tips {
      width: 100%;
      background-color: #f9f9f9;
      height: 100%;
      display: flex;
      border-radius: 5px;
      align-items: center;
      overflow-x: auto;

      .knowledge_no_select_tips_icon {
        margin-left: 8px;
      }
      .knowledge_no_select_tips_title {
        margin-left: 5px;
        margin-right: 10px;
      }
    }
  }

  .knowledge_select_controls {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 30px;
    right: 0; /* 固定到右侧 */
    top: 0;
    bottom: 0;
    padding-right: 8px;
    cursor: pointer;

    .knowledge_select_down {
      width: 100%;
      height: 100%;
      transform: rotate(180deg);
    }
  }
}

.create_input_select {
  position: relative;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-top: 8px;
  height: 330px;
  padding: 13px;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 5px;

  .create_input_title {
    color: #000;
    font-weight: 500;
    font-size: 14px;
  }

  .create_slide_card_select {
    position: absolute;
    top: 13px;
    right: 13px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;

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

    .custom-select-wrapper {
      position: relative; /* 为箭头图标设置相对定位 */
      display: inline-block;
    }

    .arrow-icon {
      position: absolute;
      top: 35%;
      right: 10px;
      margin-right: 5px;
      transform: translateY(-50%);
      transform: rotate(180deg);
      pointer-events: none; /* 避免点击箭头时影响选择框 */
      color: #999;
      font-size: 0.8em; /* 调整箭头大小 */
    }
  }

  .create_input_desc {
    font-weight: 300;
    font-size: 14px;
    height: 160px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    resize: none;
    color: #000;
    margin-top: 15px;

    &::placeholder {
      color: #dbdbdb;
    }
  }

  .create_input_point {
    border-radius: 50%;
    width: 4px;
    height: 4px;
    background-color: #2aba8a;
  }

  .create_input_divider {
    border-radius: 2px;
    height: 4px;
    background-color: #f4f4f4;
  }

  .create_generate {
    border-radius: 5px;
    height: 50px;
    margin-top: 8px;
    background-color: #2aba8a;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;

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