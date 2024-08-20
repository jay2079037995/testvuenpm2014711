/* eslint-disable */
import type { BaseElement, ChartItem, CommonChart, Diagram, Group, ScatterChart, ScatterChartData, Shape, Video } from '@pagepeek/pptx-to-json'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { ImageElementClip, LinePoint, PPTElement, PPTElementOutline, PPTElementShadow, PPTImageElement, 
  PPTLineElement, PPTShapeElement, PPTTextElement, ShapeGradient, Slide, SlideBackground } from '@/types/slides'
import type { PPTistDiagramElement, PPTistElement, PPTistFill, PPTistImageElement, PPTistLineConnector, PPTXElementExpand, 
  PPTistPrstAvLst, PPTistGroupElement, PPTistShapeElement, PPTistTextElement, PPTistTableCell} from '@/types/slidesPPTist'

import { assignElementId, calculateRightTriangleSides, calculateTriangleAngles, calculateWHLTRotate, pptistTextFontSize,
  extractSVGStyleProperties, getGroupElementLastId, isElementValidLT, isElementValidWH, isWidthHeightLine, 
  parsePxToNumber, pptistRgbToString, pptistSVGSubStroke, pptistSVGVaildStroke, pptistShapeFillImage, 
  pptistToGradient, pptistTBTextFontSize, recalculateBorderWidth, replaceIndexSlide, pptistTextFontSizeReduce} from '@/utils/other/pptistUtils'
import { subColorToSVGStr } from '@/utils/other/colorUtils'
import type { ShapePoolItem } from '@/configs/shapes'
import { NUMBER_PATTERN, UNICODE_PATTERN, containsUnicode } from '@/utils/other/unicode'
import { findSvgPath } from '@/utils/other/imageUtils'
import { includes } from 'lodash'

export const parseFillImage = (bgFills: PPTistFill[] | undefined): SlideBackground | undefined => {
  if (bgFills && bgFills.length > 0) {
    const groupFill = bgFills.find(item => item.type === 'group')
    if (groupFill && groupFill.type === 'group' && groupFill.elements && groupFill.elements.length > 0) {
      const parseFillGroup = (elements: PPTistElement[]) => {
        const textElement = elements.find(item => (item.type === 'text' && pptistShapeFillImage(item.fillColor)))
        if (textElement && textElement.type === 'text') {
          return {
            type: 'image',
            image: pptistShapeFillImage(textElement.fillColor),
            imageSize: 'cover',
          }
        }
        const groupElement = elements.find(item => (item.type === 'group'))
        if (groupElement && groupElement.type === 'group' && groupElement.elements && groupElement.elements.length > 0) {
          parseFillGroup(groupElement.elements)
        }
      }
      parseFillGroup(groupFill.elements)
    }
    const shapeFill = bgFills.find(item => (item.type === 'text' && pptistShapeFillImage(item.fillColor)))
    if (shapeFill && shapeFill.type === 'text') {
      return {
        type: 'image',
        image: pptistShapeFillImage(shapeFill.fillColor),
        imageSize: 'cover',
      }
    }
  }
  return undefined
}

export const elementReassign = (el: BaseElement, pptistEl?: PPTistElement | null) => {
  const pptistElType = pptistEl?.type
  if (pptistEl === undefined || pptistEl === null || pptistElType === null || pptistElType === undefined) {
    return
  }
  el.height = pptistEl.height
  el.width = pptistEl.width
  el.top = pptistEl.top
  el.left = pptistEl.left
  if (pptistEl?.type === 'videoLink') {
    el.type = 'video'
    const vidoeLink = el as Video
    vidoeLink.src = pptistEl.src
  }
  else if (pptistEl?.type === 'chart') {
    el.type = 'chart'
    const chartData = pptistEl.chartData // barChart 类型出现ser有多个
    const fristSerData = (chartData === undefined || chartData.serDataList === undefined || chartData.serDataList.length <= 0) ? undefined : chartData.serDataList[0]
    if (chartData?.chartType === 'scatterChart' || chartData?.chartType === 'bubbleChart') {
      const elScatter = el as ScatterChart
      const scatter: ScatterChartData = [[], []]
      const dataMat = fristSerData?.dataMat
      const length = dataMat === undefined ? 0 : dataMat.length
      const first = length > 0 ? dataMat![0] : undefined
      if (first && Array.isArray(first)) {
        const firstData: number[] = []
        for (let i = 0; i < first.length; i++) {
          firstData.push(parseInt(first[i]))
        }
        scatter[0] = firstData
      }
      const second = length > 1 ? dataMat![1] : undefined
      if (second && Array.isArray(second)) {
        const secondData: number[] = []
        for (let i = 0; i < second.length; i++) {
          secondData.push(parseInt(second[i]))
        }
        scatter[1] = secondData
      }
      elScatter.chartType = chartData?.chartType
      elScatter.data = scatter
    }
    else if (chartData?.chartType === 'lineChart'
      || chartData?.chartType === 'line3DChart'
      || chartData?.chartType === 'barChart'
      || chartData?.chartType === 'bar3DChart'
      || chartData?.chartType === 'pieChart'
      || chartData?.chartType === 'pie3DChart'
      || chartData?.chartType === 'doughnutChart'
      || chartData?.chartType === 'areaChart'
      || chartData?.chartType === 'area3DChart'
      || chartData?.chartType === 'radarChart'
      || chartData?.chartType === 'surfaceChart'
      || chartData?.chartType === 'surface3DChart'
      || chartData?.chartType === 'stockChart') {
      const elCommon = el as CommonChart
      elCommon.chartType = chartData?.chartType
      if (chartData?.barDir === 'bar' || chartData?.barDir === 'col') {
        elCommon.barDir = chartData?.barDir
      }
      elCommon.marker = chartData?.marker
      elCommon.holeSize = chartData?.holeSize
      elCommon.grouping = chartData?.grouping

      const chartItem: ChartItem[] = []
      const dataMat = fristSerData?.dataMat
      const length = dataMat === undefined ? 0 : dataMat.length
      for (let i = 0; i < length; i++) {
        const item = dataMat![i]
        if (item && typeof item === 'object') {
          const childItem = item as ChartItem
          if (childItem) {
            chartItem.push(childItem)
          }
        }
      }
      elCommon.data = chartItem
    }
  }
}

/**
 * 单点折点
 * @param shapType 
 * @param isEmptyAvLst 
 * @returns 
 */
export const singleRightAnglePoint = (shapType: string, isEmptyAvLst: boolean | undefined): boolean => {
  return shapType === 'bentConnector2'
}

/**
 * 两个折点，avlst为空
 */
export const doubleRightAnglePoint = (shapType: string, isEmptyAvLst: boolean | undefined): boolean => {
  return shapType === 'bentConnector3' && (undefined !== isEmptyAvLst && isEmptyAvLst)
}

/**
 * 两个折点，avlst不为空
 * @param shapType 
 * @param isEmptyAvLst 
 * @returns 
 */
export const doubleRightAngleAvLst = (shapType: string, isEmptyAvLst: boolean | undefined): boolean => {
  return shapType === 'bentConnector3' && (undefined !== isEmptyAvLst && !isEmptyAvLst)
}

/**
 * 三个折点，avlst不为空
 * @param shapType 
 * @param isEmptyAvLst 
 * @returns 
 */
export const threeRightAngleAvLst = (shapType: string, isEmptyAvLst: boolean | undefined): boolean => {
  return shapType === 'bentConnector4' && (undefined !== isEmptyAvLst && !isEmptyAvLst)
}

export const parseLineElement = (id: string, width: number, height: number, left: number, top: number, shapeType: string,
  isFlipV: boolean, isFlipH: boolean, rotate: number, name: string, isRecalculate: boolean, isEmptyAvLst: boolean | undefined,
  avLst?: PPTistPrstAvLst[], startElement?: PPTElement, endElement?: PPTElement, markerStart?: string, markerEnd?: string) => {

  let start: [number, number] = [0, 0]
  let end: [number, number] = [0, 0]
  let newLeft = left
  let newTop = top
  let newWidth = width
  let newHeight = height
  const brokens: Array<[number, number]> = []

  const isValidStCxn = startElement && startElement.type !== 'line' && startElement.id && startElement.id.length > 0
  const isValidEndCxn = endElement && endElement.type !== 'line' && endElement.id && endElement.id.length > 0
  // if (id.includes('39')) {
  //   console.log(rotate)
  // }
  if (!isFlipV && !isFlipH) { // 右下
    if (rotate === 90 || rotate === 270) {
      if (isWidthHeightLine(newWidth, newHeight)) {
        if (rotate === 270) {
          start = [newHeight, newWidth]
          end = [0, 0]
        }
        else {
          start = [0, 0]
          end = [newHeight, newWidth]
        }
        newLeft = left + (newWidth - newHeight) / 2
        newTop = top - (newWidth - newHeight) / 2
      }
      else {
        if (isValidStCxn) {
          const stTop = startElement.top
          const stWidth = startElement.width
          const stHeight = startElement.height
          const stLeft = startElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newTop = stTop + stHeight
            newWidth = newWidth + ((stLeft + (stWidth / 2)) - (newWidth + newLeft))
            newHeight = newHeight + (top - newTop)
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newTop = stTop + stHeight
            newWidth = newWidth + ((stLeft + stWidth / 2) - (newWidth + newLeft))
            newHeight = newHeight + (top - newTop)
          }
        }
        if (isValidEndCxn) {
          const endTop = endElement.top
          const endWidth = endElement.width
          const endHeight = endElement.height
          const endLeft = endElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newLeft = endLeft + endWidth
            newWidth = newWidth + left - newLeft
            newHeight = newHeight + ((endTop + endHeight / 2) - (newTop + newHeight))
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newLeft = endLeft + endWidth / 2
            newWidth = newWidth + left - newLeft
            newHeight = newHeight + (endTop - (newTop + newHeight))
          }
        }

        if (!isValidEndCxn || !isValidStCxn) {
          const tempW = newWidth
          const tempH = newHeight
          newWidth = tempH
          newHeight = tempW
          newTop = newTop + (tempH - tempW) / 2
          newLeft = newLeft - (tempH - tempW) / 2
        }
        if (rotate === 270) {
          start = [0, newHeight]
          end = [newWidth, 0]
        }
        else {
          start = [newWidth, 0]
          end = [0, newHeight]
        }
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([newWidth, newHeight])
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([newWidth, newHeight / 2])
          brokens.push([0, newHeight / 2])
        }
        else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          const polyline = (avLst![0].adjVal ?? 50000) / 100000
          brokens.push([newWidth, newHeight * polyline])
          brokens.push([0, newHeight * polyline])
        }
      }
    }
    else if (rotate === 180) {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newWidth = newWidth + ((stLeft + stWidth / 2) - (newLeft + newWidth))
          newHeight = newHeight + (stTop - (newTop + newHeight))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newWidth = newWidth + (stLeft - (newLeft + newWidth))
          newHeight = newHeight + ((stTop + stHeight / 2) - (newTop + newHeight))
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth
          newTop = endTop + endHeight / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth
          newTop = endTop + endHeight / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
      }

      start = [newWidth, newHeight]
      end = [0, 0]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([0, newHeight])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth / 2, newHeight])
        brokens.push([newWidth / 2, 0])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        if (polyline > 1) {
          brokens.push([newWidth * (1 - polyline), newHeight])
          brokens.push([newWidth * (1 - polyline), 0])
        }
        else {
          brokens.push([newWidth * polyline, newHeight])
          brokens.push([newWidth * polyline, 0])
        }
      }
    }
    else {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth
          newTop = stTop + stHeight / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth
          newTop = stTop + stHeight / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newHeight = newHeight + (endTop - (newTop + newHeight))
          newWidth = newWidth + ((endLeft + endWidth / 2) - (newLeft + newWidth))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newHeight = newHeight + ((endTop + endHeight / 2) - (newTop + newHeight))
          newWidth = newWidth + (endLeft - (newLeft + newWidth))
        }
      }

      start = [0, 0]
      end = [newWidth, newHeight]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth, 0])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth / 2, 0])
        brokens.push([newWidth / 2, newHeight])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        brokens.push([newWidth * polyline, 0])
        brokens.push([newWidth * polyline, newHeight])
      }
    }
  }
  else if (isFlipV && isFlipH) { // 左上
    if (rotate === 90 || rotate === 270) {
      if (isWidthHeightLine(newWidth, newHeight)) {
        if (rotate === 270) {
          start = [0, 0]
          end = [newHeight, newWidth]
        }
        else {
          start = [newHeight, newWidth]
          end = [0, 0]
        }
        newLeft = left + (newWidth - newHeight) / 2
        newTop = top - (newWidth - newHeight) / 2
      }
      else {
        const { rotatedLeft, rotatedTop, rotatedWidth, rotatedHeight } = calculateWHLTRotate(newLeft, newTop, newWidth, newHeight, rotate)
        newLeft = rotatedLeft
        newTop = rotatedTop
        newWidth = rotatedWidth
        newHeight = rotatedHeight

        if (isValidStCxn) {
          const stTop = startElement.top
          const stWidth = startElement.width
          const stHeight = startElement.height
          const stLeft = startElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newLeft = stLeft + stWidth
            newWidth = newWidth + (rotatedLeft - newLeft)
            newHeight = newHeight + ((stTop + stHeight / 2) - (rotatedTop + newHeight))
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newLeft = stLeft + stWidth
            newWidth = newWidth + (rotatedLeft - newLeft)
            newHeight = newHeight + ((stTop + stHeight / 2) - (rotatedTop + newHeight))
          }
          else if (threeRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newLeft = stLeft + stWidth / 2
            newWidth = newWidth + (rotatedLeft - newLeft)
            newHeight = newHeight + ((stTop + stHeight) - (rotatedTop + newHeight))
          }
        }
        if (isValidEndCxn) {
          const endTop = endElement.top
          const endWidth = endElement.width
          const endHeight = endElement.height
          const endLeft = endElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newTop = endTop + endHeight
            newWidth = newWidth + ((endLeft + endWidth / 2) - (newLeft + newWidth))
            newHeight = newHeight + (newTop - (endTop + endHeight))
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newTop = endTop + endHeight / 2
            newWidth = newWidth + (endLeft - (newLeft + newWidth))
            newHeight = newHeight + (rotatedTop - newTop)
          }
          else if (threeRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newTop = endTop + endHeight / 2
            newWidth = newWidth + (endLeft - (newLeft + newWidth))
            newHeight = newHeight + (rotatedTop - newTop)
          }
        }

        if (!isValidEndCxn || !isValidStCxn) {
          const tempW = newWidth
          const tempH = newHeight
          newWidth = tempH
          newHeight = tempW
          newTop = newTop + (tempH - tempW) / 2
          newLeft = newLeft - (tempH - tempW) / 2
        }
        if (rotate === 270) {
          start = [newWidth, 0]
          end = [0, newHeight]
        }
        else {
          start = [0, newHeight]
          end = [newWidth, 0]
        }
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([newWidth, newHeight])
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([newWidth / 2, newHeight])
          brokens.push([newWidth / 2, 0])
        }
        else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          const polyline = (avLst![0].adjVal ?? 50000) / 100000
          brokens.push([newWidth * polyline, newHeight])
          brokens.push([newWidth * polyline, 0])
        }
        else if (threeRightAngleAvLst(shapeType, isEmptyAvLst)) {
          const polyline1 = (avLst![0].adjVal ?? 50000) / 100000 // 负的
          const polyline2 = (avLst![1].adjVal ?? 50000) / 100000 // 正的
          brokens.push([0, newHeight - newHeight * polyline1])
          brokens.push([newWidth * polyline2, newHeight - newHeight * polyline1])
          brokens.push([newWidth * polyline2, 0])
        }
      }
    }
    else {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newHeight = newHeight + (stTop - (newTop + newHeight))
          newWidth = newWidth + (stLeft - (newLeft + newWidth))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newHeight = newHeight + (stTop - (newTop + newHeight))
          newWidth = newWidth + (stLeft - (newLeft + newWidth))
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth
          newTop = endTop + endHeight / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth / 2
          newTop = endTop + endHeight
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
      }
      if (rotate === 180) {
        start = [0, 0]
        end = [newWidth, newHeight]
      }
      else {
        start = [newWidth, newHeight]
        end = [0, 0]
      }
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth, 0])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth, newHeight / 2])
        brokens.push([0, newHeight / 2])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        brokens.push([newWidth, newHeight * polyline])
        brokens.push([0, newHeight * polyline])
      }
    }
  }
  else if (isFlipV && !isFlipH) { // 右上
    if (rotate === 90 || rotate === 270) {
      if (isWidthHeightLine(newWidth, newHeight)) {
        if (rotate === 270){
          start = [newHeight, 0]
          end = [0, newWidth]
        }
        else {
          start = [0, newWidth]
          end = [newHeight, 0]
        }
        // newLeft = left + (newWidth - newHeight) / 2
        // newTop = top - (newWidth - newHeight) / 2
      }
      else {
        if (isValidStCxn) {
          const stTop = startElement.top
          const stWidth = startElement.width
          const stHeight = startElement.height
          const stLeft = startElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newLeft = stLeft + stWidth
            newWidth = newWidth + (left - newLeft)
            newHeight = newHeight + ((stTop + stHeight / 2) - (top + newHeight))
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newLeft = stLeft + stWidth
            newWidth = newWidth + (left - newLeft)
            newHeight = newHeight + ((stTop + stHeight / 2) - (top + newHeight))
          }
        }
        if (isValidEndCxn) {
          const endTop = endElement.top
          const endWidth = endElement.width
          const endHeight = endElement.height
          const endLeft = endElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newTop = endTop + endHeight
            newWidth = newWidth + ((endLeft + endWidth / 2) - (newLeft + newWidth))
            newHeight = newHeight + (newTop - (endTop + endHeight))
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newTop = endTop + endHeight / 2
            newWidth = newWidth + (endLeft - (newLeft + newWidth))
            newHeight = newHeight + (top - newTop)
          }
        }
  
        if (!isValidEndCxn || !isValidStCxn) {
          const tempW = newWidth
          const tempH = newHeight
          newWidth = tempH
          newHeight = tempW
          newTop = newTop + (tempH - tempW) / 2
          newLeft = newLeft - (tempH - tempW) / 2
        }
        if (rotate === 270) {
          start = [newWidth, newHeight]
          end  = [0, 0]
        }
        else {
          start = [0, 0]
          end = [newWidth, newHeight]
        }
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([0, newHeight])
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([0, newHeight / 2])
          brokens.push([newWidth, newHeight / 2])
        }
        else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          const polyline = (avLst![0].adjVal ?? 50000) / 100000
          brokens.push([0, newHeight * polyline])
          brokens.push([newWidth, newHeight * polyline])
        }
      }
    }
    else if (rotate === 180) {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newTop = stTop + stHeight / 2
          newWidth = stLeft - left
          newHeight = newHeight + (top - newTop)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newTop = stTop + stHeight / 2
          newWidth = stLeft - left
          newHeight = newHeight + (top - newTop)
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth / 2
          newWidth = newWidth + left - newLeft
          newHeight = newHeight + (endTop - (newTop + newHeight))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth
          newWidth = newWidth + left - newLeft
          newHeight = newHeight + ((endTop + endHeight / 2) - (newTop + newHeight))
        }
      }

      start = [newWidth, 0]
      end = [0, newHeight]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([0, 0])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth / 2, 0])
        brokens.push([newWidth / 2, newHeight])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        if (polyline > 1) {
          brokens.push([newWidth * (1 - polyline), 0])
          brokens.push([newWidth * (1 - polyline), newHeight])
        }
        else {
          brokens.push([newWidth * polyline, 0])
          brokens.push([newWidth * polyline, newHeight])
        }
      }
    }
    else {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + ((stTop + stHeight / 2) - (top + newHeight))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + ((stTop + stHeight / 2) - (top + newHeight))
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newTop = endTop + endHeight
          newWidth = newWidth + ((endLeft + endWidth / 2) - (newLeft + newWidth))
          newHeight = newHeight + (newTop - (endTop + endHeight))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newTop = endTop + endHeight / 2
          newWidth = newWidth + (endLeft - (newLeft + newWidth))
          newHeight = newHeight + (top - newTop)
        }
      }

      start = [0, newHeight]
      end = [newWidth, 0]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        // brokens.push([0, 0])
        brokens.push([newWidth, newHeight])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth / 2, newHeight])
        brokens.push([newWidth / 2, 0])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        brokens.push([newWidth * polyline, newHeight])
        brokens.push([newWidth * polyline, 0])
      }
    }
  }
  else { // 左下
    if (rotate === 90) {
      if (isWidthHeightLine(newWidth, newHeight)) {
        start = [newHeight, 0]
        end = [0, newWidth]
        // newLeft = left + (newWidth - newHeight) / 2
        // newTop = top - (newWidth - newHeight) / 2
      }
      else {
        if (isValidStCxn) {
          const stTop = startElement.top
          const stWidth = startElement.width
          const stHeight = startElement.height
          const stLeft = startElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newTop = stTop + stHeight / 2
            newWidth = stLeft - left
            newHeight = newHeight + (top - newTop)
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newTop = stTop + stHeight
            newWidth = stLeft + (newWidth / 2) - left
            newHeight = newHeight + (top - newTop)
          }
        }
        if (isValidEndCxn) {
          const endTop = endElement.top
          const endWidth = endElement.width
          const endHeight = endElement.height
          const endLeft = endElement.left
          if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
            newLeft = endLeft + endWidth / 2
            newWidth = newWidth + left - newLeft
            newHeight = newHeight + (endTop - (newTop + newHeight))
          }
          else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
            newLeft = endLeft + endWidth / 2
            newWidth = newWidth + left - newLeft
            newHeight = newHeight + (endTop - (newTop + newHeight))
          }
        }

        if (!isValidStCxn && !isValidEndCxn) {
          const tempW = newWidth
          const tempH = newHeight
          newWidth = tempH
          newHeight = tempW
          newTop = newTop + (tempH - tempW) / 2
          newLeft = newLeft + (tempW - tempH) / 2
        }

        start = [newWidth, newHeight]
        end = [0, 0]
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([newWidth, 0])
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
          brokens.push([newWidth, newHeight / 2])
          brokens.push([0, newHeight / 2])
        }
        else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          const polyline = (avLst![0].adjVal ?? 50000) / 100000
          brokens.push([newWidth, newHeight * polyline])
          brokens.push([0, newHeight * polyline])
        }
      }
    }
    else if (rotate === 270) {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth
          newTop = stTop + stHeight / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth / 2
          newTop = stTop + stHeight
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (top - newTop)
        }
        else if (shapeType === 'line') {
          const tempW = newWidth
          const tempH = newHeight
          newWidth = tempH
          newHeight = tempW
          newTop = newTop + (tempH - tempW) / 2
          newLeft = newLeft + (tempW - tempH) / 2
        }
        else {
          newLeft = stLeft + stWidth / 2
          newTop = stTop + stHeight
          const tempW = newWidth
          const tempH = newHeight
          newWidth = tempH
          newHeight = tempW
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newHeight = newHeight + (endTop - (newTop + newHeight))
          newWidth = newWidth + (endLeft - (newLeft + newWidth))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newHeight = newHeight + (endTop - (newTop + newHeight))
          newWidth = newWidth + ((endLeft + endWidth / 2) - (newLeft + newWidth))
        }
        else {
          newHeight = newHeight + (endTop - (newTop + newHeight))
        }
      }
      if (!isValidStCxn && !isValidEndCxn) {
        const tempW = newWidth
        const tempH = newHeight
        newWidth = tempH
        newHeight = tempW
        newTop = newTop + (tempH - tempW) / 2
        newLeft = newLeft + (tempW - tempH) / 2
      }
      
      start = [0, 0]
      end = [newWidth, newHeight]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth, 0])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([0, newHeight / 2])
        brokens.push([newWidth, newHeight / 2])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        const pH = newHeight * polyline
        brokens.push([0, pH])
        brokens.push([newWidth, pH])
      }
    }
    else if (rotate === 180) {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth / 2
          newWidth = newWidth + (stLeft - left)
          newHeight = newHeight + (stTop - (newTop + newHeight))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = stLeft + stWidth
          newWidth = stLeft + (newWidth / 2) - left
          newHeight = newHeight + ((stTop + stHeight / 2) - (newTop + newHeight))
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newTop = endTop + endHeight / 2
          newWidth = newWidth + (endLeft - (newLeft + newWidth))
          newHeight = newHeight + (newTop - top)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newTop = endTop + endHeight / 2
          newWidth = newWidth + (endLeft - (newLeft + newWidth))
          newHeight = newHeight + (newTop - top)
        }
      }
      start = [0, newHeight]
      end = [newWidth, 0]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([0, 0])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newHeight, newWidth / 2])
        brokens.push([0, newWidth / 2])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        const pW = newWidth * polyline
        brokens.push([pW, newHeight])
        brokens.push([pW, 0])
      }
    }
    else {
      if (isValidStCxn) {
        const stTop = startElement.top
        const stWidth = startElement.width
        const stHeight = startElement.height
        const stLeft = startElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newTop = stTop + stHeight / 2
          newWidth = newWidth + (stLeft - (left + newWidth))
          newHeight = newHeight + (top - newTop)
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          const polyline = (isEmptyAvLst ? 50000 : (avLst![0].adjVal ?? 50000)) / 100000
          newTop = stTop + stHeight / 2
          newWidth = newWidth + ((stLeft + (polyline >= 0 ? 0 : stWidth)) - (left + newWidth))
          newHeight = newHeight + (top - newTop)
        }
      }
      if (isValidEndCxn) {
        const endTop = endElement.top
        const endWidth = endElement.width
        const endHeight = endElement.height
        const endLeft = endElement.left
        if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth / 2
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + (endTop - (newTop + newHeight))
        }
        else if (doubleRightAnglePoint(shapeType, isEmptyAvLst) || doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
          newLeft = endLeft + endWidth
          newWidth = newWidth + (left - newLeft)
          newHeight = newHeight + ((endTop + endHeight / 2) - (newTop + newHeight))
        }
      }
      start = [newWidth, 0]
      end = [0, newHeight]
      if (singleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([0, 0])
      }
      else if (doubleRightAnglePoint(shapeType, isEmptyAvLst)) {
        brokens.push([newWidth / 2, 0])
        brokens.push([newWidth / 2, newHeight])
      }
      else if (doubleRightAngleAvLst(shapeType, isEmptyAvLst)) {
        const polyline = (avLst![0].adjVal ?? 50000) / 100000
        brokens.push([newWidth - newWidth * polyline, 0])
        brokens.push([newWidth - newWidth * polyline, newHeight])
      }
    }
  }

  let startLinePoint: LinePoint = ''
  // let endLinePoint: LinePoint = shapeType === 'straightConnector1' ? 'arrow' : ''
  let endLinePoint: LinePoint = ''
  if (markerStart !== undefined && (markerStart === 'triangle' || markerStart === 'arrow' || markerStart === 'stealth')) {
    startLinePoint = 'arrow'
  } 
  else if (markerStart !== undefined && (markerStart === 'oval')) {
    startLinePoint = 'dot'
  }
  if (markerEnd !== undefined && (markerEnd === 'triangle' || markerEnd === 'arrow' || markerEnd === 'stealth')) {
    endLinePoint = 'arrow'
  }
  else if (markerEnd !== undefined && (markerEnd === 'oval')) {
    endLinePoint = 'dot'
  }
  else if (shapeType === 'bentConnector2' && (name === 'Elbow Connector 49' || name === 'Elbow Connector 46')) {
    endLinePoint = 'arrow'
  }
  else if (shapeType === 'bentConnector3' && (name === 'Elbow Connector 55' || name === 'Elbow Connector 52')) {
    endLinePoint = 'arrow'
  }
  return { start, end, newLeft, newTop, brokens, startLinePoint, endLinePoint }
}

export const parseLineElementOfPPtist = (el: Shape, pptistEl?: PPTistTextElement | PPTistShapeElement | undefined, fillColor?: string, gradient?: ShapeGradient, groupId?: string | null): PPTLineElement => {
  if (undefined === pptistEl || null === pptistEl || !pptistEl) {
    const id = assignElementId(null, groupId, 'line')
    const { start, end, newLeft, newTop, brokens, startLinePoint, endLinePoint } = parseLineElement(id, el.width, el.height, el.left, el.top,
      el.shapType, el.isFlipV, el.isFlipH, el.rotate, el.name, false, undefined)
    return {
      type: 'line', id, width: recalculateBorderWidth(el.borderWidth),
      left: newLeft, top: newTop, start, end, style: el.borderType === 'solid' ? 'solid' : 'dashed',
      color: el.borderColor, points: [startLinePoint, endLinePoint], brokens,
    }
  }

  const rotate = pptistEl.rotate ?? el.rotate
  let borderColor = pptistEl.borderColor
  if (undefined === borderColor || null === borderColor || 'none' === borderColor || '' === borderColor) {
    borderColor = el.borderColor
  }
  if (undefined === borderColor || null === borderColor || 'none' === borderColor || '' === borderColor) {
    if (fillColor !== el.fillColor && !(undefined === fillColor || null === fillColor || 'none' === fillColor || '' === fillColor)) {
      borderColor = fillColor
    } 
    else {
      borderColor = subColorToSVGStr(pptistEl.svg) ?? el.fillColor
    }
  }
  // console.log('type = shape fillColor=%s', fillColor)
  const id = assignElementId(pptistEl, groupId, 'line')
  const isVLT = isElementValidLT(el.left, el.top)
  const isVWH = isElementValidWH(el.width, el.height)

  let width = el.width
  let height = el.height
  let left = el.left
  let top = el.top 
  if (!isVWH || !isVLT || (width === 0 && height === 0)) {
    left = pptistEl.left
    top = pptistEl.top
    width = pptistEl.width
    height = pptistEl.height
  }
  const avLst = pptistEl.avLst
  const isEmptyAvLst = null === avLst || undefined === avLst || !avLst || avLst.length <= 0
  const shapeType = el.shapType ?? pptistEl.shapType
  const name = el.name ?? pptistEl.name

  const { start, end, newLeft, newTop, brokens, startLinePoint, endLinePoint } = parseLineElement(id, width, height, left, top,
    shapeType, el.isFlipV, el.isFlipH, rotate, name, false, isEmptyAvLst, avLst, undefined, undefined, pptistEl?.markerStart, pptistEl?.markerEnd)

  let lineConnector: PPTistLineConnector | undefined = undefined
  if (pptistEl.stCxnSize && pptistEl.stCxnSize.cxnId && pptistEl.stCxnSize.cxnId !== undefined) {
    lineConnector = {
      left,
      top,
      width,
      height,
      isFlipV: el.isFlipV,
      isFlipH: el.isFlipH,
      rotate,
      name,
      avLst,
      isEmptyAvLst,
      isCxnSp: pptistEl.isCxnSp,
      stCxnSize: pptistEl.stCxnSize,
      endCxnSize: pptistEl.endCxnSize,
      shapType: shapeType,
      custExist: pptistEl.custExist,
      imgFillFlg: pptistEl.imgFillFlg,
      grndFillFlg: pptistEl.grndFillFlg,
      markerStart: pptistEl?.markerStart,
      markerEnd: pptistEl?.markerEnd,
    }
  }
  const borderWidth = recalculateBorderWidth(el.borderWidth, pptistEl.borderWidth)
  return {
    type: 'line',
    id,
    width: borderWidth < 1.333 ? 1.333 : borderWidth,
    left: newLeft,
    top: newTop,
    start,
    end,
    style: el.borderType === 'solid' ? 'solid' : 'dashed',
    color: borderColor ? borderColor : el.borderColor,
    points: [startLinePoint, endLinePoint],
    order: pptistEl.order,
    brokens,
    lineConnector,
  }
}

export const lineConnectorLocation = (elements: PPTElement[]) => {
  const idMap = new Map<string, number>()
  elements.forEach((element, index) => {
    if (element.type === 'line' && element.lineConnector) {
      const lineConnector = element.lineConnector
      const stCxnSize = lineConnector.stCxnSize
      if (stCxnSize?.cxnId && stCxnSize.cxnId !== undefined) {
        const endCxnSize = lineConnector.endCxnSize
        const { startElment, endElment } = associatedElements(elements, stCxnSize.cxnId, endCxnSize?.cxnId)
        const width = lineConnector.width
        const height = lineConnector.height
        const left = lineConnector.left
        const top = lineConnector.top
        const avLst = lineConnector.avLst
        const isEmptyAvLst = lineConnector.isEmptyAvLst
        const shapeType = lineConnector.shapType
        const name = lineConnector.name
        const { start, end, newLeft, newTop, brokens, startLinePoint, endLinePoint } = parseLineElement(element.id, width, height, left, top,
          shapeType, lineConnector.isFlipV, lineConnector.isFlipH, lineConnector.rotate, name, true,
          isEmptyAvLst, avLst, startElment, endElment, lineConnector.markerStart, lineConnector.markerEnd)
        element.start = start
        element.end = end
        element.left = newLeft
        element.top = newTop
        element.brokens = brokens
        element.points = [startLinePoint, endLinePoint]
        element.lineConnector = undefined
      }
    }

    while (idMap.has(element.id)) {
      element.id = `r-${element.id}`
    }
    idMap.set(element.id, index)
  })
}

export const associatedElements = (elements: PPTElement[], stCxnId: string, endCxnId?: string) => {
  let startElment, endElment
  for (const element of elements) {
    if (element.type !== 'line') {
      const id = getGroupElementLastId(element.id)
      if (id !== '' && id === stCxnId) {
        startElment = element
      }
      else if (id !== '' && endCxnId !== undefined && id === endCxnId) {
        endElment = element
      }
    }
  }
  return {
    startElment,
    endElment
  }
}

export const parsePptistFillElement = (indexSlide: number, scale: number, shapeList: ShapePoolItem[], bgFills?: PPTistFill[] | undefined): PPTElement[] => {
  if (bgFills === undefined || !bgFills || bgFills.length === 0) {
    return []
  }

  const { theme } = storeToRefs(useSlidesStore())

  const elements: PPTElement[] = []
  const bgFill = bgFills.find(item => (item.type === 'background'))
  if (undefined !== bgFill && bgFill.type === 'background') {
    let indexBgFill = 0
    for (const fill of bgFills) {
      indexBgFill++
      if (fill.type === 'image' && fill.src) {
        const imageEl: PPTImageElement = {
          type: 'image',
          id: assignElementId(fill, 'b', 'image'),
          src: fill.src,
          width: Number((fill.width * scale).toFixed(3)),
          height: Number((fill.height * scale).toFixed(3)),
          left: Number((fill.left * scale).toFixed(3)),
          top: Number((fill.top * scale).toFixed(3)),
          fixedRatio: true,
          rotate: fill.rotate,
          order: fill.order
        }
        elements.push(imageEl)
      }
      else if (fill.type === 'shape') {
        const fillColor = fill.fillColor
        if (fillColor && pptistShapeFillImage(fillColor)) {
          const imageEl: PPTImageElement = {
            type: 'image',
            id: assignElementId(fill, 'b', 'image'),
            src: fillColor,
            width: Number((fill.width * scale).toFixed(3)),
            height: Number((fill.height * scale).toFixed(3)),
            left: Number((fill.left * scale).toFixed(3)),
            top: Number((fill.top * scale).toFixed(3)),
            fixedRatio: true,
            rotate: fill.rotate,
            order: fill.order
          }
          elements.push(imageEl)
        }
        else {
          const shapeEl = parseShareFillTOElement(fill, scale, shapeList, theme.value.fontColor, theme.value.fontName, fillColor)
          if (shapeEl) {
            elements.push(shapeEl)
          }
        }
      }
      else if (fill.type === 'text' && fill.content !== '') {
        let textHasContent = false
        const textDiv: HTMLDivElement | null = document.createElement('div')
        textDiv.innerHTML = fill.content
        const regex = /^(&nbsp;|\s)+$/
        textHasContent = fill.content.trim().length > 0 && !regex.test(textDiv.innerText)
        if (textHasContent) {
          fill.content = replaceIndexSlide(fill.content, `${indexSlide}`)    
          fill.content = pptistTextFontSize(fill.content, scale)
          const textEl: PPTTextElement = {
            type: 'text',
            id: assignElementId(fill, 'b', 'text'),
            width: Number((fill.width * scale).toFixed(3)),
            height: Number((fill.height * scale).toFixed(3)),
            left: Number((fill.left * scale).toFixed(3)),
            top: Number((fill.top * scale).toFixed(3)),
            rotate: fill.rotate,
            content: fill.content,
            lineHeight: 1,
            fill: fill.fillColor,
            vertical: fill.isVertical,
            order: fill.order,
            defaultFontName: '',
            defaultColor: '',
            lock: true
          }
          const isValidBorder = fill.borderWidth && fill.borderWidth >= 0 && fill.borderColor && fill.borderColor !== '#000'
          const isNoFillColor = fill.borderWidth && fill.borderWidth < 1 && (fill.fillColor === 'none' || fill.fillColor === '') && fill.borderColor && fill.borderColor !== '#000' && fill.borderType
          let outline: PPTElementOutline | undefined = undefined
          if (isValidBorder || isNoFillColor) {
            outline = {
              color: fill.borderColor,
              width: recalculateBorderWidth(fill.borderWidth),
              style: !fill.borderType || fill.borderType === 'solid' ? 'solid' : 'dashed',
            }
            textEl.outline = outline
          }
          if (fill.shadow) {
            textEl.shadow = fill.shadow
          }
          elements.push(textEl)
        }
      }
      else if (fill.type === 'group') {
        if (fill.elements && fill.elements.length > 0) {
          const parsePptistFill = (items: PPTistElement[]) => {
            for (const item of items) {
              if (item.type === 'image' && item.src) {
                const imageEl: PPTImageElement = {
                  type: 'image',
                  id: assignElementId(item, 'b', 'image'),
                  src: item.src,
                  width: Number((item.width * scale).toFixed(3)),
                  height: Number((item.height * scale).toFixed(3)),
                  left: Number((item.left * scale).toFixed(3)),
                  top: Number((item.top * scale).toFixed(3)),
                  fixedRatio: true,
                  rotate: item.rotate,
                  order: item.order
                }
                elements.push(imageEl)
              }
              else if (item.type === 'shape') {
                const fillColor = item.fillColor
                if (fillColor && pptistShapeFillImage(fillColor)) {
                  const imageEl: PPTImageElement = {
                    type: 'image',
                    id: assignElementId(item, 'b', 'image'),
                    src: fillColor,
                    width: Number((item.width * scale).toFixed(3)),
                    height: Number((item.height * scale).toFixed(3)),
                    left: Number((item.left * scale).toFixed(3)),
                    top: Number((item.top * scale).toFixed(3)),
                    fixedRatio: true,
                    rotate: item.rotate,
                    order: item.order
                  }
                  elements.push(imageEl)
                }
                else {
                  const shapeEl = parseShareFillTOElement(item, scale, shapeList, theme.value.fontColor, theme.value.fontName, fillColor)
                  if (shapeEl) {
                    elements.push(shapeEl)
                  }
                }
              }
              else if (item.type === 'text' && item.content !== '') {
                let textHasContent = false
                const textDiv: HTMLDivElement | null = document.createElement('div')
                textDiv.innerHTML = item.content
                const regex = /^(&nbsp;|\s)+$/
                textHasContent = item.content.trim().length > 0 && !regex.test(textDiv.innerText)
                if (textHasContent) {
                  item.content = pptistTextFontSize(item.content, scale)
                  item.content = replaceIndexSlide(item.content, `${indexSlide}`)    
                  const textEl: PPTTextElement = {
                    type: 'text',
                    id: assignElementId(item, 'b', 'text'),
                    width: Number((item.width * scale).toFixed(3)),
                    height: Number((item.height * scale).toFixed(3)),
                    left: Number((item.left * scale).toFixed(3)),
                    top: Number((item.top * scale).toFixed(3)),
                    rotate: item.rotate,
                    content: item.content,
                    lineHeight: 1,
                    fill: item.fillColor,
                    vertical: item.isVertical,
                    order: item.order,
                    defaultFontName: '',
                    defaultColor: '',
                    lock: true
                  }
                  const isValidBorder = item.borderWidth && item.borderWidth >= 0 && item.borderColor && item.borderColor !== '#000'
                  const isNoFillColor = item.borderWidth && item.borderWidth < 1 && (item.fillColor === 'none' || item.fillColor === '') && item.borderColor && item.borderColor !== '#000' && item.borderType
                  let outline: PPTElementOutline | undefined = undefined
                  if (isValidBorder || isNoFillColor) {
                    outline = {
                      color: item.borderColor,
                      width: recalculateBorderWidth(item.borderWidth),
                      style: !item.borderType || item.borderType === 'solid' ? 'solid' : 'dashed',
                    }
                    textEl.outline = outline
                  }
                  if (item.shadow) {
                    textEl.shadow = item.shadow
                  }
                  elements.push(textEl)
                }
              }
              else if (item.type === 'group') {
                if (item.elements && item.elements.length > 0) {
                  parsePptistFill(item.elements)
                }
              }
              else {
                console.log('parsePptistFillElement fill group type=%s, indexBgFill=%d', item.type, indexBgFill)
              }
            }
          }
          parsePptistFill(fill.elements)
        }
      }
    }
  }
  return elements
}

export const parsePyramidElements = (diagram: Diagram, pptistDiagram: PPTistDiagramElement, scale: number, pptistScale: number, groupId: string, 
  expandOrder: number, parentLeft: number, parentTop: number): PPTElement[] => {
  const elements: PPTElement[] = []
  const els = diagram.elements.map(_el => ({
    ..._el,
    left: _el.left + parentLeft,
    top: _el.top + parentTop,
  }))
  const pptistEls = pptistDiagram.elements
  const dspData = pptistDiagram.dspData

  const { theme } = storeToRefs(useSlidesStore())

  let sideAngle = 0 // 梯形的锐角
  let grandTotalH = 0
  for (let i = 0; i < els.length; i++) {
    const el = els[i]
    const elType = el.type
    const pptistEl = pptistEls[i]
    const originWidth = el.width
    const originHeight = el.height
    const originLeft = el.left
    const originTop = el.top
    const pptistOriginWidth = pptistEl.width
    const pptistOriginHeight = pptistEl.height
    const pptistOriginLeft = pptistEl.left
    const pptistOriginTop = pptistEl.top
    el.width = Number((el.width * scale).toFixed(3))
    el.height = Number((el.height * scale).toFixed(3))
    el.left = Number((el.left * scale).toFixed(3))
    el.top = Number((el.top * scale).toFixed(3))
    pptistEl.width = Number((pptistEl.width * pptistScale).toFixed(3))
    pptistEl.height = Number((pptistEl.height * pptistScale).toFixed(3))
    pptistEl.left = Number((pptistEl.left * pptistScale).toFixed(3))
    pptistEl.top = Number((pptistEl.top * pptistScale).toFixed(3))
    
    const pptistType = pptistEl.type
    const isPptistShapeType = pptistType === 'shape' || pptistType === 'text'
    const isShapeType = elType === 'shape' || elType === 'text'
    let fillColor = isPptistShapeType ? pptistRgbToString(pptistEl.fillColor) : undefined
    if (fillColor === undefined) {
      fillColor = isShapeType ? el.fillColor : undefined
    }
    let outline: PPTElementOutline | undefined = undefined
    if (isPptistShapeType && pptistEl.borderWidth !== undefined && (null === pptistEl.borderWidth || isNaN(pptistEl.borderWidth) || pptistEl.borderWidth > 0)) {
      outline = {
        color: pptistRgbToString(pptistEl.borderColor) ?? el.borderColor,
        width: recalculateBorderWidth(pptistEl.borderWidth),
        style: el.borderType === 'solid' ? 'solid' : 'dashed',
      }
    }
    let width = pptistEl.width
    let height = pptistEl.height
    let secondaryLeft = isNaN(el.left) ? pptistEl.left : el.left
    let secondaryTop = isNaN(el.top) ? pptistEl.top : el.top
    const dspWidth = Number((dspData.dspWidth * pptistScale).toFixed(3))
    const dspHeight = Number((dspData.dspHeight * pptistScale).toFixed(3))
    const content = isPptistShapeType ? pptistEl.content : el.content

    let elpath
    let viewBox: [number, number] = [width, height]
    if (!elpath || elpath === '') {
      elpath = isPptistShapeType ? pptistEl?.path : undefined
      viewBox = [pptistOriginWidth, pptistOriginHeight]
    }
    if (!elpath || elpath === '') {
      elpath = elType === 'shape' ? el.path : undefined
      viewBox = [originWidth, originHeight]
    }
    if (!elpath || elpath === '') {
      elpath = findSvgPath(isPptistShapeType ? pptistEl?.svg : undefined)
      viewBox = [pptistOriginWidth, pptistOriginHeight]
      if (!elpath || elpath === '' || elpath === 'none' || elpath === undefined) {
        elpath = 'M 50 0 L 150 0 L 200 200 L 0 200 L 50 0 Z'
        viewBox = [200, 200]
      }
    }
    if (i === 0) {
      const { topCorner, bottomA, bottomB, longSide } = calculateTriangleAngles(width, height)
      // secondaryLeft = diagram.left + (dspWidth - width) / 2
      // secondaryTop = diagram.top + (pptistDiagram.height - dspHeight) / 2
      elpath = `M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`
      sideAngle = bottomA
      viewBox = [width, height]
    }
    else {
      const lastEl = elements[i - 1] as PPTShapeElement
      grandTotalH += lastEl.height
      secondaryTop = lastEl.top + lastEl.height
      if (i === els.length - 1) {
        height = dspHeight - grandTotalH
        if (pptistEl.height > height) {
          height = pptistEl.height
        }
      }
      const { oppositeSide, hypotenuse } = calculateRightTriangleSides((90 - sideAngle), height)
      width = lastEl.width + oppositeSide * 2
      const offsetW = (width - lastEl.width) / 2
      // secondaryLeft = diagram.left + (dspWidth - width) / 2
      // elpath = `M ${oppositeSide} 0 L ${oppositeSide + lastEl.width} 0 L ${width} ${height} L 0 ${height} Z`
      elpath = `M ${offsetW} 0 L ${width - offsetW} 0 L ${width} ${height} L 0 ${height} Z`
      viewBox = [width, height]
    }

    secondaryLeft = diagram.left + (dspWidth - width) / 2 + (pptistDiagram.width - dspWidth) / 2

    const element: PPTShapeElement = {
      type: 'shape',
      id: assignElementId(pptistEl, ((groupId !== undefined && groupId) ? `${groupId}-d` : 'd'), 'shape'),
      width,
      height,
      left: secondaryLeft,
      top: secondaryTop,
      viewBox,
      path: elpath,
      fill: fillColor || 'none',
      fixedRatio: false,
      rotate: el.rotate,
      outline: outline,
      text: {
        content: content,
        defaultFontName: theme.value.fontName,
        defaultColor: theme.value.fontColor,
        align: 'middle',
      },
      flipH: el.isFlipH,
      flipV: el.isFlipV,
      order: ((pptistEl?.order ?? 0) + pptistDiagram.order)
    }
    if (el.shadow) {
      element.shadow = el.shadow
    }
    elements.push(element)
  }
  return elements
}

const isVaildShareFillType = (name: string, custExist: boolean, shapeType?: string, imgFillFlg?: boolean, grndFillFlg?: boolean): boolean => {
  if (name === null || name === undefined || ((shapeType === null || shapeType === undefined) && !custExist)) {
    return false
  }
  return true
}

const parseShareFillTOElement = (fill: PPTistFill, scale: number, shapeList: ShapePoolItem[], fontColor: string, fontName: string, fillColor?: string) => {
  if (fill.type !== 'shape' || null === fillColor || undefined === fillColor || (fill.width === 0 || fill.height === 0)) {
    return undefined
  }
  const shapeType = fill.shapType
  if (!isVaildShareFillType(fill.name, fill.custExist, shapeType, fill.imgFillFlg, fill.grndFillFlg)) {
    return undefined
  }

  const shape = shapeList.find(item => item.pptxShapeType === fill.shapType)

  let path = fill.path
  let box = undefined
  if ((null === path || undefined === path) && shape) {
    path = shape.path
    box = shape.viewBox
  }

  const gradient = pptistToGradient(fillColor)
  const color = gradient ? gradient.color[0] : pptistRgbToString(fillColor)

  const isValidBorder = fill.borderWidth && fill.borderWidth >= 0 && fill.borderColor && fill.borderColor !== '#000'
  const isNoFillColor = fill.borderWidth && fill.borderWidth < 1 && (fillColor === 'none' || fillColor === '') && fill.borderColor && fill.borderColor !== '#000' && fill.borderType
  const { stroke, strokeWidth } = pptistSVGSubStroke(fill.svg)
  const isNaNStrokeWidth = (strokeWidth !== undefined && !isNaN(strokeWidth) && strokeWidth === -2) && (fill.borderColor !== '#000' && stroke && stroke !== 'none' && stroke.length > 0)
  const isValidPptistBorder = pptistSVGVaildStroke(stroke, strokeWidth)
  const svgTLWH = extractSVGStyleProperties(fill.svg)

  let outline: PPTElementOutline | undefined = undefined
  if ((isValidBorder || isNoFillColor || isNaNStrokeWidth) && isValidPptistBorder) {
    outline = {
      color: fill.borderColor,
      width: recalculateBorderWidth(fill.borderWidth, strokeWidth),
      style: fill.borderType === 'solid' ? 'solid' : 'dashed',
    }
  }

  const shapeEl: PPTShapeElement = {
    type: 'shape',
    id: assignElementId(fill, 'b', 'shape'),
    width: Number((fill.width * scale).toFixed(3)),
    height: Number((fill.height * scale).toFixed(3)),
    left: Number((fill.left * scale).toFixed(3)),
    top: Number((fill.top * scale).toFixed(3)),
    viewBox: box ?? [svgTLWH.width ?? fill.width, svgTLWH.height ?? fill.height],
    fill: color || 'none',
    gradient: gradient,
    fixedRatio: false,
    rotate: fill.rotate,
    outline: outline,
    text: {
      content: pptistTextFontSize(fill.content, scale),
      defaultFontName: fontName,
      defaultColor: fontColor,
      align: 'middle',
    },
    flipH: fill.isFlipH,
    flipV: fill.isFlipV,
    order: fill.order,
    path: path ?? ''
  }
  if (fill.shadow) {
    shapeEl.shadow = fill.shadow
  }
  return shapeEl
}

/**
 * @description 解析图片样式
 * @param {number} elwidth 元素宽度
 * @param {number} elheight 元素高度
 * @param {string} imageElement 图片元素
 * @returns {ImageElement}
 * const avLst = rectShape.avLst
    if (shapeType === 'roundRect' && avLst !== undefined && avLst.length > 0) {
      const adjVal = avLst[0].adjVal
      if (adjVal !== undefined) {
        const radiusValue = Math.min(adjVal / 100000, 0.5)
      }
    }
 */
export const parseImageShapeStyle = (elwidth: number, elheight: number, imageElement?: PPTistImageElement, expandElement?: PPTXElementExpand): { outline?: PPTElementOutline, clip?: ImageElementClip, shadow?: PPTElementShadow, fixedRatio: boolean } => {
  if (imageElement === undefined || !imageElement) {
    return { outline: undefined, clip: undefined, fixedRatio: true, shadow: undefined }
  }
  const rectShape = imageElement.rectShape
  if (rectShape === undefined || !rectShape) {
    return { outline: undefined, clip: undefined, fixedRatio: true, shadow: undefined }
  }
  let outline: PPTElementOutline | undefined = undefined
  const borderWidth = rectShape.borderWidth
  const borderColor = rectShape.borderColor
  if (borderWidth && borderWidth > 0 && borderColor && borderColor !== undefined) {
    outline = {
      color: borderColor,
      width: recalculateBorderWidth(borderWidth),
      style: (rectShape.borderType === undefined || rectShape.borderType === 'solid') ? 'solid' : 'dashed',
    }
  }

  let left
  let top
  let right
  let bottom
  if ((rectShape.rectLeft !== null && rectShape.rectLeft !== undefined)
    || (rectShape.rectTop !== null && rectShape.rectTop !== undefined)
    || (rectShape.rectRight !== null && rectShape.rectRight !== undefined)
    || (rectShape.rectBottom !== null && rectShape.rectBottom !== undefined)) {
    left = rectShape.rectLeft ?? 0
    top = rectShape.rectTop ?? 0
    right = 100 - (rectShape.rectRight ?? 0)
    bottom = 100 - (rectShape.rectBottom ?? 0)
  }

  let clip: ImageElementClip | undefined = undefined
  if ((left !== undefined)
    && (top !== undefined)
    && (right !== undefined)
    && (bottom !== undefined)
    && (left < right && top < bottom)) {
    const shapeType = rectShape.shapType ?? 'rect'
    clip = {
      'shape': shapeType,
      'range': [
        [
          left,
          top
        ],
        [
          right,
          bottom
        ]
      ]
    }
  }
  const fixedRatio = rectShape.noChangeArrowheads === undefined || isNaN(rectShape.noChangeArrowheads) || rectShape.noChangeArrowheads === 1
  // const fixedRatio = imageElement.relativeResize === undefined || !imageElement.relativeResize
  return { outline, clip, shadow: rectShape.picShadow, fixedRatio }
}

export const assemblingSpecialElement = (elGroup: Group, pptistGroup: PPTistGroupElement | null, groupRotate: number, groupId?: string) => {
  // cstate !== undefined && cstate === 'print' && bwMode === 'auto'
  if (pptistGroup === null || pptistGroup === undefined || pptistGroup.bwMode === undefined || pptistGroup.bwMode !== 'auto') {
    return undefined
  }
  const expandData = pptistGroup.expandData
  if (expandData === null || expandData === undefined) {
    return undefined
  }
  let outline: PPTElementOutline | undefined = undefined
  if (expandData.borderColor && expandData.borderType && expandData.borderWidth && !isNaN(expandData.borderWidth) && expandData.borderWidth > 0) {
    outline = {
      color: expandData.borderColor,
      width: recalculateBorderWidth(expandData.borderWidth),
      style: expandData.borderType === 'solid' ? 'solid' : 'dashed',
    }
  }
  const isEmptyFillColor = (undefined === expandData.fillColor || null === expandData.fillColor || 'none' === expandData.fillColor || '' === expandData.fillColor)
  let fillColor
  let gradient: ShapeGradient | undefined = undefined
  if (!isEmptyFillColor && !pptistGroup.isUseBgFill) {
    gradient = pptistToGradient(expandData.fillColor)
    fillColor = gradient ? gradient.color[0] : pptistRgbToString(expandData.fillColor)
    if (undefined === fillColor || null === fillColor || 'none' === fillColor || '' === fillColor) {
      fillColor = expandData.fillColor
    }
  }
  if ((undefined === fillColor || null === fillColor || 'none' === fillColor || '' === fillColor) && gradient === undefined && outline === undefined) {
    return undefined
  }
  const childMinOrder = pptistGroup.elements.reduce((minOrder, element) => {
    return (minOrder === undefined || element.order < minOrder) ? element.order : minOrder
  }, pptistGroup.order)
  const order = Math.min(childMinOrder, pptistGroup.order)
  const shapeEl: PPTShapeElement = {
    type: 'shape',
    id: assignElementId(pptistGroup, groupId, 'shape'),
    width: pptistGroup.width,
    height: pptistGroup.height,
    left: pptistGroup.left,
    top: pptistGroup.top,
    fill: fillColor || 'none',
    gradient,
    fixedRatio: false,
    rotate: groupRotate,
    outline: outline,
    flipH: pptistGroup.isFlipH,
    flipV: pptistGroup.isFlipV,
    order: order - 1,
    path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
    viewBox: [200, 200],
  }
  return shapeEl
}



export const adjustDotHtmlString = (html: string): string => {
  // const [contains, foundString] = containsUnicode(html)
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const dotParentDivs = doc.querySelectorAll('.bullet-code-pattern')
  const containsNumberBullet = html.includes(NUMBER_PATTERN)

  dotParentDivs.forEach(dotParentDiv => {
    const parentElement = dotParentDiv.parentNode as HTMLElement | null
    const dotSymbol = dotParentDiv.querySelector('div')
    const dotParentDivElement = dotParentDiv as HTMLElement | null

    // const paddingL = dotParentDivElement?.style.paddingLeft ? parsePxToNumber(dotParentDivElement?.style.paddingLeft) : 0
    // const prefix = paddingL ? generateSpaces(paddingL) : ''

    if (dotSymbol && parentElement) {
      const nextElement = dotParentDiv.nextElementSibling
      const nextPElement = nextElement && (nextElement.firstChild as HTMLElement)
      if (nextElement && nextPElement && (nextPElement.nodeType === Node.ELEMENT_NODE) && nextPElement.tagName === 'P') {
        const spanChild = nextElement.querySelector('sapn')
        if (spanChild) {
          const newSpan = document.createElement('sapn')
          newSpan.innerHTML = dotSymbol.innerText
          newSpan.style.fontSize = dotParentDivElement?.style.fontSize ? dotParentDivElement?.style.fontSize : '0px'
          newSpan.style.color = dotParentDivElement?.style.color ? dotParentDivElement?.style.color : '#000'
          newSpan.style.paddingLeft = dotParentDivElement?.style.paddingLeft ? dotParentDivElement?.style.paddingLeft : '0px'
          spanChild.innerHTML = '&nbsp;' + spanChild.innerHTML
          nextPElement.insertBefore(newSpan, spanChild)
          const pMarginTop = parsePxToNumber(nextPElement.style.marginTop)
          if (containsNumberBullet && pMarginTop === 0 ) {
            nextPElement.style.marginTop = '6px'
          }
          else if (pMarginTop) {
            nextPElement.style.marginTop = pMarginTop / 2 + 'px'
          }
        }
      }

      parentElement.removeChild(dotParentDiv)
      // dotSymbol.innerHTML = '&nbsp;'
      // if (dotParentDivElement) {
      //   dotParentDivElement.style.fontFamily = ''
      //   if (outerDivElement) {
      //     const outerHeight = parsePxToNumber(outerDivElement.style.height)
      //     if (outerHeight && outerHeight <= 30) {
      //       dotParentDivElement.style.fontSize = '0px'
      //     }
      //   }
      // } 
    }
  })

  return doc.body.innerHTML
}

export const adjustNumberBulletHtmlString = (html: string): string => {
  // const [contains, foundString] = containsUnicode(html)
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const dotSymbols = doc.querySelectorAll('.numeric-bullet-style')

  dotSymbols.forEach(dotSymbol => {
    const parentElement = dotSymbol.parentNode as HTMLElement | null

    const dotDivElement = dotSymbol as HTMLElement | null

    // const paddingL = dotDivElement?.style.paddingLeft ? parsePxToNumber(dotDivElement?.style.paddingLeft) : 0
    // const prefix = paddingL ? generateSpaces(paddingL) : ''

    if (dotSymbol && parentElement && dotDivElement) {
      const nextElement = dotSymbol.nextElementSibling
      const nextPElement = nextElement && (nextElement.firstChild as HTMLElement)
      if (nextElement && nextPElement && (nextPElement.nodeType === Node.ELEMENT_NODE) && nextPElement.tagName === 'P') {
        const spanChild = nextElement.querySelector('sapn')
        if (spanChild) {
          const newSpan = document.createElement('sapn')
          newSpan.innerHTML = dotDivElement.innerText.replace(/\s+/g, '')
          newSpan.style.fontSize = dotDivElement.style.fontSize ? dotDivElement.style.fontSize : '0px'
          newSpan.style.color = dotDivElement.style.color ? dotDivElement.style.color : '#000'
          newSpan.style.paddingLeft = dotDivElement.style.paddingLeft
          spanChild.innerHTML = '&nbsp;' + spanChild.innerHTML
          nextPElement.insertBefore(newSpan, spanChild)
          const pMarginTop = parsePxToNumber(nextPElement.style.marginTop)
          if (pMarginTop) {
            nextPElement.style.marginTop = pMarginTop / 2 + 'px'
          }
          else {
            nextPElement.style.marginTop = '3px'
          }
        }
      }
      parentElement.removeChild(dotSymbol)
      // dotSymbol.innerHTML = '&nbsp;'
      // if (dotParentDivElement) {
      //   dotParentDivElement.style.fontFamily = ''
      //   if (outerDivElement) {
      //     const outerHeight = parsePxToNumber(outerDivElement.style.height)
      //     if (outerHeight && outerHeight <= 30) {
      //       dotParentDivElement.style.fontSize = '0px'
      //     }
      //   }
      // } 
    }
  })

  return doc.body.innerHTML
}

export const adjustBulletSpacing = (html: string): string => {

  const onlyBulletPattern = html.includes(UNICODE_PATTERN) && !html.includes(NUMBER_PATTERN)
  const containsUnicodeAndNumber = html.includes(UNICODE_PATTERN) && html.includes(NUMBER_PATTERN)

  if (containsUnicodeAndNumber) {
    html = pptistTextFontSizeReduce(html, 1)
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const outerDiv = doc.querySelector('.block')
  const outerDivElement = outerDiv as HTMLElement | null
  

  if (outerDivElement) {
    const paragraphs = outerDivElement.querySelectorAll('p')
    const emptyP = Array.from(paragraphs).filter(p => p.textContent?.trim() === '')
    emptyP.forEach(p => {
      const pHtml = p as HTMLElement
      if (pHtml) {
        // const pMarginTop = parsePxToNumber(pHtml.style.marginTop)
        // if (pMarginTop) {
        //   pHtml.style.marginTop = pMarginTop / 2 + 'px'
        // }
        if (onlyBulletPattern) {
          pHtml.style.marginTop = '0px'
        }
        
        const emptySpan = pHtml.firstChild as HTMLElement
        if (emptySpan) {
          const size = parsePxToNumber(emptySpan.style.fontSize)
          if (size) {
            if (onlyBulletPattern) {
              emptySpan.style.fontSize = size / 2 + 'px'
            }
          }
        }
      }
    })
  }
  return doc.body.innerHTML
}

function generateSpaces(pxValue: number): string {

  if (pxValue <= 0) return ''

  const spaceWidth = 4

  let spaceCount = Math.floor(pxValue / spaceWidth)
  if (pxValue % spaceWidth > 0) {
    spaceCount += 1
  }
  return '&nbsp;'.repeat(spaceCount)
}

export const adjustTableCellText = (cell: PPTistTableCell, colWFactor: number, rowHFactor: number): string | undefined => {
  const rowHeight = cell.rowHeight * rowHFactor
  const colWidth = cell.colWidth * colWFactor
  // const color = cell.fontClrPr ? `color: ${cell.fontClrPr};` : ''
  // const fontWeight = cell.fontWeight ? `font-weight: ${cell.fontWeight};` : ''
  let text = cell.text
  if (text.length > 0) {
    if (!cell.isVert && colWidth > 10) {
      text = text.replace(/width:\s*[^;]+;/g, `width: ${colWidth}px;`)
    }
    const spanRegex = /<sapn\b[^>]*>.*?<\/sapn>/g
    const matchSpan = text.match(spanRegex)
    if (matchSpan && matchSpan.length === 1) {
      const spanStyleRegex = /<sapn([^>]*)style=['"]([^'"]*)['"]([^>]*)>/
      const match = text.match(spanStyleRegex)
      if (match) {
        const spanAttrs = match[1]
        const styleAttrs = match[2]
        const remainingAttrs = match[3]
        if (!styleAttrs.includes('color') && cell.fontClrPr && cell.fontClrPr.length > 0) {
          const newStyleAttrs = `${styleAttrs};color:${cell.fontClrPr}`
          const newSpanTag = `<span${spanAttrs}style='${newStyleAttrs}'${remainingAttrs}>`
          text = text.replace(match[0], newSpanTag)
        }
        if (!styleAttrs.includes('font-weight') && cell.fontWeight && cell.fontWeight.length > 0) {
          const newStyleAttrs = `${styleAttrs};font-weight:${cell.fontWeight}`
          const newSpanTag = `<span${spanAttrs}style='${newStyleAttrs}'${remainingAttrs}>`
          text = text.replace(match[0], newSpanTag)
        }
      }
    }
    else if (matchSpan && matchSpan.length > 1) {
      let allSpansWithoutColor = true
      let allSpansWithoutFontWeight = true
      for (const span of matchSpan) {
        const styleMatch = span.match(/style=['"](.*?)['"]/)
        if (styleMatch) {
          const styleAttrs = styleMatch[1]
          if (styleAttrs.includes('color')) {
            allSpansWithoutColor = false
          }
          if (styleAttrs.includes('font-weight')) {
            allSpansWithoutFontWeight = false
          }
        }
        else {
          allSpansWithoutColor = false
          allSpansWithoutFontWeight = false
        }
      }
      // Add color to all <span> tags if none of them have it
      if (allSpansWithoutColor && cell.fontClrPr && cell.fontClrPr.length > 0) {
        matchSpan.forEach(span => {
          const newSpan = span.replace(/(style=['"])(.*?)['"]/,
            `$1$2;color:${cell.fontClrPr};'`)
          text = text.replace(span, newSpan)
        })
      }
      // Add font-weight to all <span> tags if none of them have it
      if (allSpansWithoutFontWeight && cell.fontWeight && cell.fontWeight.length > 0) {
        matchSpan.forEach(span => {
          const newSpan = span.replace(/(style=['"])(.*?)['"]/,
            `$1$2;font-weight:${cell.fontWeight};'`)
          text = text.replace(span, newSpan)
        })
      }
    }
    return pptistTBTextFontSize(text)
  }
  return undefined
}


export const removeDuplicateTextElements = (slide: Slide): void => {

  const textElements = slide.elements.filter(element => element.type === 'text')

  const nameToLastIndexMap = new Map<string, number>()
  textElements.forEach((element, index) => {
    if (element.name) {
      nameToLastIndexMap.set(element.name, index)
    }
  })
  
  const uniqueTextElements = textElements.filter((element, index) => {
    if (element.name) {
      return nameToLastIndexMap.get(element.name) === index
    }
    return true
  })

  slide.elements = slide.elements.filter(element => element.type !== 'text').concat(uniqueTextElements)
}