import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { parse, type Element, type ChartItem } from '@pagepeek/pptx-to-json'
import { useSlidesStore } from '@/store'
import { type ShapePoolItem, SHAPE_LIST, SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import { VIEWPORT_SIZE } from '@/configs/canvas'
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements'
import message from '@/utils/message'
import pptxGenerateJson from '@pagepeek/pptx-generate-json'
import type {Slide, TableCellStyle, TableCell, ChartType, ChartOptions, SlideBackground, PPTShapeElement, ShapeTextAlign, PPTTextElement,
  PPTElementOutline, ShapeGradient, PPTImageElement, PPTElement, PPTElementShadow} from '@/types/slides'
import type { PPTist, PPTistElement, PPTistFill, PPTistSize, PPTistBGFill, PPTXElementExpand, PPTistImageElement, PPTistTextElement, PPTistShapeElement, PPTistChartItem, PPTistTableElement } from '@/types/slidesPPTist'
import { extractSVGStyleProperties, calculateTextTypeWidth, pptistRgbToString, pptistSVGVaildStroke, extractTableCellBgColors, 
  pptistSVGSubStroke, pptistSubStrToColor, pptistTableBorder, pptistToGradient, extractFontAndThemeColors, assignElementId, 
  getFilterValidColor, getFilterValidColors, parseBackgroundImage, extractStylesFromDiv, scaling_factor, isPptistSizeValid,
  pptx2jsonOptions, pptistTextFontSize, isElementValidLT, isElementValidWH, calculateEffectiveSize, transformTextToUppercase, 
  shapeSVGSpecifiedSizeWH, extractTextShadowColor, isSpecialUlHTML, hasVisibleTextContent, isValidELSvgPath, isPptistElementValid,
  pptistShapeFillImage, isSpecialShapeType, calculateColWidthProportion, recalculateBorderWidth, createAddtionalSlide, replaceIndexSlide,
  isNumberString, isMustShapeType } from '@/utils/other/pptistUtils'
import { findSvgPath } from '@/utils/other/imageUtils'
import { parseLineElementOfPPtist, parseFillImage, parsePptistFillElement, lineConnectorLocation, parsePyramidElements, 
  elementReassign, parseImageShapeStyle, adjustDotHtmlString, assemblingSpecialElement, adjustTableCellText, adjustNumberBulletHtmlString, adjustBulletSpacing } from './useImportUtils'
import i18n from '@/assets/locales/index'
import { getRandomHexColorWithOpacity, extractBackgroundColors } from '@/utils/other/colorUtils'
import { NUMBER_PATTERN, UNICODE_PATTERN } from '@/utils/other/unicode'

export default () => {
  const slidesStore = useSlidesStore()
  const { theme } = storeToRefs(useSlidesStore())

  const { addSlidesFromData, isEmptySlide } = useAddSlidesOrElements()

  const exporting = ref(false)

  // 导入pptx结合
  const importPPTXFileFusion = (files: FileList) => {
    const file = files[0]
    if (!file) return

    exporting.value = true

    const shapeList: ShapePoolItem[] = []
    for (const item of SHAPE_LIST) {
      shapeList.push(...item.children)
    }
    
    const reader = new FileReader()
    reader.onload = async e => {
      const result = e.target!.result
      if (result) {
        const json = await parse(result as ArrayBuffer, pptx2jsonOptions)

        let pptistJson 
        try {
          // pptistJson = await pptistImportPptx(result)
          pptistJson = await pptxGenerateJson(result)
          console.log('content pptxGenerateJson json:%o', pptistJson)
        } 
        catch (e: unknown) {
          const errorMsg = i18n.global.t('toast.importParseFail') + (e as Error)?.message
          message.error(errorMsg)
          console.error('importPPTXFile pptistJson error:%s, :%o', (e as Error)?.message, (e as Error)?.stack)
        }

        const pptists: PPTist[] = (null === pptistJson || pptistJson === undefined) ? [] : JSON.parse(JSON.stringify(pptistJson))
        const pptistSlides = pptists.filter(pptist => pptist.type === 'slide')
        const slideSizes = pptists.filter(pptist => pptist.type === 'slideSize')
        const globalCSS = pptists.filter(pptist => pptist.type === 'globalCSS')
        
        let slideSize: PPTistSize = {
          width: json.size.width,
          height: json.size.height
        }

        let pptistScale = 1.0
        let viewPortRatio = 0.5625
        if (slideSizes && slideSizes.length > 0) {
          slideSize = JSON.parse(JSON.stringify(slideSizes[0].data))
          pptistScale = VIEWPORT_SIZE / slideSize.width
          viewPortRatio = slideSize.height / slideSize.width
        }
        const scale = VIEWPORT_SIZE / json.size.width

        const isSamePPT = json.slides.length === pptistSlides.length
        // console.log('content importPPTXFileFusion json:%o, fontName: %s, fontColor:%s', json, theme.value.fontName, theme.value.fontColor)
        
        const globalCSSData = globalCSS.length > 0 ? globalCSS[0].data : undefined
        const {fontColors, themeColors} = extractFontAndThemeColors(globalCSSData)
        let indexSlide = 0
        const slides: Slide[] = []
        for (const item of json.slides) {
          let pptistSlide = null
          let remark
          const ignoreColors: string[] = []
          if (isSamePPT) {
            const pptist = pptistSlides[indexSlide]
            pptistSlide = pptist.json
            const textNoteElement = pptistSlide.notesElements.filter(element => {
              return element.type === 'text' && hasVisibleTextContent(element.content).hasVisibleContent
            })

            if (textNoteElement.length > 0) {
              const elementContent = textNoteElement[0]
              if (elementContent.type === 'text') {
                const textDiv: HTMLDivElement | null = document.createElement('div')
                textDiv.innerHTML = elementContent.content
                remark = textDiv.innerText
              }
            }

            const pptistFill = pptistSlide.fill
            if (null !== pptistFill && typeof pptistFill === 'string') {
              // console.log('content 类型解析成功 fill:%s', pptistFill)
              const fill: PPTistFill = {type: 'background', color: pptistFill}
              pptistSlide.bgFill = [fill]
            } 
            else if (null !== pptistFill) {
              if (Array.isArray(pptistFill)) {
                const fills: PPTistFill[] = JSON.parse(JSON.stringify(pptistFill))
                // const fillFilter = fills?.filter(fill => fill.type !== 'text' || (fill.type === 'text' && fill.content))
                pptistSlide.bgFill = fills
              }
              else {
                const fill: PPTistBGFill = JSON.parse(JSON.stringify(pptistFill))
                // console.log('content 类型解析成功 fill:%s', fill.color)
                pptistSlide.bgFill = [fill]
              }
            }
            // console.log('importPPTXFile index:%d, pptistSlide:%o, pptistFill:%o', indexSlide, pptistSlide, pptistFill)
          }
          indexSlide++
          const { type, value } = item.fill
          let slideBgColor = type === 'color' ? value : undefined
          const bgFill = pptistSlide?.bgFill?.find(item => item.type === 'background')
          const slideBgFill: PPTistBGFill | undefined = (bgFill === undefined || bgFill.type !== 'background') ? undefined : (bgFill as PPTistBGFill)
          const bgFillColor = pptistSubStrToColor(slideBgFill?.color)
          if (bgFillColor !== undefined && (slideBgColor === undefined || slideBgColor !== bgFillColor)) {
            slideBgColor = bgFillColor
          }
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
            ignoreColors.push(value.colors[0].color)
            ignoreColors.push(value.colors[value.colors.length - 1].color)
          }
          else {
            const imageFill = parseFillImage(pptistSlide?.bgFill)
            if (imageFill && imageFill !== undefined && imageFill.type === 'image') {
              background = imageFill
            } 
            else {
              if (slideBgFill !== undefined && slideBgFill.type === 'background') {
                const imageBackground = parseBackgroundImage(slideBgFill.color)
                if (imageBackground && imageBackground !== undefined && imageBackground.type === 'image') {
                  background = imageBackground
                }
                else {
                  background = {
                    type: 'solid',
                    color: slideBgColor ?? value,
                  }
                  ignoreColors.push(slideBgColor ?? value)
                }
              }
              else {
                background = {
                  type: 'solid',
                  color: value,
                }
                ignoreColors.push(value)
              }
              
            }
          }

          let elements: PPTElement[] = []
          const fillElements = parsePptistFillElement(indexSlide, pptistScale, shapeList, pptistSlide?.bgFill)
          if (background.type === 'image' && fillElements && fillElements.length > 0) {
            elements = fillElements.filter(item => item.type !== 'image' || (item.type === 'image' && item.src !== background.image))
          }
          else if (fillElements && fillElements.length > 0) {
            elements = fillElements
          }

          const slide: Slide = {
            id: assignElementId(),
            elements: elements,
            background,
            remark: remark
          }

          const parseElements = (elements: Element[], secondary: boolean, pptistEls: PPTistElement[] | undefined, expandElement: PPTXElementExpand | undefined, groupId?: string) => {
            let indexElement = 0
            // const pptistElements = pptistEls?.filter(element => element.type !== 'text' || (element.type === 'text' && element.content))
            const pptistElements = pptistEls
            const isSameElement = elements.length === (pptistElements?.length ?? 0)
            for (const el of elements) {
              let pptistEl = null
              if (isSameElement) {
                pptistEl = pptistElements![indexElement]
              }
              indexElement++
            
              const originWidth = el.width || (pptistEl?.width ?? 1)
              const originHeight = el.height || (pptistEl?.height ?? 1)
              // const originWidth = el.width
              // const originHeight = el.height
              const originLeft = el.left
              const originTop = el.top

              let pptistOriginWidth = originWidth
              let pptistOriginHeight = originHeight
              let pptistOriginLeft = originLeft
              let pptistOriginTop = originTop
              let isUseBgFill = false
              if (pptistEl !== null && pptistEl) {
                pptistOriginWidth = pptistEl.width
                pptistOriginHeight = pptistEl.height
                pptistOriginLeft = pptistEl.left
                pptistOriginTop = pptistEl.top
                pptistEl.width = Number((pptistEl.width * pptistScale).toFixed(3))
                pptistEl.height = Number((pptistEl.height * pptistScale).toFixed(3))
                pptistEl.left = Number((pptistEl.left * pptistScale).toFixed(3))
                pptistEl.top = Number((pptistEl.top * pptistScale).toFixed(3))
                isUseBgFill = pptistEl.isUseBgFill
              }
              el.width = Number((el.width * scale).toFixed(3))
              el.height = Number((el.height * scale).toFixed(3))
              el.left = Number((el.left * scale).toFixed(3))
              el.top = Number((el.top * scale).toFixed(3))

              const expandRotate = expandElement?.expandRotate ?? 0
              const expandOrder = expandElement?.expandOrder ?? 0
              // console.log('importPPTXFile el.width:%d, pptistEl.width:%d, el.height:%d, pptistEl.height:%d, el.left:%d, pptistEl.left:%d, el.top:%d, pptistEl.top:%d, id:%s', el.width, (pptistEl?.width ?? -1), el.height, (pptistEl?.height ?? -1), el.left, (pptistEl?.left ?? -1), el.top, (pptistEl?.top ?? -1), (pptistEl?.id ?? ''))
              // console.log('######################### id:%s', (pptistEl?.id ?? ''))
              
              const isValidLT = (expandElement !== null && expandElement !== undefined && typeof expandElement === 'object' && expandElement.isValidLT.length > 0) ? expandElement.isValidLT[indexElement - 1] : undefined
              const isValidWH = (expandElement !== null && expandElement !== undefined && typeof expandElement === 'object' && expandElement.isValidWH.length > 0) ? expandElement.isValidWH[indexElement - 1] : undefined
              const { elwidth, elheight, elleft, eltop, secondaryTop, secondaryLeft, isSameWH, isSameLT} = calculateEffectiveSize(el.left, el.top, el.width, el.height, 
                secondary, pptistEl?.left, pptistEl?.top, pptistEl?.width, pptistEl?.height, isValidLT, isValidWH)
              
              if (el.type === undefined || el.type === null) {
                elementReassign(el, pptistEl)
              }
              let lineHeight = 1
              const elType = el.type
              const pptistElType = pptistEl?.type
              let textHasContent = false
              if (pptistElType === 'text') {
                const textDiv: HTMLDivElement | null = document.createElement('div')
                textDiv.innerHTML = pptistEl.content
                const regex = /^(&nbsp;|\s)+$/
                textHasContent = pptistEl.content.trim().length > 0 && !regex.test(textDiv.innerText)
              }
              if (elType === 'text' || (elType === 'shape' && pptistElType === 'text' && textHasContent && !isMustShapeType(el.shapType))) { 
                let isVertical = false
                if (el.type === 'text') {
                  isVertical = el.isVertical
                }
                if (pptistElType === 'text' && pptistEl && pptistEl.lineHeight > 0) {
                  lineHeight = pptistEl.lineHeight
                }
                // if (pptistEl?.id === '10') {
                //   console.log('pptistEl?.id')
                // }
                const pptistTextShapeEl: PPTistTextElement | PPTistShapeElement | undefined = ((pptistElType === 'text' || pptistElType === 'shape') && pptistEl) ? pptistEl : undefined
                const pptistContent = pptistTextShapeEl?.content
                // const hasLiTag = /<li[^>]*>/i.test(el.content) && (pptistContent ? !pptistContent.includes(UNICODE_PATTERN) : true)
                let elContent = (pptistContent && pptistContent !== undefined) ? pptistTextFontSize(pptistContent, pptistScale) : el.content
                // const shadowColor = extractTextShadowColor(elContent)
                const {hasVisibleContent, firstContent, rows} = hasVisibleTextContent(elContent)
                const pptistFillColor = pptistTextShapeEl?.fillColor

                let outline: PPTElementOutline | undefined = undefined
                const isValidBorder = (el.borderWidth !== 1 || ((pptistTextShapeEl?.borderWidth ?? 0) > 0 && el.borderWidth > 0)) && el.borderColor && el.borderColor !== '#000'
                const isNoFillColor = (el.fillColor === 'none' || el.fillColor === '') && ((el.borderWidth === 1 || (pptistTextShapeEl?.borderWidth ?? 0) === 0) && el.borderColor && el.borderColor !== '#000' && el.borderType)
                const { stroke, strokeWidth } = pptistSVGSubStroke(pptistTextShapeEl?.svg)
                const isNaNStrokeWidth = (strokeWidth !== undefined && !isNaN(strokeWidth) && strokeWidth === -2) && (el.borderColor !== '#000' && stroke && stroke !== 'none' && stroke.length > 3)
                const isValidPptistBorder = null === pptistElType || undefined === pptistElType || pptistSVGVaildStroke(stroke, strokeWidth)
                if ((isValidBorder || isNoFillColor || isNaNStrokeWidth) && isValidPptistBorder) {
                  outline = {
                    color: isValidBorder && (el.borderColor !== pptistTextShapeEl?.borderColor && pptistTextShapeEl?.borderColor !== stroke) ? el.borderColor : stroke,
                    width: recalculateBorderWidth(el.borderWidth, pptistTextShapeEl?.borderWidth, strokeWidth),
                    style: el.borderType === 'solid' ? 'solid' : 'dashed',
                  }
                }
                const isEmptyFillColor = (undefined === pptistFillColor || null === pptistFillColor || 'none' === pptistFillColor || '' === pptistFillColor)
                let fillColor
                let gradient: ShapeGradient | undefined = undefined
                if (!isUseBgFill) {
                  if (!isEmptyFillColor) {
                    gradient = pptistToGradient(pptistFillColor)
                    fillColor = gradient ? gradient.color[0] : pptistRgbToString(pptistFillColor)
                  }
                  if (undefined === fillColor || null === fillColor || 'none' === fillColor || '' === fillColor) {
                    if ('none' !== pptistFillColor) {
                    // if (!(el.fillColor.startsWith('#000') || el.fillColor.startsWith('#fff')) || !(null !== pptistFillColor || 'none' !== pptistFillColor)) {
                      fillColor = el.fillColor
                    }
                  }
                }
                else if (slideBgColor !== undefined && slideBgColor) {
                  fillColor = slideBgColor
                }
                const { top, left, width, height, fontSize, fontFamily, fontColor, textAlign, verticalAlign} = extractStylesFromDiv(pptistContent, expandElement?.groupExpand)
                const fontName = fontFamily ?? theme.value.fontName
                const textColor = fontColor ?? theme.value.fontColor
                // if (hasLiTag) {
                //   const isSpecialliContent = isSpecialUlHTML(elContent)
                //   if (isSpecialliContent) {
                //     const fontSizeRegex = /font-size:\s*([^;]+);/
                //     const fontFamilyRegex = /font-family:\s*([^;]+);/
                //     const spanContentRegex = /<span[^>]*>(.*?)<\/span>/

                //     const fontSizeMatch = elContent.match(fontSizeRegex)
                //     const fontFamilyMatch = elContent.match(fontFamilyRegex)
                //     const spanContentMatch = elContent.match(spanContentRegex)

                //     const fontSize = fontSizeMatch ? fontSizeMatch[1] : ''
                //     const fontFamily = fontFamilyMatch ? fontFamilyMatch[1] : ''
                //     const spanContent = spanContentMatch ? spanContentMatch[1] : ''
                //     elContent = `<ul style="list-style-type: disc;font-size: ${fontSize};color: ${theme.value.fontColor};"><li><p style=""><span style="font-size: ${fontSize};"><span style="font-family: ${fontFamily};">${spanContent}</span></span></p></li></ul>`
                //   }
                // }
                // else {
                  
                // }
                if (!isPptistSizeValid(pptistScale / scaling_factor, width) || !isPptistSizeValid(pptistScale / scaling_factor, height) || (rows <= 2 && isNumberString(firstContent) && fontFamily && textColor)) {
                  elContent = pptistTextFontSize(el.content, pptistScale, fontSize)
                }
                elContent = transformTextToUppercase(elContent)
                // adjust the html that contains some content
                if (elContent.includes(NUMBER_PATTERN) || elContent.includes(UNICODE_PATTERN)) {
                  elContent = adjustBulletSpacing(elContent)
                }
                if (elContent.includes(UNICODE_PATTERN)) {
                  elContent = adjustDotHtmlString(elContent)
                }
                if (elContent.includes(NUMBER_PATTERN)) {
                  elContent = adjustNumberBulletHtmlString(elContent)
                }
                

                elContent = replaceIndexSlide(elContent, `${indexSlide}`)
                if (hasVisibleContent || outline !== undefined || (fillColor !== undefined && fillColor !== null && fillColor.length > 0)) {
                  const textEl: PPTTextElement = {
                    type: 'text',
                    id: assignElementId(pptistEl, groupId, 'text'),
                    width: calculateTextTypeWidth(elwidth, el.width, secondaryLeft, secondary, isSameWH, pptistScale, isValidWH, fontSize, firstContent),
                    height: elheight,
                    left: secondaryLeft,
                    top: secondaryTop,
                    rotate: el.rotate,
                    defaultFontName: fontName,
                    defaultColor: textColor,
                    content: elContent,
                    lineHeight: lineHeight,
                    outline: outline,
                    fill: fillColor,
                    gradient: gradient,
                    vertical: isVertical,
                    order: pptistEl?.order
                  }
                  if (el.shadow) {
                    if (pptistTextShapeEl?.shadow && el.shadow.color.length !== pptistTextShapeEl.shadow.color.length) {
                      textEl.shadow = pptistTextShapeEl.shadow
                    }
                    else {
                      textEl.shadow = el.shadow
                    }
                  } 
                  slide.elements.push(textEl)
                // console.log('importPPTXFile textEL:%o', textEl)
                }
              }
              else if (el.type === 'image') {
                const elSrc = (pptistElType === 'image' && pptistEl.src) ? pptistEl.src : el.src
                const scene3dAndSP3d = (pptistElType === 'image' && pptistEl.scene3dAndSP3d) ? pptistEl.scene3dAndSP3d : undefined
                const imageEl: PPTImageElement = {
                  type: 'image',
                  id: assignElementId(pptistEl, groupId, 'image'),
                  src: elSrc,
                  width: elwidth,
                  height: elheight,
                  left: secondaryLeft,
                  top: secondaryTop,
                  fixedRatio: true,
                  rotate: el.rotate,
                  flipH: el.isFlipH,
                  flipV: el.isFlipV,
                  order: pptistEl?.order
                }
                const { outline, clip, shadow, fixedRatio} = parseImageShapeStyle(elwidth, elheight, (pptistElType === 'image' ? (pptistEl as PPTistImageElement) : undefined), expandElement)
                imageEl.fixedRatio = fixedRatio
                if (outline && outline !== undefined) {
                  imageEl.outline = outline
                }
                if (clip && clip !== undefined) {
                  imageEl.clip = clip
                }
                if (shadow && shadow !== undefined) {
                  imageEl.shadow = shadow
                }
                const cameraRotRev = scene3dAndSP3d?.cameraRotRev ?? 0
                imageEl.rotate = ((imageEl.rotate - cameraRotRev) + 360) % 360
                slide.elements.push(imageEl)
              }
              else if (el.type === 'audio') {
                const elSrc = (pptistElType === 'audio' && pptistEl.src) ? pptistEl.src : el.blob
                slide.elements.push({
                  type: 'audio',
                  id: assignElementId(pptistEl, groupId, 'audio'),
                  src: elSrc,
                  width: el.width,
                  height: el.height,
                  left: el.left,
                  top: el.top,
                  rotate: 0,
                  fixedRatio: false,
                  color: theme.value.themeColor,
                  loop: false,
                  autoplay: false,
                  order: pptistEl?.order
                })
              }
              else if (el.type === 'video') {
                const elSrc = (pptistElType === 'video' && pptistEl.src) ? pptistEl.src : ((pptistElType === 'videoLink' && pptistEl.src) ? pptistEl.src : (el.blob || el.src)!)
                slide.elements.push({
                  type: 'video',
                  id: assignElementId(pptistEl, groupId, 'video'),
                  src: elSrc,
                  width: el.width,
                  height: el.height,
                  left: el.left,
                  top: el.top,
                  rotate: 0,
                  autoplay: false,
                  order: pptistEl?.order
                })
              }
              else if (el.type === 'shape') {
                // if (pptistEl?.id === '42' || pptistEl?.id === '41') {
                //   console.log('vAlignMap %o', el)
                // }
                const pptistTextShapeEl: PPTistTextElement | PPTistShapeElement | undefined = ((pptistElType === 'text' || pptistElType === 'shape') && pptistEl) ? pptistEl : undefined
                const pptistFillColor = pptistTextShapeEl?.fillColor
                const isEmptyFillColor = (undefined === pptistFillColor || null === pptistFillColor || 'none' === pptistFillColor || '' === pptistFillColor)
                let fillColor
                let gradient: ShapeGradient | undefined = undefined
                if (!isUseBgFill) {
                  if (!isEmptyFillColor) {
                    gradient = pptistToGradient(pptistFillColor)
                    fillColor = gradient ? gradient.color[0] : pptistRgbToString(pptistFillColor)
                  }
                  if (undefined === fillColor || null === fillColor || 'none' === fillColor || '' === fillColor) {
                    // if (!(el.fillColor.startsWith('#000') || el.fillColor.startsWith('#fff')) || !(null !== pptistFillColor || 'none' !== pptistFillColor)) {
                    if ('none' !== pptistFillColor) {
                      fillColor = el.fillColor
                    }
                  }
                }
                else if (slideBgColor !== undefined && slideBgColor) {
                  fillColor = slideBgColor
                }
                const isValidBorder = (el.borderWidth !== 1 || ((pptistTextShapeEl?.borderWidth ?? 0) > 0 && el.borderWidth > 0)) && el.borderColor && el.borderColor !== '#000'
                const isNoFillColor = (el.fillColor === 'none' || el.fillColor === '') && ((el.borderWidth === 1 || (pptistTextShapeEl?.borderWidth ?? 0) === 0) && el.borderColor && el.borderColor !== '#000' && el.borderType)
                const { stroke, strokeWidth } = pptistSVGSubStroke(pptistTextShapeEl?.svg)
                const isNaNStrokeWidth = (strokeWidth !== undefined && !isNaN(strokeWidth) && strokeWidth === -2) && (el.borderColor !== '#000' && stroke && stroke !== 'none' && stroke.length > 3)
                const isValidPptistBorder = null === pptistElType || undefined === pptistElType || pptistSVGVaildStroke(stroke, strokeWidth)
                let shapeOutline: PPTElementOutline | undefined = undefined
                if ((isValidBorder || isNoFillColor || isNaNStrokeWidth) && isValidPptistBorder) {
                  shapeOutline = {
                    color: isValidBorder && (el.borderColor !== pptistTextShapeEl?.borderColor && pptistTextShapeEl?.borderColor !== stroke) ? el.borderColor : stroke,
                    width: recalculateBorderWidth(el.borderWidth, pptistTextShapeEl?.borderWidth, strokeWidth),
                    style: el.borderType === 'solid' ? 'solid' : 'dashed',
                  }
                }
                if (!(el.shapType === 'curvedConnector2' || el.shapType === 'curvedConnector3' || el.shapType === 'curvedConnector4' || el.shapType === 'curvedConnector5') 
                  && (el.shapType === 'line' || /Connector/.test(el.shapType))) {
                  if ((el.width !== 0 || pptistEl?.width !== 0) || (el.height !== 0 || pptistEl?.height !== 0)) {
                    const lineElement = parseLineElementOfPPtist(el, pptistTextShapeEl, fillColor, gradient, groupId)
                    // const lineElement = parseLineElement(el)
                    slide.elements.push(lineElement)
                  }
                }
                else if (pptistTextShapeEl && !isEmptyFillColor && pptistShapeFillImage(pptistFillColor)) {
                  const shapeImageEl: PPTImageElement = {
                    type: 'image',
                    id: assignElementId(pptistEl, groupId, 'image'),
                    src: pptistFillColor,
                    width: elwidth,
                    height: elheight,
                    left: secondaryLeft,
                    top: secondaryTop,
                    fixedRatio: true,
                    rotate: pptistTextShapeEl.rotate,
                    flipH: pptistTextShapeEl.isFlipH,
                    flipV: pptistTextShapeEl.isFlipV,
                    order: pptistTextShapeEl.order
                  }
                  const { outline, clip, shadow, fixedRatio} = parseImageShapeStyle(elwidth, elheight, undefined)
                  shapeImageEl.fixedRatio = fixedRatio
                  if (outline && outline !== undefined) {
                    shapeImageEl.outline = outline
                  } 
                  else if (shapeOutline) {
                    shapeImageEl.outline = shapeOutline
                  }
                  if (clip && clip !== undefined) {
                    shapeImageEl.clip = clip
                  }
                  if (shadow && shadow !== undefined) {
                    shapeImageEl.shadow = shadow
                  }
                  else if (el.shadow) {
                    shapeImageEl.shadow = el.shadow
                  }
                  slide.elements.push(shapeImageEl)
                }
                else {
                  const shape = shapeList.find(item => item.pptxShapeType === el.shapType)
                  let elContent = (pptistTextShapeEl?.content !== undefined && pptistTextShapeEl.content) ? pptistTextFontSize(pptistTextShapeEl.content, pptistScale) : el.content
                  const isVertical = pptistTextShapeEl?.isVertical ?? false
                  const avLsts = pptistTextShapeEl?.avLst ?? []
                  const { top, left, width, height, fontSize, fontFamily, fontColor, textAlign, verticalAlign} = extractStylesFromDiv(pptistTextShapeEl?.content, expandElement?.groupExpand)
                  const fontName = fontFamily ?? theme.value.fontName
                  const textColor = fontColor ?? theme.value.fontColor
                  if (!isPptistSizeValid(pptistScale / scaling_factor, width) || !isPptistSizeValid(pptistScale / scaling_factor, height)) {
                    elContent = pptistTextFontSize(el.content, pptistScale, fontSize)
                  }
                  const vAlignMap: { [key: string]: ShapeTextAlign } = {
                    'mid': 'middle',
                    'down': 'bottom',
                    'up': 'top',
                    'baseline': 'middle'
                  }
                  let viewBox: [number, number] = [elwidth, elheight]
                  let elpath = el.path
                  const svgTLWH = extractSVGStyleProperties(pptistTextShapeEl?.svg, expandElement?.groupExpand)
                  if (!isValidELSvgPath(elwidth, elheight, el.shapType === 'custom', false, elpath)) {
                    elpath = pptistTextShapeEl?.path
                    viewBox = [pptistOriginWidth, pptistOriginHeight]
                  }
                  const isValidSvgW = isPptistSizeValid(pptistScale, svgTLWH.width) && (svgTLWH.width ?? 0) < VIEWPORT_SIZE
                  const isValidSvgH = isPptistSizeValid(pptistScale, svgTLWH.height) && (svgTLWH.height ?? 0) < VIEWPORT_SIZE
                  if (!elpath || elpath === '') {
                    elpath = el.path
                    viewBox = [originWidth, originHeight]
                  }
                  if (!elpath || elpath === '') {
                    elpath = findSvgPath(pptistTextShapeEl?.svg)
                    viewBox = [svgTLWH.width ?? pptistOriginWidth, svgTLWH.height ?? pptistOriginHeight]
                    if (!elpath || elpath === '' || elpath === 'none' || elpath === undefined) {
                      elpath = 'M 0 0 L 200 0 L 200 200 L 0 200 Z'
                      viewBox = [200, 200]
                    }
                  }

                  const {hasVisibleContent, firstContent, rows} = hasVisibleTextContent(elContent)
                  const invalidElement = el.width === 0 && el.height === 0 && elpath === 'M 0 0 L 200 0 L 200 200 L 0 200 Z' && !hasVisibleContent && fillColor !== undefined && fillColor.startsWith('#fff') && shapeOutline !== undefined && shapeOutline.color !== undefined && shapeOutline.color.startsWith('#000')
                  if (isSpecialShapeType(el.shapType) || (!invalidElement && (hasVisibleContent || shapeOutline !== undefined || (fillColor !== undefined && fillColor !== null && fillColor.length > 0)))) {
                    const element: PPTShapeElement = {
                      type: 'shape',
                      id: assignElementId(pptistEl, groupId, 'shape'),
                      width: elwidth,
                      height: elheight,
                      left: secondaryLeft,
                      top: secondaryTop,
                      viewBox,
                      path: elpath,
                      fill: fillColor || 'none',
                      gradient: gradient,
                      fixedRatio: false,
                      rotate: el.rotate,
                      outline: shapeOutline,
                      text: {
                        content: elContent,
                        defaultFontName: fontName,
                        defaultColor: textColor,
                        align: 'middle',
                        lineHeight: 1,
                        vertical: isVertical,
                      },
                      flipH: el.isFlipH,
                      flipV: el.isFlipV,
                      order: pptistEl?.order
                    }
                    if (el.shadow) {
                      if (pptistTextShapeEl?.shadow && el.shadow.color.length !== pptistTextShapeEl.shadow.color.length) {
                        element.shadow = pptistTextShapeEl.shadow
                      }
                      else {
                        element.shadow = el.shadow
                      }
                    }
                    // if (el.shapType === 'arc') {
                    //   console.log('vAlignMap %o', el)
                    // }
                    if (shape) {
                      if (shape.pathFormula) {
                        const { width, height } = shapeSVGSpecifiedSizeWH(shape, elwidth, elheight, pptistScale, isSameWH, isValidSvgW, isValidSvgH, svgTLWH.width, svgTLWH.height)
                        element.viewBox = [width, height]
                        const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula]
                        if (shape.pptxShapeType === 'trapezoid') {
                          element.path = elpath
                          element.viewBox = [pptistOriginWidth, pptistOriginHeight]
                        }
                        else if ('editable' in pathFormula) {
                          let radiusValue = pathFormula.defaultValue
                          const adjVal = avLsts.length > 0 ? avLsts[0].adjVal : undefined
                          if ((shape.pptxShapeType === 'roundRect' || shape.pptxShapeType === 'round2SameRect') && adjVal !== null && adjVal !== undefined) {
                            radiusValue = Math.min(adjVal / 100000, 0.5)
                          }
                          else if (shape.pptxShapeType === 'parallelogram') {
                            radiusValue = 0.25
                            if (adjVal !== null && adjVal !== undefined) {
                              radiusValue = (adjVal / 100000) / ((width > height) ? width / height : height / width)
                            }
                          }
                          element.width = width
                          element.height = height
                          element.pathFormula = shape.pathFormula
                          element.path = pathFormula.formula(width, height, radiusValue)
                          element.keypoint = radiusValue
                        }
                        else {
                          element.pathFormula = shape.pathFormula
                          element.path = pathFormula.formula(width, height)
                        }
                      }
                      else if (pptistTextShapeEl !== undefined && (shape.pptxShapeType === 'chevron' || shape.pptxShapeType === 'homePlate'
                        || shape.pptxShapeType === 'rightArrow' || shape.pptxShapeType === 'leftArrow'
                        || shape.pptxShapeType === 'downArrow' || shape.pptxShapeType === 'upArrow' 
                        || shape.pptxShapeType === 'upDownArrow' || shape.pptxShapeType === 'leftRightArrow'
                        || shape.pptxShapeType === 'notchedRightArrow')) {
                        element.path = elpath
                        element.viewBox = [pptistOriginWidth, pptistOriginHeight]
                      }
                      else if (shape.pptxShapeType === 'pie' && pptistTextShapeEl !== undefined) {
                        element.path = elpath
                        element.viewBox = [pptistOriginWidth, pptistOriginHeight]
                        const adjVal = avLsts.length > 0 ? avLsts[0].adjVal : undefined
                        const piAngle = adjVal === undefined ? 270 : adjVal / 60000
                        const pieRotate = (piAngle - 270 + element.rotate) % 360
                        element.rotate = pieRotate
                      }
                      else {
                        element.path = shape.path
                        element.viewBox = shape.viewBox
                      }
                    }
                    else if (el.shapType === 'blockArc' && pptistTextShapeEl !== undefined) {
                      // const width = (isValidSvgW && isValidSvgH && svgTLWH.width) ? svgTLWH.width : elwidth
                      // const height = (isValidSvgW && isValidSvgH && svgTLWH.height) ? svgTLWH.height : elheight
                      const elRotate = el.rotate
                      const pptistRotate = pptistTextShapeEl?.rotate ?? elRotate
                      element.rotate = (elRotate > 0 ? elRotate : (pptistRotate > 0 ? pptistRotate : (expandRotate > 0 ? expandRotate : pptistRotate)))
                      // element.viewBox = [width, height]
                    }
                    else if (el.shapType === 'custom') {
                      element.special = true
                      if (pptistTextShapeEl && isPptistElementValid(pptistTextShapeEl.width) && isPptistElementValid(pptistTextShapeEl.height) && pptistTextShapeEl.custExist && isValidELSvgPath(elwidth, elheight, true, true, pptistTextShapeEl.path)) {
                        element.path = pptistTextShapeEl.path!.trim()
                        // element.viewBox = [elwidth, elheight]
                        element.viewBox = [pptistOriginWidth, pptistOriginHeight]
                      }
                      else {
                        const commands = (el.path!).match(/[A-Z]+/g)
                        const numberOfCommands = commands ? commands.length : 0
                        if (pptistTextShapeEl && (numberOfCommands < 2 || isValidELSvgPath(elwidth, elheight, true, true, pptistTextShapeEl.path))) {
                          element.path = pptistTextShapeEl.path!.trim()
                          element.viewBox = [pptistOriginWidth, pptistOriginHeight]
                        }
                        else if (element.path && isValidELSvgPath(elwidth, elheight, true, true, el.path)) {
                          element.path = el.path!.trim()
                          element.viewBox = [originWidth, originHeight]
                        }
                        // element.viewBox = [elwidth, elheight]
                      }
                    }
                    else if (isSpecialShapeType(el.shapType) && pptistTextShapeEl) {
                      if (pptistTextShapeEl.borderColor && pptistTextShapeEl.borderWidth) {
                        let borderColor = pptistTextShapeEl.borderColor
                        if (borderColor === undefined || borderColor.startsWith('#000') || borderColor.toLowerCase().startsWith('#fff')) {
                          borderColor = fillColor ?? el.borderColor
                        }
                        const specialOutline: PPTElementOutline = {
                          color: (borderColor ?? el.borderColor) ?? el.fillColor,
                          width: recalculateBorderWidth(el.borderWidth, pptistTextShapeEl.borderWidth, strokeWidth),
                          style: (pptistTextShapeEl.borderType ?? el.borderType) === 'solid' ? 'solid' : 'dashed',
                        }
                        element.outline = specialOutline
                      }
                      element.fill = 'none'
                    }
                    slide.elements.push(element)
                  }
                }
              }
              else if (el.type === 'table') {
                const row = el.data.length
                const col = el.data[0].length
                // if (pptistEl?.id === '4589' || pptistEl?.id === '4536') {
                //   console.log('table width: 320.8 80.02*4, height: 36px')
                // }
                let width = elwidth
                let height = elheight
                const tableElement: PPTistTableElement | undefined = pptistElType === 'table' ? pptistEl : undefined
                const pptistData = tableElement?.data
                let pptistRowL = 0
                let tableBorder: { color: string; width: number, type?: string} | undefined
                let fontName = undefined
                let fillColor = undefined
                let lastChildFillColor = undefined
                // let colWidthProportion = undefined
                let cellMinHeight = 36
                let totalRowHeight = 0
                let totalColWidth = 0
                const gridColWs = tableElement?.gridColWs
                if (gridColWs !== undefined && gridColWs.length > 0) {
                  for (let i = 0; i < gridColWs.length; i++) {
                    const gridColW = gridColWs[i]
                    if (gridColW !== undefined) {
                      totalColWidth += gridColW
                    }
                  }
                }
                const gridRowHs = tableElement?.gridRowHs
                if (gridRowHs !== undefined && gridRowHs.length > 0) {
                  for (let i = 0; i < gridRowHs.length; i++) {
                    const gridRowH = gridRowHs[i]
                    if (gridRowH !== undefined) {
                      totalRowHeight += gridRowH
                    }
                  }
                }
                if (pptistData && pptistData !== undefined && pptistData.length > 0) {
                  pptistRowL = pptistData.length
                  // if (pptistData[0].length > 1) {
                  //   colWidthProportion = calculateColWidthProportion(pptistData[0])
                  // }
                  const pptistRow = pptistData[pptistRowL - 1]
                  const pptistRowLength = pptistRow && pptistRow.length > 0 ? pptistRow.length : 0
                  const pptistStyl = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].colStyl : ''
                  const pptistBorderRight = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].borderRight : undefined
                  const pptistBorderLeft = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].borderRight : undefined
                  const pptistBorderTop = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].borderRight : undefined
                  const pptistBorderBottom = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].borderRight : undefined
                  tableBorder = (pptistStyl && pptistStyl !== '') ? pptistTableBorder(pptistStyl, pptistBorderLeft, pptistBorderTop, pptistBorderRight, pptistBorderBottom) : undefined
                  const celFillColor2 = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].celFillColor2 : undefined
                  const cellFillColor = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].cellFillColor : undefined
                  if (cellFillColor === 'background-color:inherit;' && celFillColor2 === '') {
                    fillColor = '#00000000'
                  }
                  else {
                    const parseCellFillColor = extractBackgroundColors(cellFillColor)
                    if (parseCellFillColor && parseCellFillColor.length > 0) {
                      fillColor = parseCellFillColor[0]
                    }
                    if (!fillColor || fillColor === undefined) {
                      fillColor = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].fillColor : undefined
                    }
                  }
                  // celFontColor = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].fontClrPr : undefined
                  fontName = pptistRowLength > 0 ? pptistRow[pptistRowLength - 1].fontName : undefined 
                } 
                let tableCellBgs = extractTableCellBgColors(globalCSSData)
                if (fillColor && fillColor !== undefined) {
                  if (tableCellBgs) {
                    tableCellBgs.push(fillColor)
                  }
                  else {
                    tableCellBgs = [fillColor]
                  }
                }
                const tableCellColor = getFilterValidColor(tableCellBgs, ignoreColors) ?? el.themeColor
                if (!tableBorder || tableBorder === undefined) {
                  tableBorder = {color: '#eeece1', width: 2, type: 'solid'}
                }
                else if (tableBorder.color === 'hidden' && tableBorder.type === undefined && tableBorder.width === 1.333) {
                  tableBorder = {color: '#00000000', width: 0.5, type: 'solid'}
                }
                else if (tableBorder.color === 'none') {
                  // tableBorder.color = fillColor ?? '#00000000'
                  tableBorder.color = ''
                }
                // const fontColor = getFilterValidColor(fontColors, ignoreColors, el.themeColor) ?? celFontColor
                const style: TableCellStyle = {
                  fontname: fontName ?? theme.value.fontName,
                  // color: fontColor && fontColor !== undefined ? fontColor : theme.value.fontColor,
                }
                console.log('useImport parse table totalRowHeight:%d, pptistOriginHeight:%d, totalColWidth:%d, pptistOriginWidth:%d', totalRowHeight, pptistOriginHeight, totalColWidth, pptistOriginWidth)
                let rowHFactor = pptistScale
                let colWFactor = pptistScale
                if (totalColWidth > 0 && pptistOriginWidth > totalColWidth) {
                  width = totalColWidth * pptistScale
                  colWFactor = pptistScale
                }
                else if (totalColWidth > 0 && pptistOriginWidth < totalColWidth) {
                  colWFactor = pptistOriginWidth / totalColWidth * pptistScale
                }
                if (totalRowHeight > 0 && pptistOriginHeight > totalRowHeight) {
                  height = totalRowHeight * pptistScale
                  rowHFactor = pptistScale
                }
                else if (totalRowHeight > 0 && pptistOriginHeight < totalRowHeight) {
                  rowHFactor = pptistOriginHeight / totalRowHeight * pptistScale
                }
                const data: TableCell[][] = []
                for (let i = 0; i < row; i++) {
                  let pptistRow = undefined
                  let pptistColL = 0
                  if (i < pptistRowL && pptistData) {
                    pptistRow = pptistData[i]
                    pptistColL = pptistRow.length
                  }
                  const rowCells: TableCell[] = []
                  let pptistCol = undefined
                  for (let j = 0; j < col; j++) {
                    const cellData = el.data[i][j]
                    const hMerge = cellData.hMerge // 用于表明单元格是否进行了水平方向的合并（即同一行内的多个单元格合并成一个单元格）。当hMerge设为true时，表示当前单元格与前一个单元格进行水平合并。
                    const vMerge = cellData.vMerge // 用来指示单元格是否进行了垂直方向的合并（即多个单元格在同一列内合并成一个单元格）。当vMerge设为true时，表示当前单元格与上一行的单元格进行垂直合并。
                    let colSpan = cellData.colSpan // 表示该单元格横向跨越的列数。若设置为2或以上，那么该单元格将与右侧相应数量的单元格合并为一个单元格。
                    let rowSpan = cellData.rowSpan // 表示该单元格纵向跨越的行数。如果设置为2或以上，那么该单元格将与下方相应数量的单元格合并为一个单元格。

                    if (j < pptistColL && pptistRow) {
                      pptistCol = pptistRow[j]
                    }
                    let pptisText = undefined
                    let colStyl = undefined
                    let cssName = undefined
                    let pptistColSpan = undefined
                    let pptistRowSpan = undefined
                    let pptistCellFill = undefined
                    let colWidth = undefined
                    let rowHeight = undefined
                    let childFillColor = undefined
                    let vert = undefined
                    let fontColor = undefined
                    if (pptistCol) {
                      pptisText = adjustTableCellText(pptistCol, colWFactor, rowHFactor)
                      colStyl = pptistCol.colStyl
                      cssName = pptistCol.cssName
                      pptistColSpan = pptistCol.colSpan
                      pptistRowSpan = pptistCol.rowSpan
                      pptistCellFill = pptistCol.cellFillColor
                      colWidth = pptistCol.colWidth * colWFactor
                      rowHeight = pptistCol.rowHeight * rowHFactor
                      childFillColor = pptistCol.fillColor
                      vert = pptistCol.isVert
                      fontColor = pptistCol.fontClrPr
                    }
                    if (childFillColor !== undefined) {
                      lastChildFillColor = childFillColor
                    }
                    const isHTrue: boolean = hMerge !== undefined && (hMerge === true || hMerge)
                    const isVTrue: boolean = vMerge !== undefined && (vMerge === true || vMerge)
                    if (((!colSpan || colSpan <= 1) && isHTrue) || ((!rowSpan || rowSpan <= 1) && isVTrue)) {
                      // 一个被合并的单元格，不可以显示的
                      continue
                    }

                    if (((undefined !== colSpan && colSpan > 1) && !isHTrue) || ((undefined !== rowSpan && rowSpan > 1) && !isVTrue)) {
                      // 一个被合并的单元格，可以显示的
                      colSpan = pptistColSpan || 1
                      rowSpan = pptistRowSpan || 1
                    }
                    else if (((!colSpan || colSpan <= 1) && !isHTrue) || ((!rowSpan || rowSpan <= 1) && !isVTrue)) {
                      // 一个正常单元格，没有合并
                      colSpan = 1
                      rowSpan = 1
                    }
                    
                    const text = pptisText ? pptisText : cellData.text // 表示表格单元格中的实际文本内容
                    if (pptistCellFill !== undefined) {
                      const regex = /#(?:[0-9a-fA-F]{3,8}|[0-9a-fA-F]{6})\b/
                      const matches: RegExpMatchArray | null = pptistCellFill.match(regex)
                      if (matches !== null) {
                        matches.forEach((colorCode: string) => {
                          style.backcolor = colorCode
                        })
                      }
                      else if (childFillColor) {
                        style.backcolor = childFillColor
                      }
                    }

                    const regexFontColor = /color:\s*([#a-fA-F0-9]+)/
                    const match: RegExpMatchArray | null = text.match(regexFontColor)
                    if (match !== null) {
                      style.color = match[1]
                    } 
                    else {
                      style.color = fontColor ? fontColor : theme.value.fontColor
                    }
                    cellMinHeight = Math.min(rowHeight ?? 36, cellMinHeight)
                    rowCells.push({
                      id: assignElementId(),
                      colspan: colSpan || 1, // 合并列数
                      rowspan: rowSpan || 1, // 合并行数
                      cellWidth: colWidth,
                      cellHeight: rowHeight,
                      vert: vert,
                      // text: cellData.text,
                      // style,
                      text: text,
                      style: {
                        ...style,
                      
                      },  
                    })
                  }
                  data.push(rowCells)
                }
                const pptistColWidths: number[] = []
                if (gridColWs !== undefined && gridColWs.length > 0) {
                  for (let i = 0; i < gridColWs.length; i++) {
                    const gridColW = gridColWs[i]
                    if (gridColW !== undefined) {
                      pptistColWidths.push(gridColW / totalColWidth)
                    }
                  }
                }
                // 列宽数组，如[30, 50, 20]表示三列宽度分别为30%, 50%, 20%
                // cosnt colWidths: number[] = colWidthProportion ? colWidthProportion : new Array(col).fill(1 / col),
                const colWidths: number[] = pptistColWidths.length === col ? pptistColWidths : new Array(col).fill(1 / col)
                slide.elements.push({
                  type: 'table',
                  id: assignElementId(pptistEl, groupId, 'table'),
                  width,
                  height,
                  left: el.left,
                  top: el.top,
                  colWidths,
                  rotate: 0,
                  data,
                  outline: {
                    width: tableBorder === undefined || tableBorder.width <= 0 ? 2 : tableBorder.width,
                    style: tableBorder?.type === undefined || tableBorder.type !== 'dashed' ? 'solid' : 'dashed',
                    color: tableBorder === undefined || tableBorder.color === undefined ? '#eeece1' : tableBorder.color,
                  },
                  theme: {
                    color: tableCellColor !== undefined ? tableCellColor : (lastChildFillColor !== undefined ? theme.value.themeColor : ''),
                    rowHeader: true,
                    rowFooter: false,
                    colHeader: false,
                    colFooter: false,
                  },
                  cellMinHeight,
                  order: pptistEl?.order
                })
              }
              else if (elType === 'chart') {
                let labels: string[]
                let legends: string[]
                let series: number[][]
                const chartData = pptistEl?.type === 'chart' ? pptistEl.chartData : undefined // barChart 类型出现ser有多个
                const catAxData = pptistEl?.type === 'chart' ? pptistEl.catAxData : undefined // X
                const valAxData = pptistEl?.type === 'chart' ? pptistEl.valAxData : undefined // Y
                const chartShowCatName = chartData !== undefined ? chartData.dLbls?.showCatName : undefined // X
                const chartShowSerName = chartData !== undefined ? chartData.dLbls?.showSerName : undefined // Y
                const serDatalenght = (chartData !== undefined && chartData.serDataList !== undefined) ? chartData.serDataList.length : 0
                const fristSerData = serDatalenght > 0 ? chartData?.serDataList[0] : undefined
                const elChartType = el.chartType ?? chartData?.chartType
                if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') {
                  const data = el.data
                  if (data && data.length > 1) {
                    try {
                      labels = data[0].map(item => item + '')
                      legends = [i18n.global.t('element.series1')]
                      series = [data[1]]
                    } 
                    catch {
                      labels = []
                      legends = []
                      series = [[], []]
                    }

                  }
                  else {
                    labels = []
                    legends = []
                    series = [[], []]
                  }
                }
                else {
                  const data = el.data as ChartItem[]
                  if (data && data.length > 0) {
                    labels = Object.values(data[0].xlabels)
                    legends = data.map(item => item.key)
                    series = data.map(item => item.values.map(v => v.y))
                  }
                  else {
                    labels = []
                    legends = []
                    series = [[], []]
                  }
                }
                const options: ChartOptions = {}
                options.axisY = {showGrid: valAxData === undefined ? true : valAxData?.majorTickMark !== 'none'}
                options.axisX = {showGrid: catAxData === undefined ? true : catAxData?.majorTickMark !== 'none'}
                let chartType: ChartType = 'bar'
                let themeColor: string[] = []
                let firstSerDataColor = undefined
                if (fristSerData && fristSerData !== undefined) {
                  themeColor = fristSerData.dataDPtCollects.flatMap(item => item.dPtColor).filter(item => (item !== undefined && item !== 'none' && item !== '')) as string[]
                  let serDataColor = fristSerData.serSpData?.dPtColor
                  if (serDataColor === undefined || serDataColor === 'none' || serDataColor === '') {
                    serDataColor = fristSerData.serSpData?.borderColor
                  }
                  if (themeColor.length === 0 && serDataColor !== undefined && serDataColor !== 'none' && serDataColor !== '') {
                    themeColor.push(serDataColor)
                  }
                  else if (serDataColor !== undefined && serDataColor !== 'none' && serDataColor !== '') {
                    firstSerDataColor = serDataColor
                  }
                }
                switch (el.chartType) {
                  case 'barChart':
                  case 'bar3DChart':
                    chartType = 'bar'
                    if ((el.barDir ?? chartData?.barDir) === 'bar') options.horizontalBars = true
                    if ((el.grouping ?? chartData?.grouping) === 'stacked' || (el.grouping ?? chartData?.grouping) === 'percentStacked') options.stackBars = true
                    if (serDatalenght === 1 && series.length === 1 && series[0].length > 1) {
                      options.distributeSeries = true
                    }
                    for (let index = 0; index < serDatalenght; index++) {
                      const serData = chartData?.serDataList[index]
                      const dataMat = serData?.dataMat
                      const dataMatFirst = dataMat !== undefined && dataMat.length > 0 ? dataMat[0] : undefined
                      const pptistChart: PPTistChartItem = dataMatFirst === undefined ? undefined : JSON.parse(JSON.stringify(dataMatFirst))
                      const showCatName = (chartShowCatName !== undefined) ? chartShowCatName : pptistChart.dlblsData?.showCatName // X
                      const showSerName = (chartShowSerName !== undefined) ? chartShowSerName : pptistChart.dlblsData?.showSerName // Y
                      if (options.horizontalBars) {
                        if (showCatName !== undefined) {
                          options.axisY.showLabel = showCatName
                        }
                        if (showSerName !== undefined) {
                          options.axisX.showLabel = showSerName
                        }
                      }
                      else {
                        if (showCatName !== undefined) {
                          options.axisX.showLabel = showCatName
                        }
                        if (showSerName !== undefined) {
                          options.axisY.showLabel = showSerName
                        }
                      }
                      if (index > 0 && serData !== undefined) {
                        const dataColor = serData.dataDPtCollects.flatMap(item => item.dPtColor).filter(item => (item !== undefined && item !== 'none' && item !== '')) as string[]
                        let serDataColor = serData.serSpData?.dPtColor
                        if (serDataColor === undefined || serDataColor === 'none' || serDataColor === '') {
                          serDataColor = serData.serSpData?.borderColor
                        }
                        if (dataColor.length === 0) {
                          if (serDataColor !== undefined && serDataColor !== 'none' && serDataColor !== '') {
                            themeColor.push(serDataColor)
                          }
                        }
                        else {
                          themeColor.push(...dataColor)
                        }
                      }
                    }
                    // if (chartData?.gapWidth !== undefined) {
                    //   options.seriesBarDistance = parseInt(chartData.gapWidth)
                    // }
                    if (chartData?.varyColors === undefined || chartData?.varyColors === '0') {
                      if (series.length > 0) {
                        const serie = series[0]
                        const themeColorLength = themeColor.length
                        const firstColor = (themeColorLength > 0 ? themeColor[0] : firstSerDataColor) ?? theme.value.themeColor
                        if (serie.length > themeColorLength) {
                          for (let i = themeColorLength; i < serie.length; i++) {
                            if (i === themeColorLength && firstSerDataColor !== undefined) {
                              themeColor.push(firstSerDataColor)
                            }
                            else {
                              themeColor.push(firstColor)
                            }
                          }
                        }
                      }
                    }
                    break
                  case 'lineChart':
                  case 'line3DChart':
                  case 'areaChart':
                  case 'area3DChart':
                  case 'scatterChart':
                  case 'bubbleChart':
                    chartType = 'line'
                    if (elChartType === 'areaChart' || elChartType === 'area3DChart') options.showArea = true
                    if (elChartType === 'scatterChart' || elChartType === 'bubbleChart') options.showLine = false
                    if (chartData?.marker !== undefined) {
                      options.showPoint = chartData.marker
                    }
                    if (chartData?.smooth !== undefined) {
                      options.lineSmooth = chartData.smooth
                    }
                    for (let index = 0; index < serDatalenght; index++) {
                      const serData = chartData?.serDataList[index]
                      const dataMat = serData?.dataMat
                      const dataMatFirst = dataMat !== undefined && dataMat.length > 0 ? dataMat[0] : undefined
                      const pptistChart: PPTistChartItem = dataMatFirst === undefined ? undefined : JSON.parse(JSON.stringify(dataMatFirst))
                      const showCatName = (chartShowCatName !== undefined) ? chartShowCatName : pptistChart.dlblsData?.showCatName // X
                      const showSerName = (chartShowSerName !== undefined) ? chartShowSerName : pptistChart.dlblsData?.showSerName // Y
                      if (showCatName !== undefined) {
                        options.axisX.showLabel = showCatName
                      }
                      if (showSerName !== undefined) {
                        options.axisY.showLabel = showSerName
                      }
                      if (index > 0 && serData !== undefined) {
                        const dataColor = serData.dataDPtCollects.flatMap(item => item.dPtColor).filter(item => (item !== undefined && item !== 'none' && item !== '')) as string[]
                        const serDataColor = serData.serSpData?.dPtColor
                        if (dataColor.length === 0) {
                          if (serDataColor !== undefined && serDataColor !== 'none' && serDataColor !== '') {
                            themeColor.push(serDataColor)
                          }
                          else {
                            const borderWidth = serData.serSpData?.borderWidth
                            const borderColor = serData.serSpData?.borderColor
                            const borderType = serData.serSpData?.borderType
                            if (borderWidth !== undefined && borderWidth > 0) {
                              if (borderColor !== undefined && borderColor !== 'none') {
                                themeColor.push(borderColor)
                              }
                              else if (borderType !== undefined && borderType !== 'hidden') {
                                themeColor.push(theme.value.themeColor)
                              }
                            }
                          }
                        }
                        else {
                          themeColor.push(...dataColor)
                        }
                      }
                    }
                    break
                  case 'pieChart':
                  case 'pie3DChart':
                  case 'doughnutChart':
                    chartType = 'pie'
                    if (fristSerData) {
                      const dataMat = fristSerData.dataMat
                      const dataMatFirst = dataMat !== undefined && dataMat.length > 0 ? dataMat[0] : undefined
                      const pptistChart: PPTistChartItem = dataMatFirst === undefined ? undefined : JSON.parse(JSON.stringify(dataMatFirst))
                      const showCatName = (chartShowCatName !== undefined) ? chartShowCatName : pptistChart.dlblsData?.showCatName
                      if (showCatName !== undefined) {
                        options.showLabel = showCatName
                      }
                    }
                    if (chartData?.holeSize !== undefined) {
                      const holeSize = parseInt(chartData.holeSize)
                      if (!isNaN(holeSize)) {
                        options.donutWidth = 100 - holeSize
                      }
                    }
                    if (chartData?.firstSliceAng !== undefined && chartData.firstSliceAng !== 0) {
                      options.startAngle = chartData.firstSliceAng
                    }
                    if (elChartType === 'doughnutChart') {
                      options.donut = true
                    }
                    if (themeColor.length > 0) {
                      const firstColor = themeColor[0]
                      if (series.length > 0) {
                        const child = series[0]
                        const total = child.reduce((sum, currentValue) => sum + currentValue, 0)
                        const themeColorLength = themeColor.length
                        if (child.length > themeColorLength) {
                          for (let i = themeColorLength; i < child.length; i++) {
                            if (i === themeColorLength && firstSerDataColor !== undefined) {
                              themeColor.push(firstSerDataColor)
                            }
                            else {
                              const opacity = (child[i] + child[0]) / total
                              themeColor.push(getRandomHexColorWithOpacity(firstColor, opacity))
                            }
                          }
                        }
                      }
                    }
                    break
                  default:
                    break
                }
                let gridColor: string | undefined
                if (catAxData?.majorGridlinesData !== undefined || valAxData?.majorGridlinesData !== undefined) {
                  gridColor = catAxData?.majorGridlinesData?.borderColor || undefined
                  if (!gridColor || gridColor === undefined || gridColor === 'none' || gridColor === '') {
                    gridColor = valAxData?.majorGridlinesData?.borderColor || undefined
                  }
                  // if (!gridColor || gridColor === undefined || gridColor === 'none' || gridColor === '') {
                  //   gridColor = catAxData?.majorGridlinesData?.dPtColor || undefined
                  // }
                  // if (!gridColor || gridColor === undefined || gridColor === 'none' || gridColor === '') {
                  //   gridColor = valAxData?.majorGridlinesData?.dPtColor || undefined
                  // }
                }
                if (!themeColor || themeColor === undefined || themeColor.length <= 0) {
                  themeColor = getFilterValidColors(themeColors, ignoreColors)
                  themeColor.push(theme.value.themeColor)
                }
                if (!gridColor || gridColor === undefined || gridColor === 'none' || gridColor === '') {
                  gridColor = getFilterValidColor(fontColors, ignoreColors) ?? theme.value.fontColor
                }

                const tickLblPosY = valAxData === undefined ? false : valAxData?.tickLblPos === 'nextTo'
                const tickLblPosX = catAxData === undefined ? false : catAxData?.tickLblPos === 'nextTo'
                if (tickLblPosX) {
                  options.axisX.position = 'end'
                  options.axisX.showLabel = true
                }
                if (tickLblPosY) {
                  options.axisY.position = 'start'
                  options.axisY.showLabel = true
                }
                if (valAxData?.lblOffset !== undefined && valAxData.lblOffset !== 0 && chartType === 'line') {
                  options.axisY.offset = valAxData.lblOffset
                }
                else {
                  if (undefined === options.axisY.showLabel || options.axisY.showLabel || chartType === 'pie') {
                    options.axisY.offset = undefined
                  }
                  else {
                    options.axisY.offset = 0
                  }
                }
                if (catAxData?.lblOffset !== undefined && catAxData.lblOffset !== 0 && chartType === 'line') {
                  options.axisX.offset = catAxData.lblOffset
                }
                else {
                  if (undefined === options.axisX.showLabel || options.axisX.showLabel || chartType === 'pie') {
                    options.axisX.offset = undefined
                  }
                  else {
                    options.axisX.offset = 0
                  }
                }

                slide.elements.push({
                  type: 'chart',
                  id: assignElementId(pptistEl, groupId, 'chart'),
                  chartType: chartType,
                  width: el.width,
                  height: el.height,
                  left: el.left,
                  top: el.top,
                  rotate: 0,
                  themeColor,
                  gridColor,
                  data: {
                    labels,
                    legends,
                    series,
                  },
                  options,
                  order: pptistEl?.order
                })
              }
              else if (el.type === 'group') {
                // const isVLT = el.elements.map(_el => ((!isNegativeZero(_el.left) && !isNegativeZero(_el.top)) && (_el.left === 0 || Math.abs(_el.left) >= 1) || (_el.top === 0 || Math.abs(_el.top) >= 1)))
                // const isVWH = el.elements.map(_el => ((!isNegativeZero(_el.width) && !isNegativeZero(_el.height)) && (_el.width === 0 || Math.abs(_el.width) >= 1) || (_el.height === 0 || Math.abs(_el.height) >= 1)))
                const isVLT = el.elements.map(_el => (isElementValidLT(_el.left, _el.top)))
                const isVWH = el.elements.map(_el => (isElementValidWH(_el.width, _el.height)))
                const pptistGroup = (pptistElType === 'group') ? pptistEl : null
                const groupRotate = (pptistGroup && pptistGroup.rotate && pptistGroup.rotStr) ? pptistGroup.rotate : 0
                const specialElement = assemblingSpecialElement(el, pptistGroup, groupRotate, groupId)
                if (specialElement !== undefined && specialElement) {
                  slide.elements.push(specialElement)
                }
                const expandRotate = expandElement ? expandElement.expandRotate : groupRotate
                const expand: PPTXElementExpand = {
                  isValidLT: isVLT,
                  isValidWH: isVWH,
                  expandOrder: ((pptistEl?.order ?? 0) + expandOrder),
                  groupRotate,
                  expandRotate: expandRotate > 0 ? expandRotate : groupRotate,
                  groupExpand: pptistGroup?.expandData,
                }
                const elements = el.elements.map(_el => ({
                  ..._el,
                  // left: _el.left + el.left,
                  // top: _el.top + el.top,
                  left: _el.left + originLeft,
                  top: _el.top + originTop,
                }))
                // const pptistElements = pptistGroup?.elements.map(_el => ({
                //   ..._el,
                //   // left: _el.left + pptistOriginLeft,
                //   // top: _el.top + pptistOriginTop,
                //   order: _el.order + expand.expandOrder,
                // }))
                const pptistElements = pptistGroup?.elements
                parseElements(elements, true, pptistElements, expand, assignElementId(pptistGroup, groupId))
              }
              else if (el.type === 'diagram') {
                const pptistDiagram = (pptistElType === 'diagram') ? pptistEl : undefined
                if (pptistDiagram?.childType === 'pyramid' 
                  && el.elements.length === pptistDiagram.count
                  && pptistDiagram?.childUniqueId && pptistDiagram.childUniqueId.includes('pyramid')) {
                  const pyramidElements: PPTElement[] = parsePyramidElements(el, pptistDiagram, scale, pptistScale, assignElementId(pptistDiagram, groupId), expandOrder, originLeft, originTop)
                  if (pyramidElements.length > 0) {
                    slide.elements.push(...pyramidElements)
                  }
                }
                else {
                  const isVLT = el.elements.map(_el => (isElementValidLT(_el.left, _el.top)))
                  const isVWH = el.elements.map(_el => (isElementValidWH(_el.width, _el.height)))
                  const groupRotate = ((pptistDiagram && pptistDiagram.rotate) ? pptistDiagram.rotate : 0)
                  const expand: PPTXElementExpand = {
                    isValidLT: isVLT,
                    isValidWH: isVWH,
                    expandOrder: ((pptistDiagram?.order ?? 0) + expandOrder),
                    groupRotate: groupRotate,
                    expandRotate: expandRotate > 0 ? expandRotate : groupRotate,
                  }

                  const elements = el.elements.map(_el => ({
                    ..._el,
                    left: _el.left + originLeft,
                    top: _el.top + originTop,
                  }))
                  const pptistElements = pptistDiagram?.elements.map(_el => ({
                    ..._el,
                    // order: _el.order + expand.expandOrder,
                    order: _el.order + pptistDiagram.order,
                  }))
                  parseElements(elements, true, pptistElements, expand, assignElementId(pptistDiagram, ((groupId !== undefined && groupId) ? `${groupId}-d` : 'd')))
                }
              }
            }
          }
          parseElements(item.elements, false, pptistSlide?.elements, undefined, undefined)

          lineConnectorLocation(slide.elements)

          slide.elements.sort((a, b) => {
            const isBackgroundElementA = a.id.includes('b')
            const isBackgroundElementB = b.id.includes('b')
            if (isBackgroundElementA && !isBackgroundElementB) {
              return -1
            }
            if (!isBackgroundElementA && isBackgroundElementB) {
              return 1
            }
            const orderA = ('order' in a && typeof a.order === 'number') ? a.order : 0
            const orderB = ('order' in b && typeof b.order === 'number') ? b.order : 0
            return orderA - orderB
          })
          slides.push(slide)
        }
        // if (isEmptySlide.value) slidesStore.setSlides(slides)
        // else addSlidesFromData(slides)
        slidesStore.setViewportRatio(viewPortRatio)
        slidesStore.setSlideSizeWidth(slideSize.width)
        slidesStore.setTitle(file.name.replace(/\.[^/.]+$/, ''))
        if (slides.length <= 3) {
          const additionalSlide = createAddtionalSlide(slideSize, themeColors, fontColors, viewPortRatio)
          slides.push(additionalSlide)
        }
        slidesStore.setSlides(slides)
      }
      exporting.value = false
    }
    reader.readAsArrayBuffer(file)
  }

  return {
    importPPTXFileFusion,
    exporting,
  }
}