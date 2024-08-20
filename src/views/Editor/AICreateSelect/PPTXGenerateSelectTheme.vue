<template>
  <div class="content">
    <div class="content_show" :style="{ 'background-color': currentThemeData.themeBgColor }">
      <div class="left_content">
        <div class="left_top_content" :style="{ 'background-color': currentThemeData.themeCardColor }">
          <div class="left_top_content_text">
            <span class="left_top_content_title" :style="{ 'color': currentThemeData.themeTitleColor }">
              这里是主题预览页面
            </span>
            <span class="left_top_content_desc" :style="{ 'color': currentThemeData.themeTextColor }">
              这是正文区域。通过主题编辑器，您可以修改文字、颜色和图像，设计您自己的品牌主题。
            </span>
            <span class="left_top_content_subTitle" :style="{ 'color': currentThemeData.themeTitleColor }">
              您的突出颜色将用于链接
            </span>
          </div>
          <div class="left_top_content_img" :style="{ backgroundImage: `url(${currentThemeData.themeTitleImg})` }"></div>
        </div>
        <div class="left_bottom_content" :style="{ 'background-color': currentThemeData.themeCardColor }">
            <span class="left_bottom_content_title" :style="{ 'color': currentThemeData.themeTitleColor }">
              这里是主题预览页面
            </span>
            <span class="left_bottom_content_desc" :style="{ 'color': currentThemeData.themeTextColor }">
              这是正文区域。通过主题编辑器，您可以修改文字、颜色和图像，设计您自己的品牌主题。
            </span>
            <span class="left_bottom_content_subTitle" :style="{ 'color': currentThemeData.themeTitleColor }">
              你的突出颜色还将出现在布局和按钮中
            </span>
            <div class="left_bottom_content_frame">
              <div class="left_bottom_content_frame_content" :style="{ 'background-color': currentThemeData.themeFrameBgColor, 'border-color': currentThemeData.themeFrameBorderColor }">
                <span class="left_bottom_content_frame_content_title" :style="{ 'color': currentThemeData.themeTitleColor }">
                  这是一个智能布局
                </span>
                <span class="left_bottom_content_frame_content_desc" :style="{ 'color': currentThemeData.themeTextColor }">
                  这是一个智能布局：它会根据内容自动调整文本框大小
                </span>
              </div>
              <div class="left_bottom_content_frame_content" :style="{ 'background-color': currentThemeData.themeFrameBgColor, 'border-color': currentThemeData.themeFrameBorderColor }">
                <span class="left_bottom_content_frame_content_title" :style="{ 'color': currentThemeData.themeTitleColor }">
                  这是一个智能布局
                </span>
                <span class="left_bottom_content_frame_content_desc" :style="{ 'color': currentThemeData.themeTextColor }">
                  这是一个智能布局：它会根据内容自动调整文本框大小
                </span>
              </div>
            </div>
        </div>
      </div>
      <div class="right_content">
        <div class="theme_select_content">
          <div class="theme_select_title">选择主题</div>
          <div class="select_theme_generate" @click="handleGenerateClick()">
            <div v-if="generateLoading" class="select_theme_generate_loading" :class="{ rotating: isRotating }">
              <svg-icon icon="icon_small_loading" size="16"/>
            </div>
            <div v-if="!generateLoading" class="select_theme_generate_text">生成内容</div>
            <svg-icon v-if="!generateLoading" icon="icon_generate" size="14"/>
          </div>
          <div class="theme_select_grid">
            <div v-for="(themeItem, index) in themeDatas" :key="index" 
              class="theme_select_grid_item" :class="{ 'selected': selectedIndex === index }"
              @click="selectThemeItemClick(index, themeItem)">
              <div class="content-wrapper">
                <div class="theme_grid_item_primary" :style="{ 'background-color': themeItem.primaryBgColor }">
                  <div class="theme_select_grid_secondary" :style="{ 'border-color': themeItem.borderColor }">
                    <div class="theme_select_grid_top" :style="{ 'background-color': themeItem.secondaryBgColor || '#fff' }">
                      <div v-if="themeItem.secondaryBgImg !== undefined && themeItem.secondaryBgImg !== null" 
                        class="theme_grid_item_img" :style="{ backgroundImage: `url(${themeItem.secondaryBgImg})` }"></div>
                    </div>
                    <div class="theme_select_grid_bottom">
                      <div class="theme_grid_item_title"> {{ themeItem.title }} </div>
                      <div class="theme_grid_item_subtitle"> {{ themeItem.subTitle }} </div>
                    </div>
                  </div>
                </div>
                <div class="theme_grid_item_radio"> 
                  <input type="radio" :value="index" v-model="selectedIndex" class="theme-radio-input" />
                  <span class="theme-title">{{ themeItem.themeTitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="top_left_close" @click="handleCloseClick()">Cancel</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义接收外部绑定的属性
const props = defineProps({
  modelValue: { type: Boolean, default: false,},
})

export interface ThemeTypeData {
  title: string
  subTitle: string
  themeTitle: string
  primaryBgColor: string
  secondaryBgColor?: string
  secondaryBgImg?: string
  borderColor: string
  themeBgColor: string
  themeCardColor: string
  themeTitleColor: string
  themeTextColor: string
  themeFrameBgColor: string
  themeFrameBorderColor: string
  themeTitleImg?: string
}

const themeDatas: ThemeTypeData[] = [
  { title: '标题1', subTitle: '正文和链接', themeTitle: '默认(浅色)', primaryBgColor: '#f9f9f9',
    secondaryBgImg: require('@/assets/images/create_grid_select_light.png'), borderColor: '#ededed',
    themeBgColor: '#f9f9f9', themeTitleColor: '#000', themeTextColor: '#6e6e6e', themeFrameBgColor: '#f9f9f9', 
    themeFrameBorderColor: '#bdbdbd', themeCardColor: '#fff', themeTitleImg: require('@/assets/images/create_pptx_select_light.png') },
  { title: '标题2', subTitle: '正文和链接', themeTitle: '深色', primaryBgColor: '#0c0c0c',
    secondaryBgImg: require('@/assets/images/create_grid_select_dark.png'), borderColor: '#1a1a1a',
    themeBgColor: '#1a1a1a', themeTitleColor: '#fff', themeTextColor: '#bdbdbd', themeFrameBgColor: '#3d3d3d', 
    themeFrameBorderColor: '#6e6e6e', themeCardColor: '#000', themeTitleImg: require('@/assets/images/create_pptx_select_dark.png') },
  { title: '标题3', subTitle: '正文和链接', themeTitle: '海洋', primaryBgColor: '#ddedfc',
    secondaryBgColor: '#4ba5f8', borderColor: '#f9f9f9', themeBgColor: '#f9f9f9', themeTitleColor: '#000',
    themeTextColor: '#6e6e6e', themeFrameBgColor: '#f9f9f9', themeFrameBorderColor: '#bdbdbd', 
    themeCardColor: '#fff', themeTitleImg: require('@/assets/images/create_pptx_select_light.png') },
  { title: '标题4', subTitle: '正文和链接', themeTitle: '云彩', primaryBgColor: '#ffe7c2',
    secondaryBgColor: '#f0d6ae', borderColor: '#fef9f6', themeBgColor: '#f9f9f9', themeTitleColor: '#000', 
    themeTextColor: '#6e6e6e', themeFrameBgColor: '#f9f9f9', themeFrameBorderColor: '#bdbdbd',
    themeCardColor: '#fff', themeTitleImg: require('@/assets/images/create_pptx_select_light.png') },
]
const currentThemeData = ref(themeDatas[0])
const selectedIndex = ref(0)
const selectThemeItemClick = (index: number, themeItem: ThemeTypeData) => {
  if (selectedIndex.value !== index) {
    selectedIndex.value = index
  }
  // else if (selectedIndex.value !== -1) {
  //   selectedIndex.value = -1
  // }
  currentThemeData.value = themeItem
}

const generateLoading = ref(props.modelValue)
const isRotating = ref(generateLoading.value)
const emit = defineEmits(['update:isShow', 'confirm', 'close', 'update:modelValue'])
const handleCloseClick = () => {
  updateGenerateLoading(false)
  emit('close')
}

const updateGenerateLoading = (newValue: boolean) => {
  isRotating.value = newValue
  generateLoading.value = newValue
  console.log('updateGenerateLoading ', newValue)
  emit('update:modelValue', newValue)
}

const handleGenerateClick = () => {
  if (generateLoading.value) {
    updateGenerateLoading(false)
  }
  else {
    updateGenerateLoading(true)
    emit('confirm', currentThemeData)
  }
}

</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
}

.content_show {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  background-color: #f9f9f9;
  justify-content: space-between;
  align-items: stretch;
  padding: 45px 50px;
}

.top_left_close {
  position: absolute;
  top: 45px;
  left: 50px;
  cursor: pointer;
  width: 100px;
  height: 27px;
  background-color: #fff;
  text-align: center;
  line-height: 27px;
  border-radius: 5px;
  color: #2aba8a;
  font-size: 14px;
  font-weight: 300px;
  border: 1px solid #2aba8a;

  &:active {
    border-color: #2aba8a80;
    color: #2aba8a99;
  }

  &:hover {
    border-color: #2aba8a99;
    color: #2aba8a99;
  }
}

.left_content {
  display: flex;
  flex-direction: column;
  flex: 11;
  height: 100%;
  padding: 80px 90px 30px 48px;
  gap: 45px;
}

.left_top_content,
.left_bottom_content {
  flex: 1;
  box-shadow: -4px 0 4px rgba(0, 0, 0, 0.2),
    4px 0 4px rgba(0, 0, 0, 0.2),
    0 -2px 4px rgba(0, 0, 0, 0.1),
    0 7px 4px rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
}

.left_top_content {
  display: flex;
  background-color: #fff;
  flex: 1;
  align-items: center;
  width: 100%;

  .left_top_content_text {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 50px;
    flex: 7;

    .left_top_content_title {
      font-size: 31px;
      color: #000;
      width: 100%;
      font-weight: 350;
    }

    .left_top_content_desc {
      font-size: 12px;
      margin-top: 15px;
      color: #6e6e6e;
      width: 100%;
      font-weight: 200;
    }

    .left_top_content_subTitle {
      font-size: 15px;
      color: #000;
      width: 100%;
      margin-top: 24px;
      font-weight: 500;
      text-decoration: underline;
    }
  }

  .left_top_content_img {
    height: 100%;
    flex: 3;
    border-radius: 0 5px 5px 0;
    background-size: cover;
    background-position: center;
  }
}

.left_bottom_content {
  display: flex;
  background-color: #fff;
  flex: 1;
  flex-direction: column;
  width: 100%;
  padding: 50px;

  .left_bottom_content_title {
    font-size: 31px;
    color: #000;
    font-weight: 350;
  }

  .left_bottom_content_desc {
    font-size: 12px;
    margin-top: 15px;
    color: #6e6e6e;
    font-weight: 200;
  }

  .left_bottom_content_subTitle {
    font-size: 13px;
    color: #000;
    margin-top: 25px;
    font-weight: 400;
  }

  .left_bottom_content_frame {
    margin-top: 25px;
    display: flex;
    gap: 50px;

    .left_bottom_content_frame_content {
      background-color: #f9f9f9;
      border: 1px solid #bdbdbd;
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      padding: 15px;
      flex: 1;

      .left_bottom_content_frame_content_title {
        font-size: 18px;
        color: #fff;
        font-weight: 350;
      }

      .left_bottom_content_frame_content_desc {
        font-size: 12px;
        margin-top: 7px;
        color: #6e6e6e;
        font-weight: 250;
      }
    }
  }
}

.right_content {
  display: flex;
  flex: 7;
  padding: 40px 30px;
  align-items: flex-start;
}

.theme_select_content {
  border-radius: 5px;
  background-color: #fff;
  border: 1px solid #ebebeb;
  margin-left: 20px;
  width: 100%;
  height: auto;
  min-height: 400px;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .theme_select_title {
    color: #202124;
    font-size: 16px;
    font-weight: 600;
    margin-left: 2px;
    margin-top: 2px;
  }
}

.select_theme_generate {
  border-radius: 5px;
  height: 45px;
  width: calc(100% - 4px);
  margin-top: 15px;
  margin-left: 2px;
  margin-right: 2px;
  background-color: #2aba8a;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .select_theme_generate_text {
    color: #fff;
    font-size: 14px;
  }

  &:active {
    background-color: #2aba8a80;
  }

  &:hover {
    background-color: #2aba8a99;
  }

  .select_theme_generate_loading {
    width: 16px;
    height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .select_theme_generate_loading svg {
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
}

.theme_select_grid {
  padding: 20px 2px 30px 2px;
  display: grid;
  grid-gap: 15px;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);

  .theme_select_grid_item {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-bottom: calc((22 / 25) * 100%);
    overflow: hidden;
  }

  /* 创建一个内部容器来包裹实际内容，使其不受到宽高比影响 */
  .theme_select_grid_item > .content-wrapper {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #f9f9f9;
    border-radius: 20px;
    padding: 15px 15px 0 15px;

    &.selected {
      border-color: #2aba8a;
    }

    &:hover, &:active {
      border-color: #2aba8a;
    }
  }

  .theme_grid_item_primary {
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    border-radius: 15px;
    padding: 15px 20px;

    .theme_select_grid_secondary {
      width: 100%;
      border-radius: 15px;
      border: 1px solid #ededed;

      .theme_select_grid_top {
        width: 100%;
        height: 40px;
        background-color: #fff;
        border-radius: 14px 14px 0 0;

        .theme_grid_item_img {
          width: 100%;
          height: 100%;
          border-radius: 14px 14px 0 0;
          background-size: cover;
          background-position: center;
        }
      }

      .theme_select_grid_bottom {
        width: 100%;
        display: flex;
        background-color: #fff;
        flex-direction: column;
        padding: 15px 15px 10px 15px;
        border-radius: 0 0 14px 14px;


        .theme_grid_item_title {
          color: 000;
          font-size: 16px;
          font-weight: 400;
        }

        .theme_grid_item_subtitle {
          color: 000;
          font-size: 10px;
          margin-top: 2px;
          font-weight: 250;
        }
      }
    }
  }

  .theme_grid_item_radio {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-align: center;
    width: 100%;
    height: 100%;

    .theme-radio-input {
      margin-right: 10px; /* 添加间距以区分单选框和标题 */
      appearance: none; /* 隐藏原生单选框样式 */
      outline: none; /* 移除轮廓 */
      width: 16px; /* 设置单选框大小 */
      height: 16px; /* 设置单选框大小 */
      border: 2px solid #ccc; /* 边框样式 */
      border-radius: 50%; /* 圆形单选框 */
      background-color: #fff; /* 背景颜色 */
      cursor: pointer; /* 鼠标指针为手型 */
    }

    /* 当单选框被选中时的样式 */
    .theme-radio-input:checked {
      border-color: #2aba8a; /* 边框颜色变为选中色 */
      background-color: #2aba8a; /* 背景颜色变为选中色 */
    }

    /* 自定义单选框的伪元素，用于勾选标记，可选 */
    .theme-radio-input:checked::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 12px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* 选中状态的样式 */
    input:checked ~ &::after {
      background-color: #2aba8a;
      border-color: #2aba8a;
    }

    /* 主题标题样式 */
    .theme-title {
      color: #202124;
      font-size: 14px;
      margin-top: 4px;
      font-weight: 400;
    }
  }
}

</style>