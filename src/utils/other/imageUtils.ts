import { rgbToString } from './colorUtils'

export const findSvgPath = (svgStr?: string) => {
  if (svgStr === null || svgStr === undefined || svgStr === '') {
    return undefined
  }
  const pathRegex = /<path\s+[^>]*>([\s\S]*?)<\/path>/
  const matches = svgStr.match(pathRegex)

  if (matches && matches.length > 1) {
    return matches[1].trim() // 返回 path 标签内的内容，并去除首尾空格
  }

  return extractPathAndFillFromSvgString(svgStr).path
}

export const extractPathAndFillFromSvg = (svgStr?: string): { path?: string, fill?: string } => {
  if (svgStr === null || svgStr === undefined || svgStr === '') {
    const path = undefined
    const fill = undefined
    return { path, fill }
  }
  // 正则表达式匹配 path 的 d 属性和 fill 属性
  const pathRegex = /<path\s+[^>]*d="([^"]*)"[^>]*>/i
  const fillRegex = /<[^>]*fill="([^"]*)"/i

  // 执行匹配
  const pathMatch = pathRegex.exec(svgStr)
  const fillMatch = fillRegex.exec(svgStr)

  // 提取结果
  const path = (pathMatch && pathMatch.length > 0) ? pathMatch[1] : undefined
  const fill = (fillMatch && fillMatch.length > 0) ? fillMatch[1] : undefined

  if (path !== undefined && path !== null && path !== '') {
    return { path, fill: rgbToString(fill)}
  }
  const domPathFill = extractPathAndFillFromSvgString(svgStr)
  return { path: domPathFill.path, fill: domPathFill.fill }
}

export const extractPathAndFillFromSvgString = (svgStr?: string) => {
  if (svgStr === null || svgStr === undefined || svgStr === '') {
    return {
      path: undefined,
      fill: undefined
    }
  }
  // 创建一个DOMParser实例
  const parser = new DOMParser()
  // 使用DOMParser解析SVG字符串
  const doc = parser.parseFromString(svgStr, 'image/svg+xml')
  // 获取SVG文档中的根元素
  const svgElement = doc.documentElement

  const polygon = doc.querySelector('polygon')
  
  // 初始化存储结果的变量
  let pathData = undefined
  let fillColor = undefined

  // 遍历SVG中的所有<path>元素
  svgElement.querySelectorAll('path').forEach(pathElement => {
    // 获取d属性
    const dAttribute = pathElement.getAttribute('d')
    if (dAttribute) {
      pathData = dAttribute // 只取第一个<path>的d属性
    }
    // 获取fill属性
    const fillAttribute = pathElement.getAttribute('fill')
    if (fillAttribute) {
      fillColor = rgbToString(fillAttribute) // 只取第一个<path>的fill属性
    }
  })

  if (!pathData && polygon) {
    const points = polygon.getAttribute('points')
    if (points) {
      pathData = 'M ' + points.replace(/,/g, ' L ') + ' Z'
      // console.log('pathData :%o', pathData)
    }
  }

  // 返回提取的值
  return {
    path: pathData,
    fill: fillColor
  }
}

export const extractPathFillValues = (svgStr?: string) => {
  if (svgStr === null || svgStr === undefined || svgStr === '') {
    return []
  }
  // 创建一个DOMParser实例
  const parser = new DOMParser()
  // 使用DOMParser解析SVG字符串
  const doc = parser.parseFromString(svgStr, 'image/svg+xml')
  // 获取SVG文档中的根元素
  const svgElement = doc.documentElement
  // 存储所有<path>元素的fill属性
  const pathFillValues: string[] = []

  // 遍历SVG中的所有<path>元素
  svgElement.querySelectorAll('path').forEach(pathElement => {
    // 获取fill属性
    const fillValue = pathElement.getAttribute('fill')
    // 如果fill属性存在，则添加到数组中
    if (fillValue) {
      const color = rgbToString(fillValue)
      if (color) {
        pathFillValues.push(color)
      }
    }
  })

  // 返回所有<path>元素的fill属性值数组
  return pathFillValues
}