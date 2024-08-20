<template>
  <Screen v-if="screening" />
  <Editor v-else-if="_isPC" />
  <Mobile v-else />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useScreenStore,
  useMainStore,
  useSnapshotStore,
  useSlidesStore
} from '@/store'
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/configs/storage'
import { deleteDiscardedDB } from '@/utils/database'
import { isPC } from './utils/common'

import Editor from './views/Editor/index.vue'
import Screen from './views/Screen/index.vue'
import Mobile from './views/Mobile/index.vue'
import { yjsData, yjsSlides, needYJS } from '@/utils/yjs-init'

const _isPC = isPC()

const mainStore = useMainStore()
const snapshotStore = useSnapshotStore()
const { databaseId } = storeToRefs(mainStore)
const { screening } = storeToRefs(useScreenStore())

if (process.env.NODE_ENV === 'production') {
  window.onbeforeunload = () => false
}

onMounted(async () => {
  await deleteDiscardedDB()
  snapshotStore.initSnapshotDatabase()
  mainStore.setAvailableFonts()
})

// 应用注销时向 localStorage 中记录下本次 indexedDB 的数据库ID，用于之后清除数据库
// window.addEventListener('unload', () => {
//   const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB)
//   const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : []

//   discardedDBList.push(databaseId.value)

//   const newDiscardedDB = JSON.stringify(discardedDBList)
//   localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB)
// })

const slidesStore = useSlidesStore()
slidesStore.sendUpdateData(),
(window as any)['slidesStore'] = slidesStore
// yjsData.observe(() => {
//   const json: any = yjsData.get('info')
//   const { title, theme, slides, slideIndex, viewportRatio } = json
//   if (slides) {
//     slidesStore.$patch({
//       ...{
//         title,
//         theme,
//         slides,
//         slideIndex,
//         viewportRatio
//       }
//     })
//   }
// })
if (needYJS) {
  const { title, theme, slideIndex, viewportRatio } = yjsData.get('info')
  const slides = yjsSlides.toJSON()
  if (slides) {
    slidesStore.$patch({
      ...{
        title,
        theme,
        slides,
        slideIndex,
        viewportRatio
      }
    })
  }
}


</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>
