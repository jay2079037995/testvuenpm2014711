import { computed, type Ref } from 'vue'

// 计算元素的翻转样式
export default (viewBox: Ref<[number, number] | undefined>, width: Ref<number | undefined>, height: Ref<number | undefined>) => {
  const scaleW = computed(() => {
    const viewBoxW = viewBox.value?.[0] ?? 0
    const w = width.value ?? 0
    let scale = 1
    if (viewBoxW === 0 || isNaN(viewBoxW) || w === 0 || isNaN(w) ) {
      scale = 1
    }
    else {
      scale = w / viewBoxW
    }
    
    return scale
  })
  const scaleH = computed(() => {
    const viewBoxH = viewBox.value?.[1] ?? 0
    const h = height.value ?? 0
    let scale = 1
    if (viewBoxH === 0 || isNaN(viewBoxH) || h === 0 || isNaN(h) ) {
      scale = 1
    }
    else {
      scale = h / viewBoxH
    }
    return scale
  })
  return {scaleW, scaleH}
}