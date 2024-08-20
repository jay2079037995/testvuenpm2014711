import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { parse, type Element, type ChartItem } from '@pagepeek/pptx-to-json'
import { nanoid } from 'nanoid'
import { useSlidesStore } from '@/store'
import { decrypt } from '@/utils/crypto'
import { type ShapePoolItem, SHAPE_LIST, SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import { VIEWPORT_SIZE } from '@/configs/canvas'
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements'
import message from '@/utils/message'
import pptxGenerateJson from '@pagepeek/pptx-generate-json'
import type {
  Slide, TableCellStyle, TableCell, ChartType, ChartOptions, SlideBackground, PPTShapeElement, ShapeTextAlign, PPTTextElement,
  ShapeText,
  PPTElementOutline,
} from '@/types/slides'

import type { PPTist, PPTistElement, PPTistFill, PPTistJson, PPTistSize, PPTistBGFill } from '@/types/slidesPPTist'
import { pptistRgbToString, pptistSubStrToColor, pptistToGradient, pptx2jsonOptions } from '@/utils/other/pptistUtils'
import { findSvgPath } from '@/utils/other/imageUtils'
import { parseLineElementOfPPtist } from './useImportUtils'
import i18n from '@/assets/locales/index'

export default () => {
  const slidesStore = useSlidesStore()
  const { theme } = storeToRefs(useSlidesStore())

  const { addSlidesFromData, isEmptySlide } = useAddSlidesOrElements()

  const exportingTest = ref(false)

  // 导入GenerativePPT文件
  const importSpecificFile = (files: FileList, cover = false) => {
    const file = files[0]

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      try {
        const slides = JSON.parse(decrypt(reader.result as string))
        if (cover) slidesStore.setSlides(slides)
        else if (isEmptySlide.value) slidesStore.setSlides(slides)
        else addSlidesFromData(slides)
      }
      catch (e: unknown) {
        const errorMsg = i18n.global.t('toast.importParseFail') + (e as Error)?.message
        message.error(errorMsg)
      }
    })
    reader.readAsText(file)
  }

  // 导入PPTX文件Generate
  const importPPTXFileGenerate = (files: FileList) => {
    const file = files[0]

    if (!file) return

    exportingTest.value = true
    const shapeList: ShapePoolItem[] = []
    for (const item of SHAPE_LIST) {
      shapeList.push(...item.children)
    }
      
    const reader = new FileReader()
    reader.addEventListener('load', async () => {
      if (reader?.result) {

        let json: unknown = null
        try {
          json = await pptxGenerateJson(reader.result)
          // json = await pptistImportPptx(reader.result)
        } 
        catch (e: unknown) {
          const errorMsg = i18n.global.t('toast.importParseFail') + (e as Error)?.message
          message.error(errorMsg)
        }
        // const jsonStr = JSON.stringify(json, filterField, 2)
        // console.log(jsonStr)
        // const contents = JSON.parse(jsonStr)
        const pptists: PPTist[] = (json === null || json === undefined) ? [] : JSON.parse(JSON.stringify(json))

        let scale = 1.0
        const slides: Slide[] = []

        for (const pptist of pptists) {
          if (null !== pptist.type && pptist.type === 'slideSize') {
            if (null !== pptist.data && typeof pptist.data === 'object') {
              const size: PPTistSize = JSON.parse(JSON.stringify(pptist.data))
              const width = size.width
              scale = VIEWPORT_SIZE / width
            }
          }
          else if (null !== pptist.type && pptist.type === 'slide') {
            console.log('content 类型解析成功 file_name:%s', pptist.file_name)
            const pptistJson: PPTistJson = pptist.json
            const width = pptistJson.width
            scale = VIEWPORT_SIZE / width

            const pptistFill = pptistJson.fill
            if (null !== pptistFill && typeof pptistFill === 'string') {
              const fill: PPTistFill = {type: 'background', color: pptistFill}
              pptistJson.bgFill = [fill]
            } 
            else if (null !== pptistFill) {
              if (Array.isArray(pptistFill)) {
                const fills: PPTistFill[] = JSON.parse(JSON.stringify(pptistFill))
                pptistJson.bgFill = fills
              }
              else {
                const fill: PPTistBGFill = JSON.parse(JSON.stringify(pptistFill))
                console.log('content 类型解析成功 fill:%s', fill.color)
                pptistJson.bgFill = [fill]
              }
            }

            let background: SlideBackground | undefined = undefined
            if (pptistJson.bgFill) {
              for (const fill of pptistJson.bgFill) {
                switch (fill.type) {
                  case 'image':
                    background = {
                      type: 'image',
                      image: fill.src && fill.src.length > 22 ? fill.src.substring(22) : fill.src,
                      imageSize: 'cover',
                    }
                    break
                  case 'text':

                    break
                  case 'shape':

                    break
                  case 'group':

                    break
                  default:
                    background = {
                      type: 'solid',
                      color: pptistSubStrToColor(fill.color),
                    }
                    break
                }
              }
            }

            const slide: Slide = {
              id: nanoid(10),
              elements: [],
              background,
              remark: pptist.file_name,
            }

            const elements = pptistJson.elements
            const parseElements = (elements: PPTistElement[]) => {
              for (const el of elements) {
                const originWidth = el.width || 1
                const originHeight = el.height || 1
                const originLeft = el.left
                const originTop = el.top

                el.width = el.width * scale
                el.height = el.height * scale
                el.left = el.left * scale
                el.top = el.top * scale
                if (el.type === 'text' && el.content !== null) {
                  const gradient = pptistToGradient(el.fillColor)
                  const fillColor = gradient ? gradient.color[0] : pptistRgbToString(el.fillColor)

                  const textEl: PPTTextElement = {
                    type: 'text',
                    id: nanoid(10),
                    width: el.width,
                    height: el.height,
                    left: el.left,
                    top: el.top,
                    rotate: el.rotate,
                    defaultFontName: theme.value.fontName,
                    defaultColor: theme.value.fontColor,
                    content: el.content!,
                    gradient: gradient,
                    fill: fillColor
                  }
                  slide.elements.push(textEl)
                }
                else if (el.type === 'image') {
                  slide.elements.push({
                    type: 'image',
                    id: nanoid(10),
                    src: el.src,
                    width: el.width,
                    height: el.height,
                    left: el.left,
                    top: el.top,
                    fixedRatio: true,
                    rotate: el.rotate,
                    // flipH: el.isFlipH,
                    // flipV: el.isFlipV,    
                  })
                }
                else if (el.type === 'audio') {
                  slide.elements.push({
                    type: 'audio',
                    id: nanoid(10),
                    src: el.src,
                    width: el.width,
                    height: el.height,
                    left: el.left,
                    top: el.top,
                    rotate: 0,
                    fixedRatio: false,
                    color: theme.value.themeColor,
                    loop: false,
                    autoplay: false,
                  })
                }
                else if (el.type === 'video') {
                  slide.elements.push({
                    type: 'video',
                    id: nanoid(10),
                    src: (el.src)!,
                    width: el.width,
                    height: el.height,
                    left: el.left,
                    top: el.top,
                    rotate: 0,
                    autoplay: false,
                  })
                }
                // else if (el.type === 'shape') {
                //   if (el.shapType === 'line' || /Connector/.test(el.)) {
                //     const lineElement = parseLineElement(el)
                //     slide.elements.push(lineElement)
                //   }
                //   else {
                //     const shape = shapeList.find(item => item.pptxShapeType === el.shapType)
    
                //     const vAlignMap: { [key: string]: ShapeTextAlign } = {
                //       'mid': 'middle',
                //       'down': 'bottom',
                //       'up': 'top',
                //     }
                    
                //     const element: PPTShapeElement = {
                //       type: 'shape',
                //       id: nanoid(10),
                //       width: el.width,
                //       height: el.height,
                //       left: el.left,
                //       top: el.top,
                //       viewBox: [200, 200],
                //       path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
                //       fill: el.fillColor || 'none',
                //       fixedRatio: false,
                //       rotate: el.rotate,
                //       outline: {
                //         color: el.borderColor,
                //         width: el.borderWidth,
                //         style: el.borderType === 'solid' ? 'solid' : 'dashed',
                //       },
                //       text: {
                //         content: el.content,
                //         defaultFontName: theme.value.fontName,
                //         defaultColor: theme.value.fontColor,
                //         align: vAlignMap[el.vAlign] || 'middle',
                //       },
                //       flipH: el.isFlipH,
                //       flipV: el.isFlipV,
                //     }
                //     if (el.shadow) element.shadow = el.shadow
        
                //     if (shape) {
                //       element.path = shape.path
                //       element.viewBox = shape.viewBox
        
                //       if (shape.pathFormula) {
                //         element.pathFormula = shape.pathFormula
                //         element.viewBox = [el.width, el.height]
        
                //         const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula]
                //         if ('editable' in pathFormula) {
                //           element.path = pathFormula.formula(el.width, el.height, pathFormula.defaultValue)
                //           element.keypoint = pathFormula.defaultValue
                //         }
                //         else element.path = pathFormula.formula(el.width, el.height)
                //       }
                //     }
                //     if (el.shapType === 'custom') {
                //       element.special = true
                //       element.path = el.path!
                //     //element.viewBox = [el.width, el.height]
                //       element.viewBox = [originWidth, originHeight]
                //     }
                //     slide.elements.push(element)
                //   }
                // }
                else if (el.type === 'shape') {
                  const text: ShapeText = {
                    content: el.content || 'none',
                    align: 'middle',
                    defaultFontName: theme.value.fontName,
                    defaultColor: theme.value.fontColor,
                    // align: vAlignMap[el.vAlign] || 'middle',
                  }
                  let elPath = findSvgPath(el.svg)
                  if (!elPath || elPath === '' || elPath === 'none' || elPath === undefined) {
                    elPath = 'M 0 0 L 200 0 L 200 200 L 0 200 Z'
                  }

                  let fillColor
                  const gradient = pptistToGradient(el.fillColor)
                  if (gradient) {
                    fillColor = gradient.color[0]
                  }
                  else {
                    fillColor = pptistRgbToString(el.fillColor)
                  }
                  const shapeEl: PPTShapeElement = {
                    type: 'shape',
                    id: nanoid(10),
                    width: el.width,
                    height: el.height,
                    left: el.left,
                    top: el.top,
                    rotate: el.rotate,
                    fill: fillColor || 'none',
                    gradient: gradient,
                    path: elPath,
                    viewBox: [200, 200],
                    text: text,
                    fixedRatio: false
                  }
                  slide.elements.push(shapeEl)
                }
                // else if (el.type === 'table') {
                //   const row = el.data.length
                //   const col = el.data[0].length
      
                //   const style: TableCellStyle = {
                //     fontname: theme.value.fontName,
                //     color: theme.value.fontColor,
                //   }
                //   const data: TableCell[][] = []
                //   for (let i = 0; i < row; i++) {
                //     const rowCells: TableCell[] = []
                //     for (let j = 0; j < col; j++) {
                //       const cellData = el.data[i][j]
                //       rowCells.push({
                //         id: nanoid(10),
                //         colspan: cellData.colSpan || 1,
                //         rowspan: cellData.rowSpan || 1,
                //         text: cellData.text,
                //         style,
                //       })
                //     }
                //     data.push(rowCells)
                //   }
      
                //   const colWidths: number[] = new Array(col).fill(1 / col)
      
                //   slide.elements.push({
                //     type: 'table',
                //     id: nanoid(10),
                //     width: el.width,
                //     height: el.height,
                //     left: el.left,
                //     top: el.top,
                //     colWidths,
                //     rotate: 0,
                //     data,
                //     outline: {
                //       width: 2,
                //       style: 'solid',
                //       color: '#eeece1',
                //     },
                //     theme: {
                //       color: el.themeColor,
                //       rowHeader: true,
                //       rowFooter: false,
                //       colHeader: false,
                //       colFooter: false,
                //     },
                //     cellMinHeight: 36,
                //   })
                // }
                // else if (el.type === 'chart') {
                //   let labels: string[]
                //   let legends: string[]
                //   let series: number[][]
      
                //   // if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') {
                //   //   const data = el.data
                //   //   labels = data[0].map(item => item + '')
                //   //   legends = ['系列1']
                //   //   series = [data[1]]
                //   // }
                //   // else {
                //   //   const data = el.data as ChartItem[]
                //   //   labels = Object.values(data[0].xlabels)
                //   //   legends = data.map(item => item.key)
                //   //   series = data.map(item => item.values.map(v => v.y))
                //   // }
      
                //   const options: ChartOptions = {}
      
                //   const chartType: ChartType = 'bar'
                //   // let chartType: ChartType = 'bar'
                //   // switch (el.chartType) {
                //   //   case 'barChart':
                //   //   case 'bar3DChart':
                //   //     chartType = 'bar'
                //   //     if (el.barDir === 'bar') options.horizontalBars = true
                //   //     if (el.grouping === 'stacked' || el.grouping === 'percentStacked') options.stackBars = true
                //   //     break
                //   //   case 'lineChart':
                //   //   case 'line3DChart':
                //   //   case 'areaChart':
                //   //   case 'area3DChart':
                //   //   case 'scatterChart':
                //   //   case 'bubbleChart':
                //   //     chartType = 'line'
                //   //     if (el.chartType === 'areaChart' || el.chartType === 'area3DChart') options.showArea = true
                //   //     if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') options.showLine = false
                //   //     break
                //   //   case 'pieChart':
                //   //   case 'pie3DChart':
                //   //   case 'doughnutChart':
                //   //     chartType = 'pie'
                //   //     if (el.chartType === 'doughnutChart') options.donut = true
                //   //     break
                //   //   default:
                //   // }
      
                //   slide.elements.push({
                //     type: 'chart',
                //     id: nanoid(10),
                //     chartType: chartType,
                //     width: el.width,
                //     height: el.height,
                //     left: el.left,
                //     top: el.top,
                //     rotate: 0,
                //     themeColor: [theme.value.themeColor],
                //     gridColor: theme.value.fontColor,
                //     data: {
                //       labels,
                //       legends,
                //       series,
                //     },
                //     options,
                //   })
                // }
                else if (el.type === 'group') {
                  const elements = el.elements.map(_el => ({
                    ..._el,
                    // left: _el.left + el.left,
                    // top: _el.top + el.top,
                    left: _el.left + originLeft,
                    top: _el.top + originTop,
                  }))
                  parseElements(elements)
                }
                else {
                  console.log('content 类型解析成功 1 type:%o', pptist)
                }
              }
            }
            parseElements(elements)
            slides.push(slide)
          } 
          else {
            console.log('content 类型解析成功 0 type:%o', pptist)
          }
        }
        if (isEmptySlide.value) slidesStore.setSlides(slides)
        else addSlidesFromData(slides)
      }
      exportingTest.value = false
    })
    reader.readAsArrayBuffer(file)
  }

  // 导入json文件（测试）
  const importJSONFile = (files: FileList) => {

    const file = files[0]
    if (!file) return

    exportingTest.value = true

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        try {
          const json = JSON.parse(e.target.result)
          handleImportedJSON(json, file)
          exportingTest.value = false
        } 
        catch (err) {
          message.error('json文件格式不对')
          console.error('Error parsing JSON file:', err)
          exportingTest.value = false
        }
      }
    }

    reader.readAsText(file)


  }

  function handleImportedJSON(json: any, file: File) {

    if (json && Array.isArray(json.slides)) {

      const slides = json.slides

      slidesStore.setSlides(slides)

      slidesStore.setTitle(file.name.replace(/\.[^/.]+$/, ''))

    } 
    else {
      message.error('json文件格式不对')
      console.error("Invalid JSON structure: 'slides' is not an array")
    }
  }

  // 导入PPTX文件（测试）
  const importPPTXFile = (files: FileList) => {
    const file = files[0]
    if (!file) return

    exportingTest.value = true

    const shapeList: ShapePoolItem[] = []
    for (const item of SHAPE_LIST) {
      shapeList.push(...item.children)
    }
    
    const reader = new FileReader()
    reader.onload = async e => {
      const json = await parse(e.target!.result as ArrayBuffer, pptx2jsonOptions)

      const width = json.size.width
      const scale = VIEWPORT_SIZE / width
      const slides: Slide[] = []

      for (const item of json.slides) {
        const { type, value } = item.fill
        console.log('importPPTXFile index:%d, value::%o', type, value)
        let background: SlideBackground
        if (type === 'image') {
          background = {
            type: 'image',
            image: value.picBase64,
            imageSize: 'cover',
          }
        }
        else if (type === 'gradient') {
          background = {
            type: 'gradient',
            gradientType: 'linear',
            gradientColor: [value.colors[0].color, value.colors[value.colors.length - 1].color],
            gradientRotate: value.rot,
          }
        }
        else {
          background = {
            type: 'solid',
            color: value,
          }
        }

        const slide: Slide = {
          id: nanoid(10),
          elements: [],
          background,
        }

        const parseElements = (elements: Element[]) => {
          for (const el of elements) {
            const originWidth = el.width
            const originHeight = el.height
            const originLeft = el.left
            const originTop = el.top

            el.width = el.width * scale
            el.height = el.height * scale
            el.left = el.left * scale
            el.top = el.top * scale
            console.log('importPPTXFile type:%s, element::%o', el.type, el)
            if (el.type === 'text') {
              let outline: PPTElementOutline | undefined = undefined
              if (el.borderWidth > 0 && el.borderColor && el.borderColor !== '#000') {
                outline = {
                  color: el.borderColor,
                  width: el.borderWidth,
                  style: el.borderType === 'solid' ? 'solid' : 'dashed',
                }
              }
              const textEl: PPTTextElement = {
                type: 'text',
                id: nanoid(10),
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                rotate: el.rotate,
                defaultFontName: theme.value.fontName,
                defaultColor: theme.value.fontColor,
                content: el.content,
                lineHeight: 1,
                outline: outline,
                fill: el.fillColor,
                vertical: el.isVertical,
              }
              if (el.shadow) textEl.shadow = el.shadow
              slide.elements.push(textEl)
            }
            else if (el.type === 'image') {
              slide.elements.push({
                type: 'image',
                id: nanoid(10),
                src: el.src,
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                fixedRatio: true,
                rotate: el.rotate,
                flipH: el.isFlipH,
                flipV: el.isFlipV,
              })
            }
            else if (el.type === 'audio') {
              slide.elements.push({
                type: 'audio',
                id: nanoid(10),
                src: el.blob,
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                rotate: 0,
                fixedRatio: false,
                color: theme.value.themeColor,
                loop: false,
                autoplay: false,
              })
            }
            else if (el.type === 'video') {
              slide.elements.push({
                type: 'video',
                id: nanoid(10),
                src: (el.blob || el.src)!,
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                rotate: 0,
                autoplay: false,
              })
            }
            else if (el.type === 'shape') {
              if (el.shapType === 'line' || /Connector/.test(el.shapType)) {
                const lineElement = parseLineElementOfPPtist(el)
                slide.elements.push(lineElement)
              }
              else {
                const shape = shapeList.find(item => item.pptxShapeType === el.shapType)

                const vAlignMap: { [key: string]: ShapeTextAlign } = {
                  'mid': 'middle',
                  'down': 'bottom',
                  'up': 'top',
                }
                
                let outline: PPTElementOutline | undefined = undefined
                if (el.borderWidth > 0 && el.borderColor && el.borderColor !== '#000') {
                  outline = {
                    color: el.borderColor,
                    width: el.borderWidth,
                    style: el.borderType === 'solid' ? 'solid' : 'dashed',
                  }
                } 
                const element: PPTShapeElement = {
                  type: 'shape',
                  id: nanoid(10),
                  width: el.width,
                  height: el.height,
                  left: el.left,
                  top: el.top,
                  viewBox: [200, 200],
                  path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
                  fill: el.fillColor || 'none',
                  fixedRatio: false,
                  rotate: el.rotate,
                  outline: outline,
                  text: {
                    content: el.content,
                    defaultFontName: theme.value.fontName,
                    defaultColor: theme.value.fontColor,
                    align: vAlignMap[el.vAlign] || 'middle',
                  },
                  flipH: el.isFlipH,
                  flipV: el.isFlipV,
                }
                if (el.shadow) element.shadow = el.shadow
    
                if (shape) {
                  element.path = shape.path
                  element.viewBox = shape.viewBox
    
                  if (shape.pathFormula) {
                    element.pathFormula = shape.pathFormula
                    element.viewBox = [el.width, el.height]
    
                    const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula]
                    if ('editable' in pathFormula) {
                      element.path = pathFormula.formula(el.width, el.height, pathFormula.defaultValue)
                      element.keypoint = pathFormula.defaultValue
                    }
                    else element.path = pathFormula.formula(el.width, el.height)
                  }
                }
                if (el.shapType === 'custom') {
                  element.special = true
                  element.path = el.path!
                  // element.viewBox = [el.width, el.height]
                  element.viewBox = [originWidth, originHeight]
                }
    
                slide.elements.push(element)
              }
            }
            else if (el.type === 'table') {
              const row = el.data.length
              const col = el.data[0].length
  
              const style: TableCellStyle = {
                fontname: theme.value.fontName,
                color: theme.value.fontColor,
              }
              const data: TableCell[][] = []
              for (let i = 0; i < row; i++) {
                const rowCells: TableCell[] = []
                for (let j = 0; j < col; j++) {
                  const cellData = el.data[i][j]

                  let textDiv: HTMLDivElement | null = document.createElement('div')
                  textDiv.innerHTML = cellData.text
                  const p = textDiv.querySelector('p')
                  const align = p?.style.textAlign || 'left'
                  const fontsize = p?.style.fontSize || ''
                  const fontname = p?.style.fontFamily || ''

                  rowCells.push({
                    id: nanoid(10),
                    colspan: cellData.colSpan || 1,
                    rowspan: cellData.rowSpan || 1,
                    // text: cellData.text,
                    // style,
                    text: textDiv.innerText,
                    style: {
                      ...style,
                      align: ['left', 'right', 'center'].includes(align) ? (align as 'left' | 'right' | 'center') : 'left',
                      fontsize,
                      fontname,
                    },
                  })
                  textDiv = null
                }
                data.push(rowCells)
              }
  
              const colWidths: number[] = new Array(col).fill(1 / col)
  
              slide.elements.push({
                type: 'table',
                id: nanoid(10),
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                colWidths,
                rotate: 0,
                data,
                outline: {
                  width: 2,
                  style: 'solid',
                  color: '#eeece1',
                },
                theme: {
                  color: el.themeColor,
                  rowHeader: true,
                  rowFooter: false,
                  colHeader: false,
                  colFooter: false,
                },
                cellMinHeight: 36,
              })
            }
            else if (el.type === 'chart') {
              let labels: string[]
              let legends: string[]
              let series: number[][]
  
              if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') {
                const data = el.data
                labels = data[0].map(item => item + '')
                legends = ['系列1']
                series = [data[1]]
              }
              else {
                const data = el.data as ChartItem[]
                labels = Object.values(data[0].xlabels)
                legends = data.map(item => item.key)
                series = data.map(item => item.values.map(v => v.y))
              }
  
              const options: ChartOptions = {}
  
              let chartType: ChartType = 'bar'

              switch (el.chartType) {
                case 'barChart':
                case 'bar3DChart':
                  chartType = 'bar'
                  if (el.barDir === 'bar') options.horizontalBars = true
                  if (el.grouping === 'stacked' || el.grouping === 'percentStacked') options.stackBars = true
                  break
                case 'lineChart':
                case 'line3DChart':
                case 'areaChart':
                case 'area3DChart':
                case 'scatterChart':
                case 'bubbleChart':
                  chartType = 'line'
                  if (el.chartType === 'areaChart' || el.chartType === 'area3DChart') options.showArea = true
                  if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') options.showLine = false
                  break
                case 'pieChart':
                case 'pie3DChart':
                case 'doughnutChart':
                  chartType = 'pie'
                  if (el.chartType === 'doughnutChart') options.donut = true
                  break
                default:
              }
  
              slide.elements.push({
                type: 'chart',
                id: nanoid(10),
                chartType: chartType,
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                rotate: 0,
                themeColor: [theme.value.themeColor],
                gridColor: theme.value.fontColor,
                data: {
                  labels,
                  legends,
                  series,
                },
                options,
              })
            }
            else if (el.type === 'group' || el.type === 'diagram') {
              const elements = el.elements.map(_el => ({
                ..._el,
                // left: _el.left + el.left,
                // top: _el.top + el.top,
                left: _el.left + originLeft,
                top: _el.top + originTop,
              }))
              parseElements(elements)
            }
          }
        }
        parseElements(item.elements)
        slides.push(slide)
      }
      if (isEmptySlide.value) slidesStore.setSlides(slides)
      else addSlidesFromData(slides)
      exportingTest.value = false
    }
    reader.readAsArrayBuffer(file)
  }

  return {
    importSpecificFile,
    importPPTXFileGenerate,
    importPPTXFile,
    importJSONFile,
    exportingTest,
  }
}