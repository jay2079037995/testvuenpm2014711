import { nanoid } from 'nanoid'
import type { ShapeGradient, Slide, SlideBackground } from '@/types/slides'
import type { PPTistBorder, PPTistColor, PPTistElement, PPTistGroupExpand, PPTistSize, PPTistTableCell } from '@/types/slidesPPTist'
import { extractBackgroundColors, extractTableCellBackgroundColors, extractTextFontColors, rgbToString, subStrToColor } from '@/utils/other/colorUtils'
import { VIEWPORT_SIZE } from '@/configs/canvas'
import type { ShapePoolItem } from '@/configs/shapes'

// slideFactor: 75 / 914400, fontsizeFactor: 100 / 98,
// 为了方便在web应用中使用，在默认情况下，所有输出的长度值单位都是px（像素），但这个值不一定是正确的，你可能需要根据你的设备情况适当调整 slideFactor 和 fontsizeFactor 参数来获取更准确的结果。或者将这个两个参数全部设置为1，这样输出的将会是原始数据，你可以在此基础上将原数据根据具体情况进行转换。
export const pptx2jsonOptions = {
  slideFactor: 75 / 914400, // 幻灯片尺寸转换因子，默认 96 / 914400
  fontsizeFactor: 100 / 98, // 字号转换因子，默认 100 / 75
}

export const ppt_slide_num_type = '&#slidenum;&#;'
export const ppt_slide_num_type2 = '&amp;#slidenum;&amp;#;'
export const scaling_factor = 1.12
// export const pptist_scale = 0.85

export const getScalingFactor = (scale: number) => {
  const s = getPptistScale(scale)
  if (s >= 1.0) {
    return 1.0
  }
  return scaling_factor
}

export const getPptistScale = (scale: number) => {
  if (scale > 1.0 || scale * scaling_factor > 1.0) {
    return scale
  }
  return scale * scaling_factor
}

/**
 * 判断是否为负零
 * @param num
 * @returns true 负零
 */
export const isNegativeZero = (num: number): boolean => {
  return Object.is(num, -0) || (num === 0 && 1 / num === -Infinity)
}

export const assignElementId = (pptistEl?: PPTistElement | null, groupId?: string | null, type?: string | null): string => {
  let elementId
  try {
    if (pptistEl && null !== pptistEl && pptistEl.id !== null && pptistEl.id !== undefined && pptistEl.id !== '') {
      if (groupId !== undefined && groupId !== null && groupId && groupId !== '') {
        elementId = `${groupId}-${pptistEl.id}`
      }
      else {
        elementId = pptistEl.id
      }
    }
    else if (groupId !== undefined && groupId !== null && groupId && groupId !== '') {
      elementId = `${groupId}-${nanoid(10).replace(/-/g, '')}`
    }
    else {
      elementId = nanoid(10).replace(/-/g, '')
    }
  }
  catch (error) {
    console.error('Error generating ID:', error)
    // 处理错误情况，根据实际需求可能需要抛出异常或返回一个默认值
    elementId = nanoid(10).replace(/-/g, '')
  }
  if (type !== undefined && type !== null && type && type !== '') {
    return `${type}-${elementId}`
  }
  return elementId
}

export const calculateEffectiveSize = (elLeft: number, elTop: number, elWidth: number, elHeight: number, secondary: boolean, 
  pptistElLeft?: number, pptistElTop?: number, pptistElWidth?: number, pptistElHeight?: number, isValidLT?: boolean, isValidWH?: boolean):
  {elwidth: number, elheight: number, elleft: number, eltop: number, secondaryTop: number, secondaryLeft: number, isSameWH: boolean, isSameLT: boolean} => {

  const effectiveT = effectiveProportionT(elTop, pptistElTop)
  const effectiveL = effectiveProportionL(elLeft, pptistElLeft)

  const elwidth = (isPptistElementValid(pptistElWidth) || (pptistElWidth && pptistElWidth <= VIEWPORT_SIZE && !isElementValid(elWidth))) ? (pptistElWidth ?? elWidth) : elWidth
  const elheight = (isPptistElementValid(pptistElHeight) || (pptistElHeight && pptistElHeight <= VIEWPORT_SIZE && !isElementValid(elHeight))) ? (pptistElHeight ?? elHeight) : elHeight
  const elleft = (isPptistElementValid(pptistElTop) && isPptistElementValid(pptistElLeft)) ? (pptistElLeft ?? elLeft) : elLeft
  const eltop = (isPptistElementValid(pptistElTop) && isPptistElementValid(pptistElLeft)) ? (pptistElTop ?? elTop) : elTop

  const secondaryTop = (secondary && effectiveT && effectiveL && (isValidLT !== undefined && isValidLT && isValidWH !== undefined && isValidWH)) ? elTop : eltop
  const secondaryLeft = (secondary && effectiveT && effectiveL && (isValidLT !== undefined && isValidLT && isValidWH !== undefined && isValidWH)) ? elLeft : elleft

  const isSameWH = (Math.abs(elWidth - (pptistElWidth ?? 0)) < 0.1) && (Math.abs(elHeight - (pptistElHeight ?? 0)) < 0.1)
  const isSameLT = (Math.abs(elTop - (pptistElTop ?? 0)) < 0.1) && (Math.abs(elLeft - (pptistElLeft ?? 0)) < 0.1)
  return {elwidth, elheight, elleft, eltop, secondaryTop, secondaryLeft, isSameWH, isSameLT}
  // return {elwidth: elWidth, elheight: elHeight, elleft: elLeft, eltop: elTop, secondaryTop: elTop, secondaryLeft: elLeft, isSameWH, isSameLT}
  // return {elwidth: pptistElWidth!, elheight: pptistElHeight!, elleft: pptistElLeft!, eltop: pptistElTop!, secondaryTop: pptistElTop!, secondaryLeft: pptistElLeft!, isSameWH, isSameLT}
}

/**
 * 
 * @param width 通过两个解析库计算后的宽
 * @param elWidth pptxtojson2 库中的宽
 * @param secondaryLeft 
 * @param secondary 
 * @param isSameWH 
 * @param isValidWH 
 * @param pptistElWidth 
 * @returns 
 */
export const calculateTextTypeWidth = (width: number, elWidth: number, secondaryLeft: number, secondary: boolean, 
  isSameWH: boolean, pptistScale:number, isValidWH: boolean | undefined, fontSize?: number, firstContent?: string): number => {
  const scalingFactor = getScalingFactor(pptistScale)
  const calculateWidth = isSameWH || (secondary && isValidWH) ? elWidth : width
  const scalingWidth = calculateWidth * scalingFactor
  const totalSize = secondaryLeft + scalingWidth + 0.5
  if ((calculateWidth + secondaryLeft <= 0 && totalSize >= 0) || (calculateWidth + secondaryLeft <= VIEWPORT_SIZE && totalSize >= VIEWPORT_SIZE)) {
    return calculateWidth
  }
  else if (totalSize > 0 && totalSize <= VIEWPORT_SIZE) {
    if (fontSize && fontSize > 0 && firstContent) {
      const firstContentWidth = pptistScale * fontSize * firstContent.length * scalingFactor
      if ((firstContentWidth < calculateWidth && firstContent.length < 5) || calculateWidth / firstContentWidth >= 2) {
        return calculateWidth
      }
      return (firstContentWidth < 60 && pptistScale * fontSize < 20) ? scalingWidth : calculateWidth
    }
  }
  return calculateWidth
}

export const isElementValid = (elValue: number): boolean => {
  return (elValue === 0 || Math.abs(elValue) >= 1)
  // return (elValue === 0 || Math.abs(elValue) >= 1) && !isNegativeZero(elValue)
}

export const isPptistElementValid = (pptistElValue?: number): boolean => {
  if (pptistElValue === undefined) {
    return false
  }
  return (pptistElValue === 0 || (Math.abs(pptistElValue) > scaling_factor && Math.abs(pptistElValue) <= VIEWPORT_SIZE)) && !isNegativeZero(pptistElValue)
}

export const isPptistSizeValid = (pptistScale: number, pptistElValue?: number): boolean => {
  if (pptistElValue === undefined) {
    return false
  }
  return isPptistElementValid(pptistElValue * pptistScale)
}

/**
 * el 和 pptist 比例是否在合理范围内
 * @param elValue 
 * @param pptistElValue 
 * @returns 
 */
export const effectiveProportionL = (elLeft: number, pptistElLeft?: number): boolean => {
  if (!isPptistElementValid(pptistElLeft) || !isElementValid(elLeft)) {
    return false
  }
  const proportionL = Number((elLeft / pptistElLeft!).toFixed(2))
  return proportionL >= 0.7 && ((elLeft > 0 && (pptistElLeft ?? 0) > 0) || (elLeft < 0 && (pptistElLeft ?? 0) < 0) || (elLeft === 0 && (pptistElLeft ?? 0) === 0))
}

/**
 * el 和 pptist 比例是否在合理范围内
 * @param elValue 
 * @param pptistElValue 
 * @returns 
 */
export const effectiveProportionT = (elTop: number, pptistElTop?: number): boolean => {
  if (!isPptistElementValid(pptistElTop) || !isElementValid(elTop)) {
    return false
  }
  const proportionT = Number((elTop / pptistElTop!).toFixed(2))
  return proportionT <= 2.0 && ((elTop > 0 && (pptistElTop ?? 0) > 0) || (elTop < 0 && (pptistElTop ?? 0) < 0) || (elTop === 0 && (pptistElTop ?? 0) === 0))
}

export const isElementValidLT = (elLeft: number, elTop: number): boolean => {
  // ((!isNegativeZero(_el.left) && !isNegativeZero(_el.top)) && (_el.left === 0 || Math.abs(_el.left) >= 1) || (_el.top === 0 || Math.abs(_el.top) >= 1))
  return ((!isNegativeZero(elLeft) && !isNegativeZero(elTop)) || elLeft === elTop) && (isElementValid(elLeft) && isElementValid(elTop))
}

export const isElementValidWH = (elWidth: number, elHeight: number): boolean => {
  return ((!isNegativeZero(elWidth) && !isNegativeZero(elHeight)) || elWidth === elHeight) && (isElementValid(elWidth) && isElementValid(elHeight))
}

export const getGroupElementLastId = (elementId: string): string => {
  // 使用split方法按照'-'分割字符串
  const parts = elementId.split('-')
  // 如果分割后的数组有元素，则获取最后一个元素
  return parts.length > 0 ? (parts.pop() ?? elementId) : elementId
}

export const recalculateBorderWidth = (elBorderWidth?: number, pptistBorderWidth?: number, strokeWidth?: number) : number => {
  // const factor = 1.33
  const factor = 1.0
  if ((elBorderWidth === undefined || isNaN(elBorderWidth)) && (pptistBorderWidth === undefined || isNaN(pptistBorderWidth)) && (strokeWidth === undefined || isNaN(strokeWidth))) {
    return factor
  }
  let borderWidth = elBorderWidth
  if (!(pptistBorderWidth === undefined || isNaN(pptistBorderWidth)) && !(strokeWidth === undefined || isNaN(strokeWidth))) {
    if (pptistBorderWidth <= 0 && strokeWidth <= 0) {
      borderWidth = Math.max(Math.abs(pptistBorderWidth), Math.abs(strokeWidth))
    }
    else {
      borderWidth = Math.max(pptistBorderWidth, strokeWidth) * factor
    }
  }
  if (!(elBorderWidth === undefined || isNaN(elBorderWidth))) {
    if (elBorderWidth <= 1) {
      borderWidth = (borderWidth === undefined || isNaN(borderWidth)) ? (elBorderWidth * factor) : borderWidth
    }
    else {
      borderWidth = (borderWidth === undefined || isNaN(borderWidth)) ? (elBorderWidth * factor) : (Math.max((elBorderWidth * factor), borderWidth))
    }
  }
  if (!(strokeWidth === undefined || isNaN(strokeWidth))) {
    if (strokeWidth <= 1) {
      borderWidth = (borderWidth === undefined || isNaN(borderWidth)) ? Math.abs(strokeWidth) : borderWidth
    }
    else {
      borderWidth = (borderWidth === undefined || isNaN(borderWidth)) ? (strokeWidth * factor) : (Math.max((strokeWidth * factor), borderWidth))
    }
  }
  if (!(pptistBorderWidth === undefined || isNaN(pptistBorderWidth))) {
    if (pptistBorderWidth <= 1) {
      borderWidth = (borderWidth === undefined || isNaN(borderWidth)) ? Math.abs(pptistBorderWidth) : borderWidth
    }
    else {
      borderWidth = (borderWidth === undefined || isNaN(borderWidth)) ? (pptistBorderWidth * factor) : (Math.max((pptistBorderWidth * factor), borderWidth))
    }
  }
  return borderWidth || factor
}

/**
 * 有效的path
 * @param elWidth 
 * @param elHeight 
 * @param pathStr 
 * @returns 
 */
export const isValidELSvgPath = (elWidth: number, elHeight: number, custExist: boolean, isForce: boolean, pathStr?: string): boolean => {
  if (pathStr === undefined || pathStr === null || !pathStr || pathStr === '') {
    return false
  }
  if (custExist && !isForce) {
    return false
  }
  const path = pathStr.replace(/^\s+|\s+$/g, '')
  // 正则表达式匹配 M 命令后的坐标
  const moveCommandRegex = /^M([\d.-]+),([\d.-]+)/
  const match = path.match(moveCommandRegex)
  if (match && match.length >= 3) {
    // 将匹配到的字符串转换为数字并添加到结果数组中
    // 匹配成功，提取 x 和 y 坐标
    const x = parseFloat(match[1])
    const y = parseFloat(match[2])
    if (isNaN(x) || isNaN(y)) {
      return false
    }
    return Math.abs(x) <= Math.abs(elWidth * scaling_factor) && Math.abs(y) <= Math.abs(elHeight * scaling_factor)
  }

  const moveCommandRegex1 = /^M([\d.-]+)\s*,\s*([\d.-]+)/
  const match1 = path.match(moveCommandRegex1)
  if (match1 && match1.length >= 3) {
    // 匹配成功，提取 x 和 y 坐标
    const x = parseFloat(match1[1].trim())
    const y = parseFloat(match1[2].trim())
    if (isNaN(x) || isNaN(y)) {
      return false
    }
    return Math.abs(x) <= Math.abs(elWidth * scaling_factor) && Math.abs(y) <= Math.abs(elHeight * scaling_factor)
  }
  return false
}

export const shapeSVGSpecifiedSizeWH = (shape: ShapePoolItem, elWidth: number, elHeight: number, pptistScale: number, 
  isSameWH: boolean, isValidSvgW: boolean, isValidSvgH: boolean, svgTLW?: number, svgTLH?: number) => {
  if (shape.pptxShapeType === 'roundRect' || isSameWH) {
    return { width: elWidth, height: elHeight }
  }
  if (isValidSvgW && isValidSvgH && svgTLW && svgTLH) {
    return { width: svgTLW, height: svgTLH }
  }
  if (elWidth >= VIEWPORT_SIZE || elHeight >= VIEWPORT_SIZE) {
    return { width: elWidth, height: elHeight }
  }
  const scalingFactor = getScalingFactor(pptistScale)
  if (elWidth * scalingFactor >= VIEWPORT_SIZE && elHeight * scalingFactor >= VIEWPORT_SIZE) {
    const scale = Math.min(VIEWPORT_SIZE / elHeight, VIEWPORT_SIZE / elWidth)
    return { width: elWidth * scale, height: elHeight * scale }
  }
  else if (elWidth * scalingFactor >= VIEWPORT_SIZE) {
    const scale = VIEWPORT_SIZE / elWidth
    return { width: elWidth * scale, height: elHeight * scale }
  }
  else if (elHeight * scalingFactor >= VIEWPORT_SIZE) {
    const scale = VIEWPORT_SIZE / elHeight
    return { width: elWidth * scale, height: elHeight * scale }
  }
  return { width: elWidth * scalingFactor, height: elHeight * scalingFactor }       
}

export const isSpecialShapeType = (shapeType?: string) => {
  if (shapeType === undefined || shapeType === null || !shapeType || shapeType === '') {
    return false
  }
  return shapeType === 'arc' || shapeType === 'bracketPair' || shapeType === 'bracePair' ||
    shapeType === 'leftBracket' || shapeType === 'leftBrace' || shapeType === 'rightBrace' ||
    shapeType === 'rightBracket'
}

export const isMustShapeType = (shapeType?: string) => {
  if (shapeType === undefined || shapeType === null || !shapeType || shapeType === '') {
    return false
  }
  return shapeType === 'line' || /Connector/.test(shapeType) || shapeType === 'ellipse' ||
    shapeType === 'roundRect'
}

export const isValidColor = (color: string): boolean => {
  // 使用正则表达式严格匹配颜色格式，这里仅考虑6位和3位的RGB颜色代码
  const colorRegex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
  return colorRegex.test(color) && !color.startsWith('#000') && !color.toUpperCase().startsWith('#FFF')
}

export const parsePxToNumber = (valueWithPx?: string): number | undefined => {
  if (valueWithPx === null || valueWithPx === undefined || valueWithPx === 'none' || valueWithPx === '') {
    return undefined
  }
  // 去除 'px' 单位
  const valueWithoutPx = valueWithPx.replace('px', '')
  // 尝试将字符串转换为数字
  const parsedValue = parseFloat(valueWithoutPx)
  // 检查转换是否成功
  if (isNaN(parsedValue)) {
    // throw new Error('无法将字符串转换为数字')
    return undefined
  }
  return parsedValue
}

export const getFilterValidColor = (colors?: string[], ignoreColors1?: string[], ...ignoreColors2: string[]) => {
  const validColors = getFilterValidColors(colors, ignoreColors1, ...ignoreColors2)
  return validColors.length > 0 ? validColors[0] : undefined
}

export const getFilterValidColors = (colors?: string[], ignoreColors1?: string[], ...ignoreColors2: string[]) => {
  if (!colors || colors.length <= 0) {
    return []
  }
  const filterColors1 = (!ignoreColors1 || ignoreColors1.length <= 0) ? colors : (colors.filter((color) => {
    return !ignoreColors1.includes(color)
  }))

  const filterColors = (!ignoreColors2 || ignoreColors2.length <= 0) ? filterColors1 : (filterColors1.filter((color) => {
    return !ignoreColors2.includes(color)
  }))

  const validColors = filterColors.filter((color) => 
    (color && color.length > 3 && color !== '#000' && color !== '#fff')
  )
  return validColors
}

export const parseBackgroundImage = (str: string | undefined): SlideBackground | undefined => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  if (str.startsWith('background: url(') || str.startsWith('"background: url(')) {
    const regex = /url\((.*?)\)/
    const match = str.match(regex)
    if (match && match.length > 1) {
      const data = match[1].trim()
      if (data && data.startsWith('data:')) {
        return {
          type: 'image',
          image: data,
          imageSize: 'cover',
        }
      }
    }
  }
  return undefined
}

export const extractFontAndThemeColors = (data?: unknown) => {
  if (null === data || data === undefined || !data) {
    return {
      fontColors: undefined,
      themeColors: undefined,
    }
  }
  const cssStr = typeof data === 'string' ? data : JSON.stringify(data)
  const fontColors = extractTextFontColors(cssStr)
  const themeColors = extractBackgroundColors(cssStr)
  
  return {
    fontColors,
    themeColors,
  }
  // return {
  //   fontColor: fontColors.length > 0 ? fontColors[0] : undefined,
  //   themeColor: themeColors.length > 0 ? themeColors[0] : undefined,
  // }
}

export const extractTableCellBgColors = (data?: unknown) => {
  if (null === data || data === undefined || !data) {
    return undefined
  }
  const cssStr = typeof data === 'string' ? data : JSON.stringify(data)
  
  return extractTableCellBackgroundColors(cssStr)
}

export const pptistTextFontSize = (divStr: string, scale: number, fontSize?: number) => {
  // const pptistScale = getPptistScale(scale)
  if (scale <= 0.45) {
    // width > 2200
    scale = scale * (72 / 96) * 1.066
  }
  const fontSizeRegex = /font-size:\s*(\d+(\.\d+)?)px/
  const match = divStr.match(fontSizeRegex)
  if (match) {
    const replacedFont = divStr.replace(/font-size:\s*(\d+(\.\d+)?)/g, (match, p1) => 'font-size:' + Math.round(parseFloat(fontSize ?? p1) * scale))
    // const replacedTop = replacedFont.replace(/top:\s*(\d+(\.\d+)?)/g, (match, p1) => 'top:' + (parseFloat(p1) * pptistScale))
    // const replacedWidth = replacedTop.replace(/width:\s*(\d+(\.\d+)?)/g, (match, p1) => 'width:' + (parseFloat(p1) * pptistScale))
    // console.log('Font size:', replacedFont)
    return replacedFont
  }
  return divStr
}

export const pptistTextFontSizeReduce = (divStr: string, reduceNumber: number) => {
  // const pptistScale = getPptistScale(scale)
  const fontSizeRegex = /font-size:\s*(\d+(\.\d+)?)px/
  const match = divStr.match(fontSizeRegex)
  if (match) {
    const replacedFont = divStr.replace(/font-size:\s*(\d+(\.\d+)?)/g, (match, p1) => 'font-size:' + (parseFloat(p1) - reduceNumber))
    // const replacedTop = replacedFont.replace(/top:\s*(\d+(\.\d+)?)/g, (match, p1) => 'top:' + (parseFloat(p1) * pptistScale))
    // const replacedWidth = replacedTop.replace(/width:\s*(\d+(\.\d+)?)/g, (match, p1) => 'width:' + (parseFloat(p1) * pptistScale))
    // console.log('Font size:', replacedFont)
    return replacedFont
  }
  return divStr
}

export const pptistTBTextFontSize = (divStr: string, fontSize?: number) => {
  const pptistScale = 72 / 96
  const fontSizeRegex = /font-size:\s*(\d+(\.\d+)?)px/
  const match = divStr.match(fontSizeRegex)
  if (match) {
    const replacedFont = divStr.replace(/font-size:\s*(\d+(\.\d+)?)/g, (match, p1) => 'font-size:' + Math.round(parseFloat(fontSize ?? p1) * pptistScale))
    // const replacedTop = replacedFont.replace(/top:\s*(\d+(\.\d+)?)/g, (match, p1) => 'top:' + (parseFloat(p1) * pptistScale))
    // const replacedWidth = replacedTop.replace(/width:\s*(\d+(\.\d+)?)/g, (match, p1) => 'width:' + (parseFloat(p1) * pptistScale))
    // console.log('Font size:', replacedFont)
    return replacedFont
  }
  return divStr
}

export const pptistTableBorder = (stylStr?: string, borderLeft?: PPTistBorder, borderTop?: PPTistBorder, borderRight?: PPTistBorder, borderBottom?: PPTistBorder) : { color: string, width: number, type?: string} | undefined => {
  // const borderLeftValue = pptistBorderValue(borderLeft)
  // if (borderLeftValue !== undefined && borderLeftValue.border && borderLeftValue.color) {
  //   return {
  //     solid: borderLeftValue.color,
  //     border: borderLeftValue.border
  //   }
  // }
  // const borderRightValue = pptistBorderValue(borderRight)
  if (borderLeft !== undefined && borderLeft.width && borderLeft.color) {
    return {
      color: borderLeft.color,
      width: borderLeft.width,
      type: borderLeft.type
    }
  }
  if (borderRight !== undefined && borderRight.width && borderRight.color) {
    return {
      color: borderRight.color,
      width: borderRight.width,
      type: borderRight.type
    }
  }
  // const borderTopValue = pptistBorderValue(borderTop)
  if (borderTop !== undefined && borderTop.width && borderTop.color) {
    return {
      color: borderTop.color,
      width: borderTop.width,
      type: borderTop.type
    }
  }
  // const borderBottomValue = pptistBorderValue(borderBottom)
  if (borderBottom !== undefined && borderBottom.width && borderBottom.color) {
    return {
      color: borderBottom.color,
      width: borderBottom.width,
      type: borderBottom.type
    }
  }
  if (stylStr === null || stylStr === undefined || stylStr === 'none' || stylStr === '') {
    return undefined
  }
  const regex = /border-\s*([^;]*?):\s*([^;]*?)\s*solid\s*([^;]*?);/g
  const match = regex.exec(stylStr)

  if (match && match.length > 3) {
    const borderStr = match[2].trim()
    const matchBorder = parsePxToNumber(borderStr)
    return {
      color: match[3].trim(),
      width: matchBorder ? matchBorder : parseFloat(borderStr),
      type: undefined
    }
  }
  return undefined // 或抛出错误，根据需要处理
}

export const pptistTableColStyl = (stylStr: string | undefined): { [key: string]: string } => {
  if (stylStr === null || stylStr === undefined || stylStr === 'none' || stylStr === '') {
    return {}
  }

  const borderRegex = /border-(top|right|bottom|left):\s*(\d+(\.\d+)?px)\s*solid\s*#([0-9A-Fa-f]{6,7})/g
  const matches = stylStr.matchAll(borderRegex)
  const borders: { [key: string]: string } = {}

  for (const match of matches) {
    const [, side, width, color] = match
    borders[side] = `width: ${width}, color: #${color}`
  }

  return borders
}

export const pptistBorderValue = (borderStr: string | undefined) => {
  if (borderStr === null || borderStr === undefined || borderStr === 'none' || borderStr === '') {
    return undefined
  }
  const regex = /^(\d+(?:\.\d+)?)px\s+(dotted|solid)\s+#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/
  const match = regex.exec(borderStr)
  if (match && match.length > 3) {
    return {
      border: parsePxToNumber(match[1].trim()),
      type: match[2].trim(),
      color: match[3].trim()
    }
  }
  return undefined
}

export const pptistRgbToString = (str?: string) => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  else if (typeof str !== 'string') {
    const pptistColor: PPTistColor = JSON.parse(JSON.stringify(str))
    const colors = pptistColor.color
    const color = colors[0]
    if (color.indexOf('#') === 0) {
      return color
    }
    return `#${color}`
  }
  return rgbToString(str)
}

export const pptistToGradient = (str?: string) => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  else if (typeof str !== 'string') {
    const pptistColor: PPTistColor = JSON.parse(JSON.stringify(str))
    const colors = pptistColor.color
    if (colors.length >= 2) {
      const first = `#${colors[0]}`
      // const second = `#${colors[1]}`
      const second = `#${colors[1]}`
      const rotate = pptistColor.rot
      const gradient: ShapeGradient = {
        type: 'linear',
        color: [first, second],
        rotate: rotate
      }
      return gradient
    }
    return undefined
  }
  return undefined
}

export const pptistSubStrToColor = (str?: string) => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  else if (typeof str !== 'string') {
    return subStrToColor(JSON.stringify(str))
  }
  
  return subStrToColor(str)
}

export const pptistShapeFillImage = (str?: string) => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  else if (typeof str === 'string' && (str.startsWith('data:image') || str.startsWith('"data:image'))) {
    return str
  }
  return undefined
}

export const pptistSVGExistStroke = (str?: string): boolean => {
  if (str === null || str === undefined || str === 'none') {
    return true
  }
  const { stroke, strokeWidth } = pptistSVGSubStroke(str)
  return pptistSVGVaildStroke(stroke, strokeWidth)
}

export const pptistSVGVaildStroke = (stroke?: string, strokeWidth?: number): boolean => {
  if (stroke && stroke !== undefined && strokeWidth !== undefined && !isNaN(strokeWidth)) {
    if ((stroke && stroke.length > 3 && stroke !== 'none') && (strokeWidth > 0 || strokeWidth === -2)) {
      return true
    }
  }
  return false
}

export const pptistSVGSubStroke = (str?: string) => {
  if (str === null || str === undefined || str === 'none') {
    return {
      stroke: undefined,
      strokeWidth: undefined,
    }
  }
  else if (typeof str === 'string') {
    const strokeRegex = /stroke=['"]([^'"]+)['"]/i
    const strokeWidthRegex = /stroke-width=['"]([^'"]+)['"]/i

    const strokeMatch = str.match(strokeRegex)
    const strokeWidthMatch = str.match(strokeWidthRegex)

    const strokeWidth = (strokeWidthMatch && strokeWidthMatch.length > 0) ? strokeWidthMatch[1] : undefined
    const stroke = (strokeMatch && strokeMatch.length > 0) ? strokeMatch[1] : undefined

    if (strokeWidth !== undefined) {
      const width = parseFloat(strokeWidth)
      
      if (!isNaN(width)) {
        return {
          stroke: stroke,
          strokeWidth: width
        }
      }
      else if (strokeWidth === 'NaN') {
        return {
          stroke: stroke,
          strokeWidth: -2
        }
      }
    }
    
    return {
      stroke: stroke,
      strokeWidth: undefined
    }
  }
  return {
    stroke: undefined,
    strokeWidth: undefined,
  }
}

export const extractStylesFromDiv = (divStr?: string, groupExpand?: PPTistGroupExpand): { top?: number, left?: number, width?: number, height?: number, 
  fontSize?: number, fontFamily?: string, fontColor?: string, textAlign?: string, verticalAlign?: string} => {
  const defaultValue = {top: undefined, left: undefined, width: undefined, height: undefined, fontSize: undefined, 
    fontFamily: undefined, fontColor: undefined, textAlign: undefined, verticalAlign: undefined}
  if (divStr === null || divStr === undefined || divStr === 'none') {
    return defaultValue
  }

  // 创建一个DOMParser实例
  const parser = new DOMParser()
  // 解析HTML字符串为DOM文档
  const doc = parser.parseFromString(divStr, 'text/html')
  if (doc === undefined || doc === null || doc.body === undefined || doc.body === null) {
    return defaultValue
  }
  // 获取最外层的div元素
  const outerDiv = doc.body.firstChild as HTMLElement
  if (outerDiv === undefined || outerDiv === null) {
    return defaultValue
  }
  // 获取style属性并分割为数组
  const styleAttributeStr = outerDiv.getAttribute('style')
  if (styleAttributeStr === undefined || styleAttributeStr === null) {
    return defaultValue
  }
  const styleAttributes = styleAttributeStr.split(';')
  // 创建一个对象来存储提取的样式值
  const extractedStyles: { [key: string]: string } = {}
  // 遍历style属性中的每个属性
  if (styleAttributes !== undefined && styleAttributes) {
    for (const attribute of styleAttributes) {
      // 跳过空属性或只包含空格的属性
      if (attribute === null || attribute === undefined || attribute.trim() === '') continue
      // 分割属性名和属性值
      const [property, value] = attribute.trim().split(':')
      // 将提取的样式值存储在对象中
      if (value && property) {
        extractedStyles[property.trim()] = value.trim()
      }
    }
  }
  // 提取特定的样式值
  const top = parsePxToNumber(extractedStyles['top'] || undefined)
  const left = parsePxToNumber(extractedStyles['left'] || undefined)
  const width = parsePxToNumber(extractedStyles['width'] || undefined)
  const height = parsePxToNumber(extractedStyles['height'] || undefined)
  let fontSize: number | undefined
  let fontColor: string | undefined
  let textAlign: string | undefined
  let verticalAlign: string | undefined
  let fontFamily: string | undefined
  // 获取文档中所有的 <span> 元素
  const sapnElements = doc.querySelectorAll('sapn')
  // 遍历这些元素，查找匹配的样式
  sapnElements.forEach((sapnElement) => {
    // 获取元素的 style 属性
    let element = (sapnElement as HTMLElement | null)
    if (element === undefined || element === null || element.style === undefined || element.style === null) {
      const className = sapnElement.className
      // 查询具有特定类名的元素
      element = doc.querySelector(className) as HTMLElement | null
    }
    const style = element?.style
    if (style !== null && style !== undefined && style) {
      const styleFontSize = parsePxToNumber(style.fontSize)
      const styleFontColor = pptistRgbToString(style.color)
      // font-size: 18px; font-family: "Lato Black"; 
      if (styleFontSize !== undefined && !isNaN(styleFontSize)) {
        fontSize = styleFontSize
      }
      if (styleFontColor !== undefined && styleFontColor !== null && styleFontColor) {
        fontColor = styleFontColor
      }
      // text-align: center; vertical-align: middle;
      textAlign = style.textAlign
      verticalAlign = style.verticalAlign
      fontFamily = style.fontFamily
      if (!fontFamily || fontFamily === '' || !fontColor || fontColor === '' || !fontSize || fontSize <= 0) {
        const { size, family, color } = extractStyleInfo(sapnElement.outerHTML)
        if (family && family !== '' && (!fontFamily || fontFamily === '')) {
          fontFamily = family
        }
        if (size && size > 0 && (!fontSize || fontSize <= 0)) {
          fontSize = size
        }
        if (color && color !== '' && (!fontColor || fontColor === '')) {
          fontColor = color
        }
      }
    }
  })
  return {top, left, width, height, fontSize, fontFamily, fontColor, textAlign, verticalAlign}
}

export const extractStyleInfo = (styleStr?: string): { size?: number, family?: string, color?: string } => {
  const defaultValue = { size: undefined, family: undefined, color: undefined }
  if (styleStr === null || styleStr === undefined || styleStr === 'none') {
    return defaultValue
  }
  // 正则表达式，用于匹配样式属性
  const styleRegex = /style="([^"]*)"/
  const match = styleStr.match(styleRegex)
  if (match && match.length > 1) {
    // 提取样式属性的具体值
    const styleAttribute = match[1]
    const fontSizeRegex = /font-size:\s*(\d+px);?/
    // const fontSizeRegex = /font-size:\s*([^;]+);/
    const fontFamilyRegex = /font-family:\s*([^;]*);?/
    // const colorRegex = /color:\s*#([A-Fa-f0-9]+);?/
    const colorRegex = /color:\s*([#A-Fa-f0-9]+);?/
    // const colorRegex = /color:\s*([#a-fA-F0-9]+)/
    // const colorRegex = /color:\s*([^;]+)/g

    const fontSizeMatch = styleAttribute.match(fontSizeRegex)
    const fontFamilyMatch = styleAttribute.match(fontFamilyRegex)
    const colorMatch = styleAttribute.match(colorRegex)

    // 返回提取的样式信息
    return {
      size: fontSizeMatch && fontSizeMatch.length > 1 ? parsePxToNumber(fontSizeMatch[1]) : undefined,
      family: fontFamilyMatch && fontFamilyMatch.length > 1 ? fontFamilyMatch[1] : undefined,
      color: colorMatch && colorMatch.length > 1 ? pptistRgbToString(colorMatch[1]) : undefined
    }
  }
  return defaultValue
}

export const isNumberString = (str?: string): boolean => {
  if (str === null || str === undefined || str === 'none') {
    return false
  }
  // 使用正则表达式判断字符串是否完全由数字组成
  const regex = /^\d+$/
  return regex.test(str)
}

// 判断是否有显示的内容
export const hasVisibleTextContent = (divStr: string): {hasVisibleContent: boolean, firstContent?: string, rows: number} => {
  if (divStr === null || divStr === undefined || divStr === 'none') {
    return {hasVisibleContent: false, firstContent: undefined, rows: 0}
  }
  // 创建一个新的DOMParser实例
  const parser = new DOMParser()
  // 使用DOMParser解析HTML字符串
  const doc = parser.parseFromString(divStr, 'text/html')
  // 获取body元素，通常HTML内容都在这里
  const body = doc.body

  // 遍历body内的所有文本节点
  const traverseTextNodes = (node: Node): {hasContent: boolean, textContent?: string, rows: number} => {
    if (node.nodeType === Node.TEXT_NODE) {
      // 检查文本节点内容是否非空且非只包含空白字符
      const textContent = node.textContent?.trim()
      if (textContent && textContent !== '') {
        // 如果找到可见文本内容，则返回true
        return {hasContent: true, textContent, rows: 1}
      }
    }
    else {
      // 递归遍历子节点
      let fristContent = undefined
      let tatolRows = 0
      const length = node === undefined ? 0 : node.childNodes.length
      for (let i = 0; i < length; i++) {
        const {hasContent, textContent, rows} = traverseTextNodes(node.childNodes[i])
        if (hasContent) {
          if (fristContent === undefined) {
            fristContent = textContent
          }
          tatolRows += rows
          if (tatolRows > 2) {
            return {hasContent: true, textContent: fristContent, rows: tatolRows}
          }
        }
        if (fristContent !== undefined && i === length - 1) {
          return {hasContent: true, textContent: fristContent, rows: tatolRows}
        }
      }
    }
    // 如果没有找到可见文本内容，则返回false
    return {hasContent: false, textContent: undefined, rows: 0}
  }
  // 从body开始遍历
  const {hasContent, textContent, rows} = traverseTextNodes(body)
  return {hasVisibleContent: hasContent, firstContent: textContent, rows}
}

export const extractSVGStyleProperties = (svgStr?: string, groupExpand?: PPTistGroupExpand): { top?: number, left?: number, width?: number, height?: number } => {
  if (svgStr === null || svgStr === undefined || svgStr === 'none') {
    return {
      top: undefined,
      left: undefined,
      width: undefined,
      height: undefined,
    }
  }

  // 正则表达式匹配 style 属性值
  const styleRegex = /style='([^']*?)'/
  const styleMatch = styleRegex.exec(svgStr)
  if (!styleMatch || styleMatch.length <= 0) {
    // 如果没有找到 style 属性，返回空对象
    return {
      top: undefined,
      left: undefined,
      width: undefined,
      height: undefined,
    }
  }

  // 提取 style 属性值
  const styleValue = styleMatch[1]

  // 正则表达式匹配 top, left, width, height 属性值
  const propertyRegex = /(top|left|width|height):\s*([^;]+)/g
  const properties: { [key: string]: string } = {}
  let match

  while ((match = propertyRegex.exec(styleValue)) && match.length > 1) {
    properties[match[1]] = match[2]
  }

  const top = parsePxToNumber(properties.top)
  const left = parsePxToNumber(properties.left)
  const width = parsePxToNumber(properties.width)
  const height = parsePxToNumber(properties.height)

  if (top === undefined || top < 0 || left === undefined || left < 0 || width === undefined || width < 0 || height === undefined || height < 0) {
    return extractSVGStyleValues(svgStr, groupExpand)
  }

  // 返回匹配到的属性对象
  return {
    top,
    left,
    width,
    height,
  }
}

export const extractSVGStyleValues = (svgStr?: string, groupExpand?: PPTistGroupExpand): { left?: number, top?: number, width?: number, height?: number } => {
  if (svgStr === null || svgStr === undefined || svgStr === 'none') {
    return {
      top: undefined,
      left: undefined,
      width: undefined,
      height: undefined,
    }
  }
  // 创建一个新的 DOMParser 实例
  const parser = new DOMParser()
  // 使用 DOMParser 解析 SVG 字符串
  const doc = parser.parseFromString(svgStr, 'image/svg+xml')
  // 获取 SVG 元素
  const svgElement = doc.documentElement as unknown as SVGElement
  // 获取 style 属性
  const styleAttributes = svgElement.getAttribute('style')?.split(';')
  // 创建一个对象来存储提取的样式值
  const extractedStyles: { [key: string]: string } = {}
  // 如果 style 属性存在
  if (styleAttributes) {
    for (const attribute of styleAttributes) {
      // 跳过空属性或只包含空格的属性
      if (attribute === undefined || attribute.trim() === '') continue
      // 分割属性名和属性值
      const [property, value] = attribute.trim().split(':')
      // 将提取的样式值存储在对象中
      if (value && property) {
        extractedStyles[property.trim()] = value.trim()
      }
    }
  }
  
  // 提取特定的样式值
  const top = parsePxToNumber(extractedStyles['top'] || undefined)
  const left = parsePxToNumber(extractedStyles['left'] || undefined)
  const width = parsePxToNumber(extractedStyles['width'] || undefined)
  const height = parsePxToNumber(extractedStyles['height'] || undefined)
  
  return {
    top,
    left,
    width,
    height,
  }
}

/**
 * 判断是否一条线
 * @param width 
 * @param height 
 * @returns 
 */
export const isWidthHeightLine = (width: number, height: number): boolean => {
  if ((Math.abs(width) >= 1 && Math.abs(height) < 1) || (Math.abs(width) < 1 && Math.abs(height) >= 1)) {
    return true
  }
  return false
}


export const calculateWHLTRotate = (oldLeft: number, oldTop: number, oldWidth: number, oldHeight: number, rotate: number): { rotatedLeft: number, rotatedTop: number, rotatedWidth: number, rotatedHeight: number } => {
  if (rotate === 90) {
    // 计算旋转中心的坐标
    const centerX = oldLeft + oldWidth / 2
    const centerY = oldTop + oldHeight / 2
    // 计算旋转后左上角的坐标
    const rotatedTop = centerY - (oldWidth / 2)
    const rotatedLeft = centerX - (oldHeight / 2)
    return {
      rotatedLeft,
      rotatedTop,
      rotatedWidth: oldHeight,
      rotatedHeight: oldWidth,
    }
  }
  // else if (rotate === 180) { // 应该和0旋转结果一样
  //   // 计算旋转中心的坐标
  //   const centerX = oldLeft + oldWidth / 2
  //   const centerY = oldTop + oldHeight / 2
  //   // 计算旋转后左上角的坐标
  //   const rotatedLeft = centerX - oldWidth / 2 // 从中心点减去新宽度的一半
  //   const rotatedTop = centerY - oldHeight / 2 // 从中心点减去新高度的一半
  //   return {
  //     rotatedLeft,
  //     rotatedTop,
  //     rotatedWidth: oldWidth,
  //     rotatedHeight: oldHeight,
  //   }
  // }
  // else if (rotate === 270) { // 应该和90旋转结果一样
  //   // 计算中心点坐标
  //   const centerX = oldLeft + oldWidth / 2
  //   const centerY = oldTop + oldHeight / 2
  //   // 计算旋转270度后的新位置
  //   // 旋转270度相当于先旋转180度再旋转90度
  //   // 旋转180度后的左上角坐标
  //   const newCenterX180 = centerX - oldLeft - oldWidth
  //   const newCenterY180 = centerY - oldTop - oldHeight
  //   // 从旋转180度后的中心点再减去新的高度的一半和新的宽度的一半
  //   const newLeft270 = newCenterX180 - oldHeight / 2
  //   const newTop270 = newCenterY180 + oldWidth / 2
  //   // 旋转270度后，宽高互换
  //   return {
  //     rotatedLeft: newLeft270,
  //     rotatedTop: newTop270,
  //     rotatedWidth: oldHeight,
  //     rotatedHeight: oldWidth,
  //   }
  // }
  // if (rotate === 0 || rotate === 360) {
  return {
    rotatedLeft: oldLeft,
    rotatedTop: oldTop,
    rotatedWidth: oldWidth,
    rotatedHeight: oldHeight,
  }
  // }
}

/**
 * 等腰三角形的高和底边求三个角的度数
 * @param width 三角型底边长
 * @param height  三角型垂直于底边的高度
 * @returns 顶角，两个底角，腰边
 */
export const calculateTriangleAngles = (width: number, height: number): { topCorner: number, bottomA: number, bottomB: number, longSide: number } => {
  // 计算等腰三角形的一半底边
  const halfWidth = width / 2
  // 使用勾股定理计算等腰三角形的一边（即腰）的长度
  const side = Math.sqrt(Math.pow(halfWidth, 2) + Math.pow(height, 2))
  // 计算顶角A的正切值，并转换为角度
  const tanA = height / halfWidth
  const angleAInRadians = Math.atan(tanA) // 将弧度转换为角度
  const angleAInDegrees = (angleAInRadians * 180) / Math.PI // 两个底角之一 左边
  const angleA = Number((Math.atan(tanA) * (180 / Math.PI)).toFixed(3)) // 两个底角之一 左边
  // 由于等腰三角形的两个底角相等，且三个角的和为180度，因此可以直接计算底角B和C
  const angleB = angleA // 两个底角之一 右边
  const angleC = (180 - angleA - angleB)
  const angleCHInRadians = halfWidth === 0 ? Math.PI / 2 : Math.atan(halfWidth / height)// 将弧度转换为角度
  const angleCHInDegrees = (angleCHInRadians * 180) / Math.PI // 顶角度数的一半
  // 返回角度对象
  return {topCorner: angleC, bottomA: angleA, bottomB: angleB, longSide: side}
}

/**
 * 直角三角形中已知三个角的度数和一个直角边，求另外两个边
 * @param angle 锐角的度数
 * @param adjacentSide  直角边长度
 * @returns 锐角对面直角边，斜边
 */
export const calculateRightTriangleSides = (angle: number, adjacentSide: number): { oppositeSide: number; hypotenuse: number } => {
  // 将角度转换为弧度
  const angleInRadians = (angle * Math.PI) / 180
  // 计算对边长度（使用正弦函数）
  const oppositeSide = adjacentSide * Math.tan(angleInRadians) // 对边
  // 计算斜边长度（使用余弦函数）
  const hypotenuse = adjacentSide / Math.cos(angleInRadians) // 斜边
  // 返回对边和斜边的长度
  return { oppositeSide, hypotenuse }
}

export const transformTextToUppercase = (htmlString: string): string => {
  if (htmlString.includes('text-transform') && htmlString.includes('uppercase')) {
    htmlString = htmlString.replace(/(<sapn[^>]*>)(.*?)(<\/sapn>)/g, (match, p1, p2, p3) => {
      const nbspRegex = /&nbsp;/g
      const htmlWithPlaceholder = p2.replace(nbspRegex, ' ')
      const upperCaseText = htmlWithPlaceholder.toUpperCase()
      return `${p1}${upperCaseText}${p3}`
    })
  }
  return htmlString
}

export const extractTextShadowColor = (htmlString: string): string | null => {

  const spanRegex = /<sapn\b[^>]*>.*?<\/sapn>/g
  const spanRegex2 = /<span\b[^>]*>.*?<\/span>/g
  const matchSpan = htmlString.match(spanRegex)
  const matchSpan2 = htmlString.match(spanRegex2)
  const match = htmlString.match(/text-shadow:([^;]+);/)
  if (match && (!matchSpan || matchSpan.length === 1) && (!matchSpan2 || matchSpan2.length === 1)) {
    const shadowValue = match[1].trim()
    const colorMatch = shadowValue.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{8}/)
    if (colorMatch) {
      return colorMatch[0]
    }
  }
  return null
}

export const isSpecialUlHTML = (htmlString: string): boolean => {
  if (htmlString.startsWith('<ul>') && htmlString.endsWith('</ul>')) {
    return true
  }
  else if (htmlString.startsWith('<ol>') && htmlString.endsWith('</ol>')) {
    return true
  }
  return false
}


export const calculateColWidthProportion = (data: PPTistTableCell[]): number[] => {
  let totalColWidth = 0
  data.forEach(cell => {
    totalColWidth += cell.colWidth
  })
  const proportions: number[] = []
  data.forEach(cell => {
    const proportion = cell.colWidth / totalColWidth
    proportions.push(proportion)
  })

  return proportions
}

export const createAddtionalSlide = (pptSize: PPTistSize, themeColors: string[] = [], fontColors: string[] = [], viewPortRatio: number): Slide => {


  const height = 1000 * viewPortRatio

  // const fontColor = getFirstNonBlackOrWhiteColor(fontColors)

  // const themeColor = getFirstNonBlackOrWhiteColor(themeColors)

  // console.log('createAddtionalSlide:  ', pptSize, themeColors, fontColors, themeColor, fontColor)

  const additionalSlides: Slide =
  {
    id: 'template',
    elements: [
      {
        type: 'text',
        id: 'ptNnUJ',
        left: 145,
        top: 148,
        width: 711,
        height: 77,
        lineHeight: 1.2,
        content: '<p style=\'text-align: center;\'><strong><span style=\'font-size: 48px\'>在此处添加标题</span></strong></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#000000',
      },
      {
        type: 'text',
        id: 'mRHvQN',
        left: 207.50000000000003,
        top: 249.84259259259264,
        width: 585,
        height: 56,
        content: '<p style=\'text-align: center;\'><span style=\'font-size: 24px\'>在此处添加副标题</span></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#000000',
      },
      {
        type: 'line',
        id: '7CQDwc',
        left: 323.09259259259267,
        top: 238.33333333333334,
        start: [0, 0],
        end: [354.8148148148148, 0],
        points: ['', ''],
        color: '#2aba8a',
        style: 'solid',
        width: 4
      },
      {
        type: 'shape',
        id: '09wqWw',
        left: -0.648148148148138,
        top: height - 163,
        width: 1000.2962962962963,
        height: 162.96296296296296,
        viewBox: [200, 200],
        path: 'M 0 20 C 40 -40 60 60 100 20 C 140 -40 160 60 200 20 L 200 180 C 140 240 160 140 100 180 C 40 240 60 140 0 180 L 0 20 Z',
        fill: '#2aba8a',
        fixedRatio: false,
        rotate: 0
      }
    ],
    background: {
      type: 'solid',
      color: '#FFFFFF',
    },
    name: '图形模版'
  }


  return additionalSlides
}


function getFirstNonBlackOrWhiteColor(themeColors: string[]): string {

  const blackColors = /^#(?:0{3}|0{6})$/i
  const whiteColors = /^#(?:F{3}|F{6})$/i

  for (const color of themeColors) {
    if (!blackColors.test(color) && !whiteColors.test(color)) {
      return color
    }
  }
  return themeColors[0]
}

export const replaceIndexSlide = (content: string, index: string): string => {

  if (content.includes(ppt_slide_num_type)) {
    content = content.replace(ppt_slide_num_type, index)
  }

  else if (content.includes(ppt_slide_num_type2)) {
    content = content.replace(ppt_slide_num_type2, index)
  }

  return content

}





