import type { Ref, ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { CreateElementSelectionData } from '@/types/edit'
import useCreateElement from '@/hooks/useCreateElement'

export default (viewportRef: Ref<HTMLElement | undefined>,
  viewportStyles: ComputedRef<{
    width: number,
    height: number,
    left: number,
    top:number
  }>) => {
  const mainStore = useMainStore()
  const { canvasScale, creatingElement } = storeToRefs(mainStore)
  const slidesStore = useSlidesStore()
  const { slideIndex } = storeToRefs(slidesStore)

  // 通过鼠标框选时的起点和终点，计算选区的位置大小
  const formatCreateSelection = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData

    if (!viewportRef.value) return
    const viewportRect = viewportRef.value.getBoundingClientRect()

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const left = (minX - viewportRect.x) / canvasScale.value
    const top = (minY - viewportRect.y) / canvasScale.value
    const width = (maxX - minX) / canvasScale.value
    const height = (maxY - minY) / canvasScale.value

    return { left, top, width, height }
  }

  // 通过鼠标框选时的起点和终点，计算线条在画布中的位置和起点终点
  const formatCreateSelectionForLine = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData

    if (!viewportRef.value) return
    const viewportRect = viewportRef.value.getBoundingClientRect()

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const left = (minX - viewportRect.x) / canvasScale.value
    const top = (minY - viewportRect.y) / canvasScale.value
    const width = (maxX - minX) / canvasScale.value
    const height = (maxY - minY) / canvasScale.value

    const _start: [number, number] = [
      startX === minX ? 0 : width,
      startY === minY ? 0 : height,
    ]
    const _end: [number, number] = [
      endX === minX ? 0 : width,
      endY === minY ? 0 : height,
    ]

    return {
      left,
      top,
      start: _start,
      end: _end,
    }
  }

  const { createTextElement, createShapeElement, createLineElement } = useCreateElement()

  // 根据鼠标选区的位置大小插入元素
  const insertElementFromCreateSelection = (selectionData: CreateElementSelectionData) => {
    if (!creatingElement.value) return

    const type = creatingElement.value.type
    if (type === 'text') {
      const position = formatCreateSelection(selectionData)
      if (position) {
        position.height = 44
      }
      position && checkNewElementPosition(position)
      position && createTextElement(position, { vertical: creatingElement.value.vertical })
    }
    else if (type === 'shape') {
      const position = formatCreateSelection(selectionData)
      position && checkNewElementPosition(position)
      position && createShapeElement(position, creatingElement.value.data)
    }
    else if (type === 'line') {
      const position = formatCreateSelectionForLine(selectionData)
      position && checkNewElementPositionForLine(position)
      position && createLineElement(position, creatingElement.value.data)
    }
    mainStore.setCreatingElement(null)
  }

  const checkNewElementPosition = (position: { left:number, top:number, width:number, height:number }) => {
    console.log ('checkNewElementPosition', position, slideIndex.value)
    let midY = position.top + position.height / 2
    if (!(midY < -30 / canvasScale.value || midY > viewportStyles.value.height + 30 / canvasScale.value)) return
    const pageIndex = slideIndex.value
    let offPage = 0
    while ((midY < -30 / canvasScale.value || midY > viewportStyles.value.height + 30 / canvasScale.value)) {
      if (midY < -30 / canvasScale.value) {
        if (pageIndex + offPage >= 0) {
          position.top += viewportStyles.value.height + 30 - 30 * (1 - 1 / canvasScale.value)
          midY = position.top + position.height / 2
          offPage--
        }
        else {
          break
        }
      }
      else {
        if (pageIndex + offPage < slidesStore.slides.length) {
          position.top -= viewportStyles.value.height + 30 - 30 * (1 - 1 / canvasScale.value)
          midY = position.top + position.height / 2
          offPage++
        }
        else {
          break
        }
      }
    }
    if (offPage !== 0) {
      slidesStore.updateSlideIndex(pageIndex + offPage)
      console.log ('element out of page!', position, midY)
    }
  }

  const checkNewElementPositionForLine = (position: { left:number, top:number, start:[number, number], end:[number, number] }) => {
    console.log ('checkNewElementPosition', position, slideIndex.value)
    let midY = position.top + position.start[1] + (position.end[1] - position.start[1]) / 2
    if (!(midY < -30 / canvasScale.value || midY > viewportStyles.value.height + 30 / canvasScale.value)) return
    const pageIndex = slideIndex.value
    let offPage = 0
    while ((midY < -30 / canvasScale.value || midY > viewportStyles.value.height + 30 / canvasScale.value)) {
      if (midY < -30 / canvasScale.value) {
        if (pageIndex + offPage >= 0) {
          position.top += viewportStyles.value.height + 30 - 30 * (1 - 1 / canvasScale.value)
          midY = position.top + position.start[1] + (position.end[1] - position.start[1]) / 2
          offPage--
        }
        else {
          break
        }
      }
      else {
        if (pageIndex + offPage < slidesStore.slides.length) {
          position.top -= viewportStyles.value.height + 30 - 30 * (1 - 1 / canvasScale.value)
          midY = position.top + position.start[1] + (position.end[1] - position.start[1]) / 2
          offPage++
        }
        else {
          break
        }
      }
    }
    if (offPage !== 0) {
      slidesStore.updateSlideIndex(pageIndex + offPage)
      console.log ('element out of page!', position, midY)
    }
  }

  return {
    formatCreateSelection,
    insertElementFromCreateSelection,
  }
}