import { computed, type Ref } from 'vue'
import type { ShapeGradient } from '@/types/slides'

// 计算边框相关属性值，主要是对默认值的处理
export default (gradient: Ref<ShapeGradient | undefined>) => {
  const backgroundStyle = computed(() => {
    const gradientType = gradient.value?.type ?? ''
    const rotate = gradient.value?.rotate ?? 0
    const color1 = gradient.value?.color[0] || ''
    const color2 = gradient.value?.color[1] || ''
  
    if (gradientType === '' || color1 === '' || color2 === '') {
      return ''
    }

    if (gradientType === 'radial') {
      return `radial-gradient(${color1}, ${color2})`
    }
    
    return `linear-gradient(${rotate}deg, ${color1}, ${color2})`
  })

  return {
    backgroundStyle,
  }
}