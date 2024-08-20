import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { useMainStore, useSlidesStore } from '@/store'
import type {PPTElement, PPTLineElement, PPTShapeElement, PPTTextElement, Slide } from '@/types/slides'
import { copyText, readClipboard } from '@/utils/clipboard'
import { encrypt } from '@/utils/crypto'
import { createElementIdMap } from '@/utils/element'
import { KEYS } from '@/configs/hotkey'
import message from '@/utils/message'
import usePasteTextClipboardData from '@/hooks/usePasteTextClipboardData'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useAddSlidesOrElements from '@/hooks//useAddSlidesOrElements'
import { createEmptySlide } from '@/mocks/slides'
import { yjsAddSlide, yjsDeleteSlides, yjsRegistUseSlideHandler, yjsSortSlide } from '@/utils/yjs-init'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { selectedSlidesIndex: _selectedSlidesIndex, activeElementIdList } = storeToRefs(mainStore)
  const { currentSlide, slides, theme, slideIndex } = storeToRefs(slidesStore)

  const selectedSlidesIndex = computed(() => [..._selectedSlidesIndex.value, slideIndex.value])
  const selectedSlides = computed(() => slides.value.filter((item, index) => selectedSlidesIndex.value.includes(index)))
  const selectedSlidesId = computed(() => selectedSlides.value.map(item => item.id))

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { addSlidesFromData } = useAddSlidesOrElements()
  const { addHistorySnapshot } = useHistorySnapshot()

  // 重置幻灯片
  const resetSlides = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.value.backgroundColor,
      },
    }
    slidesStore.updateSlideIndex(0)
    mainStore.setActiveElementIdList([])
    slidesStore.setSlides([emptySlide])
  }

  /**
   * 移动页面焦点
   * @param command 移动页面焦点命令：上移、下移
   */
  const updateSlideIndex = (command: string) => {
    if (command === KEYS.UP && slideIndex.value > 0) {
      if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])
      slidesStore.updateSlideIndex(slideIndex.value - 1)
    }
    else if (command === KEYS.DOWN && slideIndex.value < slides.value.length - 1) {
      if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])
      slidesStore.updateSlideIndex(slideIndex.value + 1)
    }
  }

  // 将当前页面数据加密后复制到剪贴板
  const copySlide = () => {
    const text = encrypt(JSON.stringify({
      type: 'slides',
      data: selectedSlides.value,
    }))

    copyText(text).then(() => {
      mainStore.setThumbnailsFocus(true)
    })
  }

  // 尝试将剪贴板页面数据解密后添加到下一页（粘贴）
  const pasteSlide = () => {
    readClipboard().then(text => {
      pasteTextClipboardData(text, { onlySlide: true })
    }).catch(err => message.warning(err))
  }

  // 创建一页空白页并添加到下一页
  const createSlide = () => {
    const emptySlide = createEmptySlide()
    mainStore.setActiveElementIdList([])
    slidesStore.addSlide(emptySlide)
    addHistorySnapshot()
  }

  // 把当前 ppt 保存到模板中
  // function saveAllSideAsConfig() {
  //   const replaceCopy = function(obj:any):any {
  //     const t = typeof obj
  //     let info:any
  //     let keys
  //     let arr:any[]
  //     switch (t) {
  //       case 'string':
  //         // return (obj as string).replaceAll('\'', '\\\'')
  //         return obj
  //       case 'object':
  //         if (obj instanceof Array) {
  //           arr = []
  //           obj.forEach(v => {
  //             arr.push(replaceCopy(v))
  //           })
  //           return arr
  //         }
  //         info = {}
  //         keys = Object.keys(obj)
  //         keys.forEach((k: string, index: number, array: string[]) => {
  //           // TODO: Add your code here
  //           let v:any = obj[k]
  //           if (k === 'pathFormula') {
  //             return
  //           }
  //           if (k === 'path') {
  //             if (v.indexOf('NaN') !== -1) {
  //               v = v.replaceAll('NaN', '0')
  //             }
  //           }
  //           info[k] = replaceCopy(v)
  //         })
  //         return info
  //       default:
  //         return obj
  //     }
  //   }
  //   // const json:any[] = []
  //   // slidesStore.allSlides.forEach(v => {
  //   //   json.push(v)
  //   // })
  //   // const json = slidesStore.allSlides.slice(Math.ceil(slidesStore.allSlides.length / 2) + 7, Math.ceil(slidesStore.allSlides.length / 2) + 7 + 2)
  //   // const json = slidesStore.allSlides
  //   const json = replaceCopy(slidesStore.allSlides)
  //   const content = JSON.stringify(json, null, 2)
  //   // content = content.replaceAll('\'', '\\\'')
  //   // content = content.replaceAll('"', '\'')
  //   const filename = 'layout.json'
  //   const blob = new Blob([content], { type: 'text/plain' })

  //   // 创建一个虚拟的a标签
  //   const link = document.createElement('a')
  //   link.href = URL.createObjectURL(blob)
  //   link.download = filename

  //   // 模拟点击下载
  //   link.click()

  //   // 释放URL对象
  //   URL.revokeObjectURL(link.href)
  // }
  
  const readyToCreateTemplate = (slide: Slide, index = -1) => {
    console.log('readyToCreateTemplate')
    index = index === -1 ? slidesStore.slideIndex : index
    yjsAddSlide(slide, index)
  }

  // 根据模板创建新页面
  const createSlideByTemplate = (slide: Slide, index = -1, fixId = 'template') => {
    // 保存所以页面到模板中
    // saveAllSideAsConfig()
    // console.log('allSlides:', slidesStore.allSlides[0])
    const { groupIdMap, elIdMap } = createElementIdMap(slide.elements)
    console.log('createSlideByTemplate groupIdMap: %o, elIdMap:%o', groupIdMap, elIdMap)
    if (fixId === 'template') {
      for (const element of slide.elements) {
        element.id = elIdMap[element.id]
        if (element.groupId) element.groupId = groupIdMap[element.groupId]
      }
    }
    const newSlide = {
      ...slide,
      id: fixId === 'template' ? nanoid(10) : fixId,
    }
    mainStore.setActiveElementIdList([])
    slidesStore.addSlide(newSlide, index)
    addHistorySnapshot()
  }

  // 将当前页复制一份到下一页
  const copyAndPasteSlide = () => {
    const slide = JSON.parse(JSON.stringify(currentSlide.value))
    addSlidesFromData([slide])
  }

  // 删除当前页，若将删除全部页面，则执行重置幻灯片操作
  const readyToDeleteSlide = (targetSlidesId = selectedSlidesId.value) => {
    console.log('ready to delete file:', targetSlidesId)
    yjsDeleteSlides(targetSlidesId)
  }

  // 删除当前页，若将删除全部页面，则执行重置幻灯片操作
  const deleteSlide = (targetSlidesId = selectedSlidesId.value) => {
    if (slides.value.length === targetSlidesId.length) resetSlides()
    else slidesStore.deleteSlide(targetSlidesId)

    mainStore.updateSelectedSlidesIndex([])

    addHistorySnapshot()
  }

  // 将当前页复制后删除（剪切）
  // 由于复制操作会导致多选状态消失，所以需要提前将需要删除的页面ID进行缓存
  const cutSlide = () => {
    const targetSlidesId = [...selectedSlidesId.value]
    copySlide()
    deleteSlide(targetSlidesId)
  }

  // 选中全部幻灯片
  const selectAllSlide = () => {
    const newSelectedSlidesIndex = Array.from(Array(slides.value.length), (item, index) => index)
    mainStore.setActiveElementIdList([])
    mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
  }

  // 拖拽调整幻灯片顺序同步数据
  const sortSlides = (newIndex: number, oldIndex: number) => {
    if (oldIndex === newIndex) return
    const _slides = JSON.parse(JSON.stringify(slides.value))
    const _slide = _slides[oldIndex]
    _slides.splice(oldIndex, 1)
    _slides.splice(newIndex, 0, _slide)
    slidesStore.setSlides(_slides)
    slidesStore.updateSlideIndex(newIndex)
    yjsSortSlide(oldIndex, newIndex)
  }

  const rlist = {
    resetSlides,
    updateSlideIndex,
    copySlide,
    pasteSlide,
    createSlide,
    createSlideByTemplate,
    readyToCreateTemplate,
    copyAndPasteSlide,
    readyToDeleteSlide,
    deleteSlide,
    cutSlide,
    selectAllSlide,
    sortSlides,
  }
  yjsRegistUseSlideHandler(rlist)
  return rlist 
}