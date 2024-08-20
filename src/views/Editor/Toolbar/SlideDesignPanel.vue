<template>
  <div class="slide-design-panel">
    <div class="title">{{ $t('edit.background') }}</div>
    <div class="row">
      <Select 
        style="flex: 1;" 
        :value="background.type" 
        @update:value="value => updateBackgroundType(value as 'gradient' | 'image' | 'solid')"
        :options="[
          { label: $t('edit.solid'), value: 'solid' },
          { label: $t('edit.image'), value: 'image' },
          { label: $t('edit.gradient'), value: 'gradient' },
        ]"
      />
      <div style="width: 10px;"></div>

      <Popover trigger="click" v-if="background.type === 'solid'" style="flex: 1;">
        <template #content>
          <ColorPicker
            :modelValue="background.color"
            @update:modelValue="color => updateBackground({ color })"
          />
        </template>
        <ColorButton :color="background.color || '#fff'" />
      </Popover>

      <Select 
        style="flex: 1;" 
        :value="background.imageSize || 'cover'" 
        @update:value="value => updateBackground({ imageSize: value as 'repeat' | 'cover' | 'contain' })"
        v-else-if="background.type === 'image'"
        :options="[
          { label: $t('edit.contain'), value: 'contain' },
          { label: $t('edit.repeat'), value: 'repeat' },
          { label: $t('edit.cover'), value: 'cover' },
        ]"
      />

      <Select 
        style="flex: 1;" 
        :value="background.gradientType || ''" 
        @update:value="value => updateBackground({ gradientType: value as 'linear' | 'radial' })"
        v-else
        :options="[
          { label: $t('edit.linear'), value: 'linear' },
          { label: $t('edit.radial'), value: 'radial' },
        ]"
      />
    </div>

    <div class="background-image-wrapper" v-if="background.type === 'image'">
      <FileInput @change="files => uploadBackgroundImage(files)">
        <div class="background-image">
          <div class="content" :style="{ backgroundImage: `url(${background.image})` }">
            <IconPlus />
          </div>
        </div>
      </FileInput>
    </div>

    <div class="background-gradient-wrapper" v-if="background.type === 'gradient'">
      <div class="row">
        <div style="width: 40%;">{{ $t('edit.startColor') }}：</div>
        <Popover trigger="click" style="width: 60%;">
          <template #content>
            <ColorPicker
              :modelValue="background.gradientColor![0]"
              @update:modelValue="value => updateBackground({ gradientColor: [value, background.gradientColor![1]] })"
            />
          </template>
          <ColorButton :color="background.gradientColor![0]" />
        </Popover>
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('edit.endColor') }}：</div>
        <Popover trigger="click" style="width: 60%;">
          <template #content>
            <ColorPicker
              :modelValue="background.gradientColor![1]"
              @update:modelValue="value => updateBackground({ gradientColor: [background.gradientColor![0], value] })"
            />
          </template>
          <ColorButton :color="background.gradientColor![1]" />
        </Popover>
      </div>
      <div class="row" v-if="background.gradientType === 'linear'">
        <div style="width: 40%;">{{ $t('edit.gradientAngle') }}：</div>
        <Slider
          :min="0"
          :max="360"
          :step="15"
          :value="background.gradientRotate || 0"
          @update:value="value => updateBackground({ gradientRotate: value as number })" 
          style="width: 60%;"
        />
      </div>
    </div>

    <div class="row">
      <Button style="flex: 1;" @click="applyBackgroundAllSlide()">{{ $t('edit.applyAll') }}</Button>
    </div>

    <Divider />

    <div class="row">
      <div style="width: 40%;">{{ $t('edit.slideSize') }}：</div>
      <Select 
        style="width: 60%;" 
        :value="viewportRatio" 
        @update:value="value => updateViewportRatio(value as number)"
        :options="[
          { label: $t('edit.widescreen9'), value: 0.5625 },
          { label: $t('edit.widescreen10'), value: 0.625 },
          { label: $t('edit.standard3'), value: 0.75 },
          { label: $t('edit.paperA3'), value: 0.70710678 },
          { label: $t('edit.verticalA3'), value: 1.41421356 },
        ]"
      />
    </div>

    <Divider />

    <div class="title">
      <span>{{ $t('edit.globalTheme') }}</span>
      <span class="more" @click="moreThemeConfigsVisible = !moreThemeConfigsVisible">
        <span class="text">{{ $t('edit.more') }}</span>
        <IconDown v-if="moreThemeConfigsVisible" />
        <IconRight v-else />
      </span>
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('edit.font') }}：</div>
      <Select
        style="width: 60%;"
        :value="theme.fontName"
        @update:value="value => updateTheme({ fontName: value as string })"
        :options="[
          ...availableFonts,
          ...WEB_FONTS
        ]"
      />
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('edit.fontColor') }}：</div>
      <Popover trigger="click" style="width: 60%;">
        <template #content>
          <ColorPicker
            :modelValue="theme.fontColor"
            @update:modelValue="value => updateTheme({ fontColor: value })"
          />
        </template>
        <ColorButton :color="theme.fontColor" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('edit.backColor') }}：</div>
      <Popover trigger="click" style="width: 60%;">
        <template #content>
          <ColorPicker
            :modelValue="theme.backgroundColor"
            @update:modelValue="value => updateTheme({ backgroundColor: value })"
          />
        </template>
        <ColorButton :color="theme.backgroundColor" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%;">{{ $t('edit.themeColor') }}：</div>
      <Popover trigger="click" style="width: 60%;">
        <template #content>
          <ColorPicker
            :modelValue="theme.themeColor"
            @update:modelValue="value => updateTheme({ themeColor: value })"
          />
        </template>
        <ColorButton :color="theme.themeColor" />
      </Popover>
    </div>
    
    <template v-if="moreThemeConfigsVisible">
      <div class="row">
        <div style="width: 40%;">{{ $t('edit.borderStyle') }}：</div>
        <Select 
          style="width: 60%;" 
          :value="theme.outline.style || ''" 
          @update:value="value => updateTheme({ outline: { ...theme.outline, style: value as 'dashed' | 'solid' } })"
          :options="[
            { label: $t('edit.borderSolid'), value: 'solid' },
            { label: $t('edit.borderDashed'), value: 'dashed' },
          ]"
        />
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('edit.borderColor') }}：</div>
        <Popover trigger="click" style="width: 60%;">
          <template #content>
            <ColorPicker
              :modelValue="theme.outline.color"
              @update:modelValue="value => updateTheme({ outline: { ...theme.outline, color: value } })"
            />
          </template>
          <ColorButton :color="theme.outline.color || '#000'" />
        </Popover>
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('edit.borderWidth') }}：</div>
        <NumberInput 
          :value="theme.outline.width || 0" 
          @update:value="value => updateTheme({ outline: { ...theme.outline, width: value } })" 
          style="width: 60%;" 
        />
      </div>
      <div class="row" style="height: 30px;">
        <div style="width: 40%;">{{ $t('edit.horizontalShadow') }}：</div>
        <Slider 
          style="width: 60%;"
          :min="-10" 
          :max="10" 
          :step="1" 
          :value="theme.shadow.h" 
          @update:value="value => updateTheme({ shadow: { ...theme.shadow, h: value as number } })"
        />
      </div>
      <div class="row" style="height: 30px;">
        <div style="width: 40%;">{{ $t('edit.verticalShadow') }}：</div>
        <Slider
          style="width: 60%;"
          :min="-10"
          :max="10"
          :step="1"
          :value="theme.shadow.v"
          @update:value="value => updateTheme({ shadow: { ...theme.shadow, v: value as number } })"
        />
      </div>
      <div class="row" style="height: 30px;">
        <div style="width: 40%;">{{ $t('edit.fuzzyDistance') }}：</div>
        <Slider
          style="width: 60%;"
          :min="1"
          :max="20"
          :step="1"
          :value="theme.shadow.blur"
          @update:value="value => updateTheme({ shadow: { ...theme.shadow, blur: value as number } })"
        />
      </div>
      <div class="row">
        <div style="width: 40%;">{{ $t('edit.shadowColor') }}：</div>
        <Popover trigger="click" style="width: 60%;">
          <template #content>
            <ColorPicker
              :modelValue="theme.shadow.color"
              @update:modelValue="value => updateTheme({ shadow: { ...theme.shadow, color: value } })"
            />
          </template>
          <ColorButton :color="theme.shadow.color" />
        </Popover>
      </div>
    </template>

    <div class="row">
      <Button style="flex: 1;" @click="applyThemeToAllSlides(moreThemeConfigsVisible)">{{ $t('edit.applyAll') }}</Button>
    </div>

    <Divider />

    <div class="title">{{ $t('edit.premadeThemes') }}</div>
    <div class="theme-list">
      <div 
        class="theme-item" 
        v-for="(item, index) in PRESET_THEMES" 
        :key="index"
        :style="{
          backgroundColor: item.background,
          fontFamily: item.fontname,
        }"
      >
        <div class="theme-item-content">
          <div class="text" :style="{ color: item.fontColor }">Aa</div>
          <div class="colors">
            <div class="color-block" v-for="(color, index) in item.colors" :key="index" :style="{ backgroundColor: color}"></div>
          </div>

          <div class="btns">
            <div class="btn" @click="applyPresetThemeToSingleSlide(item)">{{ $t('edit.apply') }}</div>
            <div class="btn" @click="applyPresetThemeToAllSlides(item)">{{ $t('edit.applyAll') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { SlideBackground, SlideTheme } from '@/types/slides'
import { PRESET_THEMES } from '@/configs/theme'
import { WEB_FONTS } from '@/configs/font'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useSlideTheme from '@/hooks/useSlideTheme'
import { getImageDataURL } from '@/utils/image'

import ColorButton from './common/ColorButton.vue'
import FileInput from '@/components/FileInput.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Divider from '@/components/Divider.vue'
import Slider from '@/components/Slider.vue'
import Button from '@/components/Button.vue'
import Select from '@/components/Select.vue'
import Popover from '@/components/Popover.vue'
import NumberInput from '@/components/NumberInput.vue'

import i18n from '@/assets/locales/index'
import { yjsSetSlideAttributes, yjsSetSlidesBackground } from '@/utils/yjs-init'
const { global: { t: $t } } = i18n

const slidesStore = useSlidesStore()
const { availableFonts } = storeToRefs(useMainStore())
const { slides, currentSlide, viewportRatio, theme } = storeToRefs(slidesStore)

const moreThemeConfigsVisible = ref(false)

const background = computed(() => {
  const slide = currentSlide
  const slideValue = slide ? currentSlide.value : undefined
  console.log('slideValue :%o', slideValue)
  if (!slideValue || undefined === slideValue || !slideValue.background) {
    return {
      type: 'solid',
      value: '#fff',
    } as SlideBackground
  }
  return slideValue.background
})

const { addHistorySnapshot } = useHistorySnapshot()
const {
  applyPresetThemeToSingleSlide,
  applyPresetThemeToAllSlides,
  applyThemeToAllSlides,
} = useSlideTheme()

// 设置背景模式：纯色、图片、渐变色
const updateBackgroundType = (type: 'solid' | 'image' | 'gradient') => {
  if (type === 'solid') {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'solid',
      color: background.value.color || '#fff',
    }
    slidesStore.updateSlide({ background: newBackground })
    yjsSetSlideAttributes({ background: newBackground })
  }
  else if (type === 'image') {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'image',
      image: background.value.image || '',
      imageSize: background.value.imageSize || 'cover',
    }
    slidesStore.updateSlide({ background: newBackground })
    yjsSetSlideAttributes({ background: newBackground })
  }
  else {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'gradient',
      gradientType: background.value.gradientType || 'linear',
      gradientColor: background.value.gradientColor || ['#fff', '#fff'],
      gradientRotate: background.value.gradientRotate || 0,
    }
    slidesStore.updateSlide({ background: newBackground })
    yjsSetSlideAttributes({ background: newBackground })
  }
  addHistorySnapshot()
}

// 设置背景图片
const updateBackground = (props: Partial<SlideBackground>) => {
  slidesStore.updateSlide({ background: { ...background.value, ...props } })
  addHistorySnapshot()
  slidesStore.updateSlide({ background: { ...background.value, ...props } })
  yjsSetSlideAttributes({ background: { ...background.value, ...props } }
  )
}

// 上传背景图片
const uploadBackgroundImage = (files: FileList) => {
  const imageFile = files[0]
  if (!imageFile) return
  getImageDataURL(imageFile).then(dataURL => updateBackground({ image: dataURL }))
}

// 应用当前页背景到全部页面
const applyBackgroundAllSlide = () => {
  const newSlides = slides.value.map(slide => {
    return {
      ...slide,
      background: currentSlide.value.background,
    }
  })
  slidesStore.setSlides(newSlides)
  addHistorySnapshot()
  yjsSetSlidesBackground(currentSlide.value.background)
}

// 设置主题
const updateTheme = (themeProps: Partial<SlideTheme>) => {
  slidesStore.setTheme(themeProps)
}

// 设置画布尺寸（宽高比例）
const updateViewportRatio = (value: number) => {
  slidesStore.setViewportRatio(value)
}
</script>

<style lang="scss" scoped>
.slide-design-panel {
  user-select: none;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .more {
    cursor: pointer;

    .text {
      font-size: 12px;
      margin-right: 3px;
    }
  }
}
.background-image-wrapper {
  margin-bottom: 10px;
}
.background-image {
  height: 0;
  padding-bottom: 56.25%;
  border: 1px dashed $borderColor;
  border-radius: $borderRadius;
  position: relative;
  transition: all $transitionDelay;

  &:hover {
    border-color: $themeColor;
    color: $themeColor;
  }

  .content {
    @include absolute-0();

    display: flex;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
  }
}

.theme-list {
  @include flex-grid-layout();
}
.theme-item {
  @include flex-grid-layout-children(2, 48%);

  padding-bottom: 30%;
  border-radius: $borderRadius;
  position: relative;
  cursor: pointer;

  .theme-item-content {
    @include absolute-0();

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px;
    border: 1px solid $borderColor;
    border-radius: $borderRadius;
  }

  .text {
    font-size: 16px;
  }
  .colors {
    display: flex;
  }
  .color-block {
    margin-top: 8px;
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }

  &:hover .btns {
    opacity: 1;
  }

  .btns {
    @include absolute-0();

    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: flex;
    background-color: rgba($color: #000, $alpha: .25);
    opacity: 0;
    transition: opacity $transitionDelay;
  }
  .btn {
    width: 72px;
    padding: 5px 0;
    text-align: center;
    background-color: $themeColor;
    color: #fff;
    font-size: 12px;
    border-radius: $borderRadius;

    &:hover {
      background-color: $themeHoverColor;
    }

    & + .btn {
      margin-top: 5px;
    }
  }
}
</style>