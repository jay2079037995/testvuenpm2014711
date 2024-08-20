import { defineStore } from 'pinia'
import tinycolor from 'tinycolor2'
import { omit } from 'lodash'
import type { Slide, SlideTheme, PPTElement, PPTAnimation, SlideEditor } from '@/types/slides'
import { slides } from '@/mocks/slides'
import { theme } from '@/mocks/theme'
import { layouts } from '@/mocks/layout'
import { layoutNews } from '@/mocks/layoutNew'
import customLayout from '@/assets/layout.json'
import { layoutTemplates } from '@/mocks/layoutTemplate'
// 国际化
import i18n from '@/assets/locales/index'
import { yjsAddElement, yjsDeleteElement, needYJS, yjsUpdateSlide, yjsUuid } from '@/utils/yjs-init'

export interface SlideTypeItem {
  type: string
  children: Slide[]
}

interface RemoveElementPropData {
  id: string
  propName: string | string[]
}

interface UpdateElementData {
  id: string | string[]
  props: Partial<PPTElement>
  slideId?: string
}

interface FormatedAnimation {
  animations: PPTAnimation[]
  autoNext: boolean
}

export interface SlidesState {
  title: string
  theme: SlideTheme
  slides: Slide[]
  slideIndex: number
  viewportRatio: number
  pageSrollPercent: number
  pageScrollTop: number
  mainScrollTop: number
  slideSizeWidth: number
}

export const useSlidesStore = defineStore('slides', {
  state: (): SlidesState => ({
    title: i18n.global.t('unnamedPresentation'), // 幻灯片标题
    theme: theme, // 主题样式
    slides: slides, // 幻灯片页面数据
    slideIndex: 0, // 当前页面索引
    viewportRatio: 0.5625, // 可视区域比例，默认16:9
    pageSrollPercent: 1,
    pageScrollTop: 0,
    mainScrollTop: 0,
    slideSizeWidth: 0,
  }),

  getters: {
    currentSlide(state) {
      const length = state.slides.length
      if (length > 0) {
        if (state.slideIndex < length) {
          return state.slides[state.slideIndex]
        }
        return state.slides[0]
      }
      return undefined
    },

    allSlide(state) {
      return state.slides
    },
  
    currentSlideAnimations(state) {
      const currentSlide = state.slides[state.slideIndex]
      if (!currentSlide?.animations) return []

      const els = currentSlide.elements
      const elIds = els.map(el => el.id)
      return currentSlide.animations.filter(animation => elIds.includes(animation.elId))
    },

    // 格式化的当前页动画
    // 将触发条件为“与上一动画同时”的项目向上合并到序列中的同一位置
    // 为触发条件为“上一动画之后”项目的上一项添加自动向下执行标记
    formatedAnimations(state) {
      const currentSlide = state.slides[state.slideIndex]
      if (!currentSlide?.animations) return []

      const els = currentSlide.elements
      const elIds = els.map(el => el.id)
      const animations = currentSlide.animations.filter(animation => elIds.includes(animation.elId))

      const formatedAnimations: FormatedAnimation[] = []
      for (const animation of animations) {
        if (animation.trigger === 'click' || !formatedAnimations.length) {
          formatedAnimations.push({ animations: [animation], autoNext: false })
        }
        else if (animation.trigger === 'meantime') {
          const last = formatedAnimations[formatedAnimations.length - 1]
          last.animations = last.animations.filter(item => item.elId !== animation.elId)
          last.animations.push(animation)
          formatedAnimations[formatedAnimations.length - 1] = last
        }
        else if (animation.trigger === 'auto') {
          const last = formatedAnimations[formatedAnimations.length - 1]
          last.autoNext = true
          formatedAnimations[formatedAnimations.length - 1] = last
          formatedAnimations.push({ animations: [animation], autoNext: false })
        }
      }
      return formatedAnimations
    },
  
    layoutTemplates(state) {
      const {
        themeColor,
        fontColor,
        fontName,
        backgroundColor,
      } = state.theme
  
      const subColor = tinycolor(fontColor).isDark() ? 'rgba(230, 230, 230, 0.9)' : 'rgba(180, 180, 180, 0.9)'
      // const layoutsString = JSON.stringify(layoutNews.concat(layouts))
      const layoutsString = JSON.stringify(layoutTemplates)
        .replaceAll('{{themeColor}}', themeColor)
        .replaceAll('{{fontColor}}', fontColor)
        .replaceAll('{{fontName}}', fontName)
        .replaceAll('{{backgroundColor}}', backgroundColor)
        .replaceAll('{{subColor}}', subColor)
      
      return JSON.parse(layoutsString)
    },

    cardLayouts(state) {
      const {
        themeColor,
        fontColor,
        fontName,
        backgroundColor,
      } = state.theme
  
      const subColor = tinycolor(fontColor).isDark() ? 'rgba(230, 230, 230, 0.9)' : 'rgba(180, 180, 180, 0.9)'
      const cardLayout: SlideTypeItem[] = []
      const cardGroup1: SlideTypeItem = {
        type: 'Cover',
        children: layouts
      }
      cardLayout.push(cardGroup1)
      const cardGroup2: SlideTypeItem = {
        type: 'Outline',
        children: layoutNews
      }
      cardLayout.push(cardGroup2)
      const cardGroup3: SlideTypeItem = {
        type: 'Chapter',
        children: customLayout as Slide[]
      }
      cardLayout.push(cardGroup3)
      // const layoutsString = JSON.stringify(layoutNews.concat(layouts))
      const layoutsString = JSON.stringify(cardLayout)
        .replaceAll('{{themeColor}}', themeColor)
        .replaceAll('{{fontColor}}', fontColor)
        .replaceAll('{{fontName}}', fontName)
        .replaceAll('{{backgroundColor}}', backgroundColor)
        .replaceAll('{{subColor}}', subColor)
      
      return JSON.parse(layoutsString)
    },

    layouts(state) {
      const {
        themeColor,
        fontColor,
        fontName,
        backgroundColor,
      } = state.theme
  
      const subColor = tinycolor(fontColor).isDark() ? 'rgba(230, 230, 230, 0.9)' : 'rgba(180, 180, 180, 0.9)'
      const layoutsString = JSON.stringify(layoutNews.concat(layouts))
        .replaceAll('{{themeColor}}', themeColor)
        .replaceAll('{{fontColor}}', fontColor)
        .replaceAll('{{fontName}}', fontName)
        .replaceAll('{{backgroundColor}}', backgroundColor)
        .replaceAll('{{subColor}}', subColor)
      return JSON.parse(layoutsString)
    },
  },

  actions: {
    setTitle(title: string) {
      if (!title) this.title = i18n.global.t('unnamedPresentation')
      else this.title = title
    },

    setTheme(themeProps: Partial<SlideTheme>) {
      this.theme = { ...this.theme, ...themeProps }
    },
  
    setViewportRatio(viewportRatio: number) {
      this.viewportRatio = viewportRatio
    },

    setSlideSizeWidth(sizeWidth: number) {
      this.slideSizeWidth = sizeWidth
    },
  
    setSlides(slides: Slide[]) {
      this.slides = slides
    },
  
    addSlide(slide: Slide | Slide[], index = -1) {
      const slides = Array.isArray(slide) ? slide : [slide]
      const addIndex = index === -1 ? this.slideIndex + 1 : index
      this.slides.splice(addIndex, 0, ...slides)
      if (!needYJS || (slide as any).auth === yjsUuid) {
        this.slideIndex = addIndex
      }
    },

    getSlide(slideId?:string):Slide | null {
      for (let i = 0; i < this.slides.length; i++) {
        if (this.slides[i].id === slideId) {
          return this.slides[i]
        }
      }
      return null
    },

    getSlideIndexById(slideId?:string):number {
      for (let i = 0; i < this.slides.length; i++) {
        if (this.slides[i].id === slideId) {
          return i
        }
      }
      return -1
    },
  
    updateSlide(props: Partial<Slide>) {
      const slideIndex = this.slideIndex
      this.slides[slideIndex] = { ...this.slides[slideIndex], ...props }
      if (needYJS) {
        yjsUpdateSlide(this.slides[slideIndex].id)
      }
    },
  
    deleteSlide(slideId: string | string[]) {
      const slectedSlideId = this.slides[this.slideIndex].id
      let newSelectedSlideId = slectedSlideId
      if (Array.isArray(slideId) && slideId.indexOf(slectedSlideId) !== -1 || slideId === slectedSlideId) {
        newSelectedSlideId = ''
        for (let i = 0; i < this.slides.length; i++) {
          if (this.slides[i].id === slectedSlideId) {
            let hasFind = false
            for (let j = i + 1; j < this.slides.length; j++) {
              if (!(Array.isArray(slideId) && slideId.indexOf(this.slides[j].id) !== -1 || slideId === this.slides[j].id)) {
                hasFind = true
                newSelectedSlideId = this.slides[j].id
                break
              }
            }
            if (!hasFind) {
              for (let j = i - 1; j >= 0; j--) {
                if (!(Array.isArray(slideId) && slideId.indexOf(this.slides[j].id) !== -1 || slideId === this.slides[j].id)) {
                  hasFind = true
                  newSelectedSlideId = this.slides[j].id
                  break
                }
              }
            }
            break
          }
        }
      }

      const slidesId = Array.isArray(slideId) ? slideId : [slideId]
  
      const deleteSlidesIndex = []
      for (let i = 0; i < slidesId.length; i++) {
        const index = this.slides.findIndex(item => {
          return item.id === slidesId[i]
        })
        deleteSlidesIndex.push(index)
      }
      let newIndex = Math.min(...deleteSlidesIndex)
  
      const maxIndex = this.slides.length - slidesId.length - 1
      if (newIndex > maxIndex) newIndex = maxIndex
  
      if (needYJS) {
        this.slides = this.slides.filter(item => !slidesId.includes(item.id))
        newIndex = 0
        for (let i = 0; i < this.slides.length; i++) {
          if (this.slides[i].id === newSelectedSlideId) {
            newIndex = i
            break
          }
        }
        this.slideIndex = newIndex
      } 
      else {
        this.slideIndex = newIndex
        this.slides = this.slides.filter(item => !slidesId.includes(item.id))
      }
    },

    clearAllSlide() {
      this.slideIndex = 0
      // this.slides = []
      this.slides.splice(0, this.slides.length)
    },
  
    updateSlideIndex(index: number) {
      this.slideIndex = index
    },

    hasElement(slideId?:string, elementId?:string) {
      const slide = this.getSlide(slideId)
      if (slide) {
        for (let i = 0; i < slide.elements.length; i++) {
          if (slide.elements[i].id === elementId) {
            return true
          }
        }
      }
      return false
    },
  
    addElement(element: PPTElement | PPTElement[], slideId?:string) {
      const elements = Array.isArray(element) ? element : [element]
      const currentSlides = this.getSlide(slideId) || this.slides[this.slideIndex]
      if (currentSlides) {
        if (element instanceof Array) {
          for (let i = 0; i < element.length; i++) {
            if (this.hasElement(currentSlides.id, element[i].id)) {
              element.splice(i, 1)
              i--
            }
          }
          if (!element.length) {
            return
          }
        }
        else {
          if (this.hasElement(currentSlides.id, element.id)) {
            return
          }
        }
        const currentSlideEls = currentSlides.elements
        const newEls = [...currentSlideEls, ...elements]
        currentSlides.elements = newEls
        yjsAddElement(currentSlides.id, element)
      }
    },

    deleteElement(elementId: string | string[], slideId?: string) {
      const elementIdList = Array.isArray(elementId) ? elementId : [elementId]
      const currentSlides = this.getSlide(slideId) || this.slides[this.slideIndex]
      if (currentSlides) {
        const currentSlideEls = currentSlides.elements
        if (elementId instanceof Array) {
          for (let i = 0; i < elementId.length; i++) {
            if (!this.hasElement(currentSlides.id, elementId[i])) {
              elementId.splice(i, 1)
              i--
            }
          }
          if (!elementId.length) {
            return
          }
        }
        else {
          if (!this.hasElement(currentSlides.id, elementId)) {
            return
          }
        }
        const newEls = currentSlideEls.filter(item => !elementIdList.includes(item.id))
        currentSlides.elements = newEls
        yjsDeleteElement(currentSlides.id, elementId)
      }
    },
  
    updateElement(data: UpdateElementData) {
      const { id, props, slideId } = data
      const elIdList = typeof id === 'string' ? [id] : id

      const slideIndex = slideId ? this.slides.findIndex(item => item.id === slideId) : this.slideIndex
      const slide = this.slides[slideIndex]
      if (slide) {
        const elements = slide.elements.map(el => {
          return elIdList.includes(el.id) ? { ...el, ...props } : el
        })
        this.slides[slideIndex].elements = (elements as PPTElement[])
      }
    },
  
    removeElementProps(data: RemoveElementPropData) {
      const { id, propName } = data
      const propsNames = typeof propName === 'string' ? [propName] : propName
  
      const slideIndex = this.slideIndex
      const slide = this.slides[slideIndex]
      const elements = slide.elements.map(el => {
        return el.id === id ? omit(el, propsNames) : el
      })
      this.slides[slideIndex].elements = (elements as PPTElement[])
    },

    sendUpdateData() {
      console.log('update data')
    },
  },
})