import { computed, type Ref } from 'vue'
import { ClipPath, CLIPPATHS, ClipPathTypes } from '@/configs/imageClip'
import type { ImageElementClip } from '@/types/slides'

export default (clip: Ref<ImageElementClip | undefined>) => {
  const clipShape = computed(() => {
    if (!clip.value) return CLIPPATHS.rect
    const shape = clip.value.shape || ClipPathTypes.RECT
    const radius = clip.value.radius
    const style = clip.value.style
    const clipShape = CLIPPATHS[shape]
    if (clipShape) {
      if (radius) {
        clipShape.radius = radius
      }
      if (style) {
        clipShape.style = style
      }
      return clipShape
    }
    if (shape && style) {
      const customClip = {
        name: shape,
        type: clip.value.type || ClipPathTypes.RECT,
        style: style || '',
        radius,
        createPath: undefined
      }
      return customClip
    }
    return CLIPPATHS.rect
  })

  const imgPosition = computed(() => {
    if (!clip.value) {
      return {
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      }
    }

    const [start, end] = clip.value.range

    const widthScale = (end[0] - start[0]) / 100
    const heightScale = (end[1] - start[1]) / 100
    const left = start[0] / widthScale
    const top = start[1] / heightScale

    return {
      left: -left + '%',
      top: -top + '%',
      width: 100 / widthScale + '%',
      height: 100 / heightScale + '%',
    }
  })

  return {
    clipShape,
    imgPosition,
  }
}