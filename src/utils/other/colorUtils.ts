export const addRandomTransparency = (color: string, opacity: number | undefined): string => {
  // 确保十六进制颜色值是有效的
  if (!/^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/.test(color)) {
    return color
  }
  // 移除原颜色值中的透明度部分
  const rgbPart = color.replace(/..$/, '')
  let random
  if (opacity === undefined || opacity <= 0 || opacity >= 1) {
    random = Math.random()
  } 
  else {
    random = opacity
  }
  // 随机生成透明度
  const newOpacity = Math.floor(random * 256).toString(16).padStart(2, '0')
  // 拼接 RGB 部分和新的透明度部分
  return (rgbPart + newOpacity).toLowerCase()
}

export const getRandomHexColorWithOpacity = (color: string, opacity: number | undefined): string => {
  // 确保十六进制颜色值是有效的
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return addRandomTransparency(color, opacity)
  }
  // 去除#号，并转换为大写
  const colorWithoutHash = color.replace('#', '').toUpperCase()
  let random
  if (opacity === undefined || opacity <= 0 || opacity >= 1) {
    random = Math.random()
  }
  else {
    random = opacity
  }
  // 生成一个随机透明度值（00-FF）
  const newOpacity = Math.floor(random * 256).toString(16).padStart(2, '0')
  // 返回带有透明度的16进制颜色值
  return `#${colorWithoutHash.toLowerCase()}${newOpacity.toLowerCase()}`
}

export const rgbToString = (str?: string | undefined) => {
  let result = undefined
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  else if (typeof str !== 'string') {
    return undefined
  }
  else if (str.startsWith('#') && str.indexOf('#') === 0) {
    result = str
  }
  else if (str.startsWith('rgb(') && str.indexOf('rgb(') === 0) {
    const colors = str.replace(/rgb\(/g, '').replace(/\)/g, '').split(',')
    const r = parseInt(colors[0]).toString(16).length === 1 ? '0' + parseInt(colors[0]).toString(16) : parseInt(colors[0]).toString(16)
    const g = parseInt(colors[1]).toString(16).length === 1 ? '0' + parseInt(colors[1]).toString(16) : parseInt(colors[1]).toString(16)
    const b = parseInt(colors[2]).toString(16).length === 1 ? '0' + parseInt(colors[2]).toString(16) : parseInt(colors[2]).toString(16)
    result = `#${r}${g}${b}`
  }
  else if (str.startsWith('rgba(') && str.indexOf('rgba(') === 0) {
    const colors = str.replace(/rgba\(/g, '').replace(/\)/g, '').split(',')
    const r = parseInt(colors[0]).toString(16).length === 1 ? '0' + parseInt(colors[0]).toString(16) : parseInt(colors[0]).toString(16)
    const g = parseInt(colors[1]).toString(16).length === 1 ? '0' + parseInt(colors[1]).toString(16) : parseInt(colors[1]).toString(16)
    const b = parseInt(colors[2]).toString(16).length === 1 ? '0' + parseInt(colors[2]).toString(16) : parseInt(colors[2]).toString(16)
    // const a = parseInt(colors[3]).toString(16).length === 1 ? '0' + parseInt(colors[3]).toString(16) : parseInt(colors[3]).toString(16)
    const aHex = parseFloat(colors[3])
    const alpha = aHex > 1 ? aHex : Math.round(aHex * 255)
    const a = alpha.toString(16).length === 1 ? '0' + alpha.toString(16) : alpha.toString(16)
    result = `#${r}${g}${b}${a}`
  }
  else {
    result = subStrToColor(str)
  }
  return result
}

export const rgbToHex = (r: number, g: number, b: number, a: number) => {
  const rs = r.toString(16).padStart(2, '0')
  const gs = g.toString(16).padStart(2, '0')
  const bs = b.toString(16).padStart(2, '0')
  const as = a.toString(16).padStart(2, '0')

  return `#${rs}${gs}${bs}${as}`
}

export const subStrToColor = (str?: string): string | undefined => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return undefined
  }
  else if (typeof str !== 'string') {
    return subStrToColor(JSON.stringify(str))
  }
  else if (str.startsWith('#') && str.indexOf('#') === 0) {
    if (str.endsWith(';')) {
      str.substring(0, str.length - 1)
    }
    else {
      return str
    }
  }
  else if (str.startsWith('background:') || str.startsWith('"background:')) {
    const endIndex = str.endsWith(';"') ? str.length - 2 : (str.endsWith(';') ? str.length - 1 : str.length)
    const value = str.substring(str.indexOf('#'), endIndex)
    return value
  }
  else if (str.length === 6 || str.length === 8 || str.length === 4 || str.length === 3) {
    return `#${str}`
  }
  return undefined
}

export const subColorToSVGStr = (str?: string): string | null => {
  if (str === null || str === undefined || str === 'none' || Array.isArray(str)) {
    return null
  }
  else if (typeof str !== 'string') {
    return null
  }

  // // 使用正则表达式匹配stroke属性的颜色值
  // const strokeColorRegex = /stroke=['"](#[0-9A-Fa-f]{6})['"]/i
  // const match = str.match(strokeColorRegex)

  // // 如果找到了匹配项，则返回颜色值；否则返回null
  // return match ? match[0].match(/#[0-9A-Fa-f]{6}/)[0] : null
  
  // 使用正则表达式匹配stroke属性的颜色值
  const strokeColorRegex = /stroke=['"](#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{7})['"]/i
  const match = str.match(strokeColorRegex)

  if (match && match.length > 0) {
    const matchChild = match[0].match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{7}/)
    if (matchChild && matchChild.length > 0) {
      return matchChild[0]
    }
  }
  // 如果找到了匹配项，则返回颜色值；否则返回null
  return null

  // // 正则表达式匹配颜色值，这里假设颜色值是#xxxxxx格式
  // const colorRegex = /#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g
  // const matches = str.match(colorRegex)
  // // 如果找到匹配项，返回第一个匹配到的颜色值
  // if (matches && matches.length > 0) {
  //   return matches[0]
  // }
  // // 如果没有找到匹配项，返回null
  // return null
}

export const extractBackgroundColors = (cssStr?: string): string[] => {
  if (cssStr === null || cssStr === undefined || cssStr === 'none' || Array.isArray(cssStr)) {
    return []
  }
  else if (typeof cssStr !== 'string') {
    return []
  }
  const cssClasses = cssStr.split('\n') // 按行分割CSS字符串
  const backgroundColors: string[] = [] // 存储提取的背景颜色

  for (const cssClass of cssClasses) {
    const match = cssClass.match(/background-color:\s*([^;]+)/) // 使用正则表达式匹配background-color值
    if (match && match.length > 0 && match[1]) {
      const color = subStrToColor(match[1].trim()) // 提取颜色值并去除前后的空格
      if (color) {
        backgroundColors.push(color) // 将颜色值添加到数组中
      }
    }
  }
  return backgroundColors.length > 0 ? backgroundColors : extractTableCellBackgroundColors(cssStr)
}

export const extractTableCellBackgroundColors = (cssStr?: string): string[] => {
  if (cssStr === null || cssStr === undefined || cssStr === 'none' || Array.isArray(cssStr)) {
    return []
  }
  else if (typeof cssStr !== 'string') {
    return []
  }
  const cssClasses = cssStr.split('\n') // 按行分割CSS字符串
  const backgroundColors: string[] = [] // 存储提取的背景颜色

  for (const cssClass of cssClasses) {
    const match = cssClass.match(/^.*?_tbl_cell_css_.*\{background-color:\s*([^;]+)\}/) // 使用正则表达式匹配表格单元格背景颜色
    if (match && match.length > 0 && match[1]) {
      const color = subStrToColor(match[1].trim()) // 提取颜色值并去除前后的空格
      if (color) {
        backgroundColors.push(color) // 将颜色值添加到数组中
      }
    }
  }
  return backgroundColors
}

export const extractTextColors = (cssStr?: string): string[] => {
  if (cssStr === null || cssStr === undefined || cssStr === 'none' || Array.isArray(cssStr)) {
    return []
  }
  else if (typeof cssStr !== 'string') {
    return []
  }

  const cssClasses = cssStr.split('\n') // 按行分割CSS字符串
  const colors: string[] = [] // 存储提取的字体颜色

  for (const cssClass of cssClasses) {
    const match = cssClass.match(/color:\s*([^;]+)/) // 使用正则表达式匹配background-color值
    if (match && match.length > 0 && match[1]) {
      const color = subStrToColor(match[1].trim()) // 提取颜色值并去除前后的空格
      if (color) {
        colors.push(color) // 将颜色值添加到数组中
      }
    }
  }

  return colors
}

export const extractFontColors = (cssStr?: string): string[] => {
  if (cssStr === null || cssStr === undefined || cssStr === 'none' || Array.isArray(cssStr)) {
    return []
  }
  else if (typeof cssStr !== 'string') {
    return []
  }

  // 正则表达式匹配颜色值，包括但不限于十六进制、RGB、RGBA、HSL、HSLA等格式
  const colorRegex = /color:\s*([\w#]+|\d+%?|rgba?\(\d+%?,\s*\d+%?,\s*\d+%?(?:,\s*\d+(?:\.\d+)?\))?|hsla?\(\d+,\s*\d+%,\s*\d+%(?:,\s*\d+(?:\.\d+)?\))?)(;|,|\s)/gi
  // 用于存储提取出的颜色集合
  const fontColors: string[] = []
  let match
  while ((match = colorRegex.exec(cssStr)) !== null) {
    if (match && match.length > 0 && match[1]) {
      // 提取颜色值
      const colorValue = subStrToColor(match[1].trim())
      if (colorValue && !fontColors.includes(colorValue)) {
        fontColors.push(colorValue)
      }
    }
  }
  return fontColors.length > 0 ? fontColors : extractTextColors(cssStr)
}

export const extractTextFontColors = (cssStr?: string): string[] => {
  if (cssStr === null || cssStr === undefined || cssStr === 'none' || Array.isArray(cssStr)) {
    return []
  }
  else if (typeof cssStr !== 'string') {
    return []
  }
  const colorRegex = /color:\s*([^;]+)/g // 正则表达式匹配color属性和其值
  const matches = cssStr.matchAll(colorRegex) // 获取所有匹配项
  const fontColors: string[] = [] // 存储提取的颜色值

  for (const match of matches) {
    if (match && match.length > 0 && match[1]) {
      const color = subStrToColor(match[1].trim()) // 提取颜色值并去除前后的空格
      if (color) {
        fontColors.push(color) // 将颜色值添加到数组中
      }
    }
  }
  return fontColors.length > 0 ? fontColors : extractTextColors(cssStr)
}