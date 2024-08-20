import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import { yjsDeleteElement } from '@/utils/yjs-init'

export default () => {
  const mainStore = useMainStore()
  const slidesStore = useSlidesStore()
  const { activeElementIdList, activeGroupElementId } = storeToRefs(mainStore)
  const { currentSlide } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

  // 删除全部选中元素
  // 组合元素成员中，存在被选中可独立操作的元素时，优先删除该元素。否则默认删除所有被选中的元素
  const deleteElement = () => {
    if (!activeElementIdList.value.length) return
    const slide = currentSlide.value
    const elements = slide && undefined !== slide ? slide.elements : []

    let newElementList: PPTElement[] = []
    if (activeGroupElementId.value) {
      newElementList = elements.filter(el => el.id !== activeGroupElementId.value)
    }
    else {
      newElementList = elements.filter(el => !activeElementIdList.value.includes(el.id))
    }
    if (slide) {
      const deleteElementIds:string[] = []
      for (let i = 0; i < elements.length; i++) {
        let has = false
        for (let j = 0; j < newElementList.length; j++) {
          if (elements[i].id === newElementList[j].id) {
            has = true
            break
          }
        }
        if (!has) {
          deleteElementIds.push(elements[i].id)
        }
        if (deleteElementIds.length) {
          yjsDeleteElement(slide.id, deleteElementIds)
        }
      }
    }

    mainStore.setActiveElementIdList([])
    slidesStore.updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  // 删除内面内全部元素(无论是否选中)
  const deleteAllElements = () => {
    const slide = currentSlide.value
    const elements = slide && undefined !== slide ? slide.elements : []
    if (!elements.length) return
    mainStore.setActiveElementIdList([])
    slidesStore.updateSlide({ elements: [] })
    addHistorySnapshot()
  }

  return {
    deleteElement,
    deleteAllElements,
  }
}