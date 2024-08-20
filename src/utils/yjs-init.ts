import * as Y from 'yjs'
// import {
//   withYHistory,
//   withYjs,
//   YjsEditor,
//   withYCursors,
//   CursorData,
//   useRemoteStates
// } from '@editablejs/plugin-yjs'
import { WebsocketProvider } from '@editablejs/yjs-websocket'
import { nanoid } from 'nanoid'
import { useMainStore, useSlidesStore } from '@/store'
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { parseQueryString } from './query'
import { Return } from '@icon-park/vue-next'
// import useSlideHandler from '@/hooks/useSlideHandler'
// const {
//   createSlideByTemplate,
// } = useSlideHandler()

const yjsUuid = parseQueryString().id || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'][~~(Math.random() * 26)] + nanoid(10)
let yjsData: any = null
let yjsSlides: any = null
let yjsFle: any = null
let yDoc: any = null
let useSlideHandler: any = null
let onInitCompleted:() => void
let needYJS = false
let slidesStore:any = null
let slideSelectedId:string
let activeElementIds:any
const yjsColor = (~~(200 * Math.random())) * 255 * 255 + (~~(150 * Math.random())) * 255 + (~~(200 * Math.random()))

const yjsRegistUseSlideHandler = (target:any) => {
  useSlideHandler = target
}


const inited = (isSynced:any) => {
  if (isSynced) {
    needYJS = true
    console.log('init yjs isSynced!')
    yjsSlides = yDoc.getArray('slides')
    if (!yjsData.has('info')) {
      const defaultSlides = defaultFile.slides // .slice(2, 3)
      defaultFile.slides = [] 
      yjsData.set('info', defaultFile)
      defaultSlides.forEach((v:any) => {
        yjsAddSlide(v)
      })
    }
    yjsFle = yjsData.get('info')
    addListeners()
    onInitCompleted && onInitCompleted()
  }
  slidesStore = useSlidesStore()
  const {slideIndex} = storeToRefs(slidesStore)
  // watch(() => {
  //   const index = slideIndex.value
  //   const slide = slidesStore.slides[index]
  //   console.log('watch change!', slide.id)
  //   return slide.id
  // }, () => {
  //   console.log('index:', slideIndex.value)
  //   slideSelectedId = slidesStore.slides[slideIndex.value].id
  //   changeEditorSlectedSlideIndex()
  // }, {
  //   immediate: true
  // })

  const mainStore = useMainStore()
  const {
    activeElementIdList,
  } = storeToRefs(mainStore)
  
  watch(() => [slidesStore.slides[slideIndex.value].id, activeElementIdList.value], () => {
    console.log('index:', slideIndex.value)
    console.log('active group element id:', activeElementIdList.value)
    slideSelectedId = slidesStore.slides[slideIndex.value].id
    activeElementIds = activeElementIdList.value
    changeEditorSlectedSlideIndex()
  }, {
    immediate: true
  })
}

const addListeners = () => {
  const slides = yDoc.getArray('slides')
  slides.observe((e:any) => {
    const it = e.delta.length === 1 ? e.delta[0] : e.delta[1]
    if (it.insert) {
      const slideInfo = it.insert[0]
      const slide = slideInfo.toJSON()
      const index = getSlideIndexById(slide.id)
      console.log('add file', slide, index) 
      addSlideListener(slideInfo)
      if (slide.auth !== yjsUuid) {
        const selctedSlideId = slidesStore.slides[slidesStore.slideIndex].id
        useSlideHandler.createSlideByTemplate(slide, index, slide.id)
        for (let i = 0; i < slidesStore.slides.length; i++) {
          if (slidesStore.slides[i].id === selctedSlideId) {
            slidesStore.updateSlideIndex(i)
            break
          }
        }
      }
      else {
        useSlideHandler.createSlideByTemplate(slide, index, slide.id)
      }
    }
    if (it.delete) {
      const ids = []
      for (let i = 0; i < slidesStore.allSlides.length; i++) {
        if (getSlideIndexById(slidesStore.allSlides[i].id) === -1) {
          ids.push(slidesStore.allSlides[i].id)
        }
      }
      if (ids.length) {
        useSlideHandler.deleteSlide(ids)
      }
    }
  })
  for (let i = 0; i < slides.length; i++) {
    addSlideListener(slides.get(i))
  }
  const editors = yDoc.getArray('editors')
  editors.observe((e:any) => {
    onSlideEditorChange()
  })
}

const onSlideEditorChange = () => {
  const editors = yDoc.getArray('editors')
  for (let i = 0; i < slidesStore.slides.length; i++) {
    const list = []
    for (let j = 0; j < editors.length; j++) {
      if (editors.get(j).slideId === slidesStore.slides[i].id) {
        if (list.length < 5) {
          list.push(editors.get(j))
        }
      }
    }
    slidesStore.slides[i].editors = list
  }
}

const changeEditorSlectedSlideIndex = () => {
  // slideSelectedIndex
  yDoc.transact(() => {
    const editors = yDoc.getArray('editors')
    for (let i = 0; i < editors.length; i++) {
      if (editors.get(i).uuid === yjsUuid) {
        editors.delete(i)
        break
      }
    }
    editors.push([{ uuid: yjsUuid, slideId: slideSelectedId, color: yjsColor, elements: activeElementIds }])
  })
}

const setEditorElementInput = (elementId:string, range:any) => {
  if (!needYJS) return
  if (activeElementIds.length === 1 && activeElementIds[0] === elementId) {
    yDoc.transact(() => {
      const editors = yDoc.getArray('editors')
      for (let i = 0; i < editors.length; i++) {
        if (editors.get(i).uuid === yjsUuid) {
          editors.delete(i)
          break
        }
      }
      if (range === null) {
        editors.push([{ uuid: yjsUuid, slideId: slideSelectedId, color: yjsColor, elements: activeElementIds}])
      }
      else {
        editors.push([{ uuid: yjsUuid, slideId: slideSelectedId, color: yjsColor, elements: activeElementIds, inputRange: range }])
      }
    })
  }
}

const slideListeners:any = {}

const addSlideListener = (slide:any) => {
  if (slideListeners[slide.get('id')]) {
    return
  }
  slideListeners[slide.get('id')] = true
  slide.observe((e:any) => {
    console.log(e)
    e.changes.keys.forEach((v:any, k:string) => {
      if (k === 'deleteEditor') {
        const storeSlide = getStoreSlideById(slide.get('id'))
        storeSlide.deleteEditor = slide.get('deleteEditor')
        console.log('storeSlide deleted:', storeSlide.deleteEditor, storeSlide)
      }
      if (k === 'background') {
        const storeSlide = getStoreSlideById(slide.get('id'))
        storeSlide.background = slide.get('background')
        console.log('storeSlide background:', storeSlide.background, storeSlide)
      }
      if (k === 'turningMode') {
        const storeSlide = getStoreSlideById(slide.get('id'))
        storeSlide.turningMode = slide.get('turningMode')
        console.log('storeSlide turningMode:', storeSlide.turningMode, storeSlide)
      }
    })
  })
  slide.get('animations').observe((e:any) => {
    const storeSlide = getStoreSlideById(slide.get('id'))
    storeSlide.animations = slide.get('animations').toJSON()
    console.log('storeSlide animations:', storeSlide.animations, storeSlide)
  })
  slide.get('elements').observe((e:any) => {
    const it = e.delta.length === 1 ? e.delta[0] : e.delta[1]
    if (it.insert) {
      const elementInfo = it.insert[0]
      const element = elementInfo.toJSON()
      console.log('add element', element, slide.get('id'))
      const ele = getElement(slide.get('id'), element.id)
      addElementListener(slide.get('id'), ele)
      slidesStore.addElement(element, slide.get('id'))
      // useSlideHandler.createSlideByTemplate(slide, -1, slide.id)
    }
    if (it.delete) {
      const ids = []
      const storeSlide = getStoreSlideById(slide.get('id'))
      for (let i = 0; i < storeSlide.elements.length; i++) {
        if (!getElement(storeSlide.id, storeSlide.elements[i].id)) {
          ids.push(storeSlide.elements[i].id)
        }
      }
      if (ids.length) {
        console.log('deleteElements:', ids, slide.get('id'))
        slidesStore.deleteElement(ids, slide.get('id'))
        // useSlideHandler.deleteSlide(ids)
      }
    }
  })
  for (let i = 0; i < slide.get('elements').length; i++) {
    const element = slide.get('elements').get(i)
    addElementListener(slide.get('id'), element)
  }
}

const yjsUpdateTurnningMode = (slideId:string, mode:string) => {
  if (!needYJS) return
  const slide = getSlideById(slideId)
  if (slide) {
    slide.set('turningMode', mode)
  }
}

const yjsUpdateAnimations = (slideId:string, animations:any[]) => {
  if (!needYJS) return
  const slide = getSlideById(slideId)
  if (slide) {
    yDoc.transact(() => {
      const anims = slide.get('animations')
      anims.delete(0, anims.length)
      anims.insert(0, animations)
    })
  }
}

const getElement = (slideId:string, elementId:string) => {
  const slide = getSlideById(slideId)
  if (slide) {
    for (let i = 0; i < slide.get('elements').length; i++) {
      if (slide.get('elements').get(i).get('id') === elementId) {
        return slide.get('elements').get(i)
      }
    }
  }
}

const yjsAddElement = (slideId:string, elementInfo: any | any[]) => {
  if (!needYJS) {
    return
  }
  const slide = getSlideById(slideId)
  if (slide) {
    const elements = slide.get('elements')
    if (elementInfo instanceof Array) {
      console.log('add elements:', elementInfo)
    }
    else {
      if (getElement(slideId, elementInfo.id)) {
        return
      }
      console.log('add element:', elementInfo.id)
      const element = new Y.Map()
      // for (const k in elementInfo) {
      //   element.set(k, elementInfo[k])
      // }
      const e = elementInfo
      for (const k in e) {
        if (e.type === 'table' && k === 'data') {
          element.set('size', Math.random() + '')
          const rows = new Y.Array()
          for (let y = 0; y < e.data.length; y++) {
            const row = new Y.Array()
            for (let x = 0; x < e.data[y].length; x++) {
              const grid = new Y.Map()
              for (const k2 in e.data[y][x]) {
                if (k2 === 'text') {
                  const text = new Y.Text()
                  text.insert(0, e.data[y][x][k2])
                  grid.set(k2, text)
                } 
                else {
                  grid.set(k2, e.data[y][x][k2])
                }
              }
              row.push([grid])
            }
            rows.push([row])
          }
          element.set(k, rows)
        }
        else if (e.type === 'text' && k === 'content') {
          const xml = new Y.XmlFragment()
          element.set(k, xml)
          if (e[k] === '') {
            e[k] = '<p style=\'text-align: center;\'><span style=\'font-size: 12px;\'></span></p>'
          }
          if (e[k]) {
            stringToXML(xml, e[k])
          }
          element.set('sourceContent', e[k])
        }
        else {
          element.set(k, e[k])
        }
      }
      elements.push([element])
      addElementListener(slideId, element)
    }
  }
}

const yjsDeleteElement = (slideId:string, elementId:string | any[]) => {
  if (!needYJS) return
  const slide = getSlideById(slideId)
  if (slide) {
    const elements = slide.get('elements')
    if (elementId instanceof Array) {
      yDoc.transact(() => {
        for (let j = 0; j < elementId.length; j++) {
          for (let i = 0; i < elements.length; i++) {
            if (elements.get(i).get('id') === elementId[j]) {
              elements.delete(i, 1)
              break
            }
          }
        }
      })
    }
    else {
      for (let i = 0; i < elements.get(i); i++) {
        if (elements.get(i).get('id') === elementId) {
          elements.delete(i, 1)
          break
        }
      }
    }
  }
}

const yjsUpdateElement = (slideId:string, element:any) => {
  console.log('update element:', element)
}

const yjsUpdateSlide = (slideId:string) => {
  console.log('update slide:', getStoreSlideById(slideId))
  const storeSlide = getStoreSlideById(slideId)
  for (let i = 0; i < storeSlide.elements.length; i++) {
    const element = getElement(storeSlide.id, storeSlide.elements[i].id)
    if (!element) continue
    const elementJSON = element.toJSON()
    for (const k in elementJSON) {
      if (elementJSON.type === 'text' && k === 'content') continue
      element.set(k, storeSlide.elements[i][k])
    }
  }
}

const elementListeners:any = {}
const addElementListener = (slideId:string, element:any) => {
  if (elementListeners[slideId + ':' + element.get('id')]) {
    return
  }
  console.log('add element listener, slideId:', slideId, 'elementId:', element.get('id'))
  elementListeners[slideId + ':' + element.get('id')] = true
  element.observe((arg0:any, arg1:any) => {
    console.log('element change!', arg0, arg1)
    const slide = getStoreSlideById(slideId)
    const storeElement = getStroeElementById(slide, element.get('id'))
    arg0.changes.keys.forEach((v:any, k:string) => {
      console.log(slideId, element.get('id'), k, v)
      if (!element.has(k)) {
        delete storeElement[k]
      }
      else {
        storeElement[k] = element.get(k)
      }
    })
  })
  if (element.get('type') === 'table') {
    addTableGridListener(slideId, element)
  }
  if (element.get('type') === 'text') {
    addTextListener(slideId, element)
  }
}

let onTableTextChange:any = null
const yjsSetTableTextChangeBack = (call:any) => {
  onTableTextChange = call
}

const tableListeners:any = {}
const addTableGridListener = (slideId:string, element:any) => {
  if (!tableListeners[element.get('id')]) {
    tableListeners[element.get('id')] = {}
  }
  const data = element.get('data')
  const keys = {} as any
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data.get(y).length; x++) {
      keys[x + '_' + y] = true
      if (!tableListeners[element.get('id')][x + '_' + y]) {
        tableListeners[element.get('id')][x + '_' + y] = true
        data.get(y).get(x).observe((arg0:any, arg1:any) => {
          console.log('table grid change:', element.get('id'), data.get(y).get(x).toJSON(), arg0, arg1)
        })
        data.get(y).get(x).get('text').observe((arg0:any, arg1:any) => {
          console.log('table grid text change:', element.get('id'), data.get(y).get(x).get('text').toJSON(), arg0, arg1)
          const slide = getStoreSlideById(slideId)
          for (let p = 0; p < slide.elements.length; p++) {
            if (slide.elements[p].id === element.get('id')) {
              slide.elements[p].data[y][x].text = data.get(y).get(x).get('text').toJSON()
              onTableTextChange && onTableTextChange(slide.elements[p].id, slide.elements[p].data[y][x].id, data.get(y).get(x).get('text').toJSON())
            }
          }
        })
      }
    }
  }
}

let onTextChange:any = null
const yjsSetTextChangeBack = (call:any) => {
  onTextChange = call
}

const addTextListener = (slideId:string, element:any) => {
  element.get('content').observeDeep((arg0:any, arg1:any) => {
    console.log('yjs text change!', element.get('content').toJSON())
    const slide = getStoreSlideById(slideId)
    for (let p = 0; p < slide.elements.length; p++) {
      if (slide.elements[p].id === element.get('id')) {
        slide.elements[p].content = element.get('content').toJSON()
        onTextChange && onTextChange(slide.elements[p].id, element.get('content').toJSON())
      }
    }
  })
}

const getTableCellById = (element:any, cellId:string):any => {
  for (let y = 0; y < element.get('data').length; y++) {
    for (let x = 0; x < element.get('data').get(y).length; x++) {
      if (element.get('data').get(y).get(x).get('id') === cellId) {
        return element.get('data').get(y).get(x)
      }
    }
  }
}

const yjsGetTextXML = (elementId:string):any => {
  for (let i = 0; i < yjsSlides.length; i++) {
    for (let j = 0; j < yjsSlides.get(i).get('elements').length; j++) {
      if (yjsSlides.get(i).get('elements').get(j).get('id') === elementId) {
        const slide = getElementById(yjsSlides.get(i).get('id'), elementId)
        return slide.get('content')
      }
    }
  }
  return null
}

const yjsEditTableTextInsert = (elementId:string, cellId:string, pos:number, addText:string, deleteText:string) => {
  if (!needYJS) return
  const slideId = slidesStore.slides[slidesStore.slideIndex].id
  const element = getElementById(slideId, elementId)
  yDoc.transact(() => {
    const cell = getTableCellById(element, cellId)
    const text = cell.get('text')
    if (deleteText.length) {
      text.delete(pos, deleteText.length)
    }
    if (addText !== '') {
      text.insert(pos, addText)
    }
  })
}

const editElementText = (elementId:string, text:string) => {
  const slideIndex = slidesStore.slideIndex
  console.log('editElementText', elementId, text, slideIndex)
  const slideId = slidesStore.slides[slidesStore.slideIndex].id
  for (let i = 0; i < yjsSlides.length; i++) {
    const slide = yjsSlides.get(i)
    if (slide.get('id') === slideId) {
      for (let j = 0; j < slide.get('elements').length; j++) {
        const element = slide.get('elements').get(j)
        if (element.get('id') === elementId) {
          // console.log('find element', element.toJSON())
          element.set('content', text)
        }
      }
    }
  }
}

const yjsSetSlideAttributes = (props:any) => {
  if (!needYJS) return
  const slideIndex = slidesStore.slideIndex
  const slideId = slidesStore.slides[slidesStore.slideIndex].id
  const slide = getSlideById(slideId)
  yDoc.transact(() => {
    Object.keys(props).forEach((k:string) => {
      slide.set(k, props[k])
    })
  })
}

const yjsSetSlidesBackground = (background:any) => {
  if (!needYJS) Return
  yDoc.transact(() => {
    for (let i = 0; i < yjsSlides.length; i++) {
      const slide = yjsSlides.get(i)
      slide.set('background', background)
    }
  })
}

const yjsSetElementAttributes = (elementId:string, props:any) => {
  if (!needYJS) return
  const slideIndex = slidesStore.slideIndex
  console.log('yjsSetElementAttribute', elementId, props, slideIndex)
  const slideId = slidesStore.slides[slidesStore.slideIndex].id
  for (let i = 0; i < yjsSlides.length; i++) {
    const slide = yjsSlides.get(i)
    if (slide.get('id') === slideId) {
      for (let j = 0; j < slide.get('elements').length; j++) {
        const element = slide.get('elements').get(j)
        if (element.get('id') === elementId) {
          // console.log('find element', element.toJSON())
          // element.set(attributeName, value)
          yDoc.transact(() => {
            Object.keys(props).forEach((k:string) => {
              if (k === 'data') {
                console.error('????')
              }
              element.set(k, props[k])
            })
          })
        }
      }
    }
  }
}

const yjsDeleteElementAttributes = (elementId:string, props:string[]) => {
  if (!needYJS) return
  const slideIndex = slidesStore.slideIndex
  console.log('yjsDeleteElementAttribute', elementId, props, slideIndex)
  const slideId = slidesStore.slides[slidesStore.slideIndex].id
  for (let i = 0; i < yjsSlides.length; i++) {
    const slide = yjsSlides.get(i)
    if (slide.get('id') === slideId) {
      for (let j = 0; j < slide.get('elements').length; j++) {
        const element = slide.get('elements').get(j)
        if (element.get('id') === elementId) {
          props.forEach((k) => {
            element.delete(k)
          })
        }
      }
    }
  }
}

const getSlideIndexById = (id:string):number => {
  let index = -1
  for (let i = 0; i < yjsSlides.length; i++) {
    if (yjsSlides.get(i).get('id') === id) {
      index = i
      break
    }
  }
  return index
}

const getSlideById = (id:string):any => {
  for (let i = 0; i < yjsSlides.length; i++) {
    if (yjsSlides.get(i).get('id') === id) {
      return yjsSlides.get(i)
    }
  }
}

const getElementById = (slideId:string, elementId:string):any => {
  for (let i = 0; i < yjsSlides.length; i++) {
    if (yjsSlides.get(i).get('id') === slideId) {
      const slide = yjsSlides.get(i)
      for (let j = 0; j < slide.get('elements').length; j++) {
        if (slide.get('elements').get(j).get('id') === elementId) {
          return slide.get('elements').get(j)
        }
      }
    }
  }
} 

const getStoreSlideById = (id:string):any => {
  for (let i = 0; i < slidesStore.slides.length; i++) {
    if (slidesStore.slides[i].id === id) {
      return slidesStore.slides[i]
    }
  }
}

const getStroeElementById = (slide:any, id:string):any => {
  for (let i = 0; i < slide.elements.length; i++) {
    if (slide.elements[i].id === id) {
      return slide.elements[i]
    }
  }
}

const yjsDeleteSlides = (ids:string[]) => {
  yDoc.transact(() => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < yjsSlides.length; j++) {
        if (yjsSlides.get(j).get('id') === ids[i]) {
          yjsSlides.get(j).set('deleteEditor', yjsUuid)
          j--
          break
        }
      }
    }
  })
  yDoc.transact(() => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < yjsSlides.length; j++) {
        if (yjsSlides.get(j).get('id') === ids[i]) {
          yjsSlides.delete(j)
          j--
          break
        }
      }
    }
  })
}

const yjsAddSlide = (v:any, index = -1) => {
  console.log('ready to add slide', v)
  const file = new Y.Map()
  v.id = nanoid(10)
  file.set('id', v.id)
  file.set('auth', yjsUuid)
  file.set('background', v.background)
  file.set('turningMode', v.turningMode === undefined ? 'slideX' : v.slideY)
  const animations = new Y.Array()
  file.set('animations', animations)
  if (v.animations) {
    animations.insert(0, v.animations)
  }
  const elements = new Y.Array()
  file.set('elements', elements)
  v.elements.forEach((e:any) => {
    const element = new Y.Map()
    elements.push([element])
    e.id = nanoid(6)
    for (const k in e) {
      if (e.type === 'table' && k === 'data') {
        element.set('size', Math.random() + '')
        const rows = new Y.Array()
        for (let y = 0; y < e.data.length; y++) {
          const row = new Y.Array()
          for (let x = 0; x < e.data[y].length; x++) {
            const grid = new Y.Map()
            for (const k2 in e.data[y][x]) {
              if (k2 === 'text') {
                const text = new Y.Text()
                text.insert(0, e.data[y][x][k2])
                grid.set(k2, text)
              } 
              else {
                grid.set(k2, e.data[y][x][k2])
              }
            }
            row.push([grid])
          }
          rows.push([row])
        }
        element.set(k, rows)
      }
      else if (e.type === 'text' && k === 'content') {
        const xml = new Y.XmlFragment()
        element.set(k, xml)
        stringToXML(xml, e[k])
        element.set('sourceContent', e[k])
      }
      else {
        element.set(k, e[k])
      }
    }
  })
  if (index === -1) {
    yjsSlides.push([file])
  }
  else {
    yjsSlides.insert(index, [file])
  }
  console.log('添加 yjs 页面', file.toJSON())
  addSlideListener(file)
}


const stringToXML = (res:Y.XmlFragment, xmlString:string):Y.XmlFragment => {
  // const xmlString = '<paragraph align="center" indent="0" textIndent="0">aa<fontsize fontsize="40px"><strong>12</strong></fontsize>221</paragraph>'
  // const res = new Y.XmlFragment()
  xmlString = '<p>' + xmlString + '</p>'
  xmlString = xmlString.replaceAll('&nbsp;', ' ')
  const parser = new DOMParser()
  let xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  xmlDoc = xmlDoc.childNodes[0] as any
  const check = (s:any, parent:any, styles:any[]) => {
    const addStyles:any[] = []
    if (s.nodeType === 3) {
      // 需要最终处理的文字
      const text = new Y.XmlText()
      const cfg = {} as any
      for (let i = 0; i < styles.length; i++) {
        cfg[styles[i].name] = styles[i].value
      }
      text.insert(0, s.textContent, cfg)
      parent.insert(parent.length, [text])
    }
    else if (s.nodeType === 1) {
      if (s.tagName === 'p') {
        const xml = new Y.XmlElement()
        parent.insert(parent.length, [xml])
        xml.nodeName = 'paragraph'
        for (let i = 0; i < s.attributes.length; i++) {
          if (s.attributes[i].name === 'style') {
            const st = s.attributes[i].value.split(';')
            for (let s = 0; s < st.length; s++) {
              if (st[s].indexOf(':') === -1) {
                continue
              }
              const styleItem = st[s].split(':')
              const styleName = delBeforeEndSpace(styleItem[0])
              const styleValue = delBeforeEndSpace(styleItem[1])
              if (styleName === 'text-align') {
                xml.setAttribute('align', styleValue)
              }
              else {
                console.error('p 解析 style 出错：', styleName, styleValue)
              }
            }
          }
          else {
            console.error('解析属性出错：', s.attributes[i].name, s.attributes[i].value)
            // xml.setAttribute(s.attributes[i].name, s.attributes[i].value)
          }
        }
        parent = xml
      }
      else if (s.tagName === 'span' || s.tagName === 'sapn' || s.tagName === 'div') {
        for (let i = 0; i < s.attributes.length; i++) {
          if (s.attributes[i].name === 'style') {
            const st = s.attributes[i].value.split(';')
            for (let s = 0; s < st.length; s++) {
              if (st[s].indexOf(':') === -1) {
                continue
              }
              const styleItem = st[s].split(':')
              const styleName = delBeforeEndSpace(styleItem[0])
              const styleValue = delBeforeEndSpace(styleItem[1])
              if (styleName === 'font-size') {
                styles.push({'name': 'fontsize', 'value': {'fontsize': styleValue}})
                addStyles.push({'name': 'fontsize', 'value': {'fontsize': styleValue}})
              }
              else if (styleName === 'color') {
                // <forecolor color="rgba(215,16,16,1)">2</forecolor>
                // color: #ffffff
                if (styleValue.indexOf('#') !== -1) {
                  if (styleValue.split('#')[1].length === 6) {
                    const c = +('0x' + styleValue.split('#')[1])
                    const r = ~~(c / (256 * 256))
                    const g = ~~((c % (256 * 256)) / 256)
                    const b = c % 256
                    const v = `rgba(${r},${g},${b},1)`
                    styles.push({'name': 'forecolor', 'value': { 'color': v }})
                    addStyles.push({'name': 'forecolor', 'value': { 'color': v }})
                  }
                  else if (styleValue.split('#')[1].length === 8) {
                    const c = +('0x' + styleValue.split('#')[1])
                    const r = ~~(c / (256 * 256 * 256))
                    const g = ~~((c % (256 * 256 * 256)) / 256)
                    const b = ~~((c % (256 * 256)) / 256)
                    const a = (c % 256) / 255
                    const v = `rgba(${r},${g},${b},${a})`
                    styles.push({'name': 'forecolor', 'value': { 'color': v }})
                    addStyles.push({'name': 'forecolor', 'value': { 'color': v }})
                  }
                  else {
                    console.error('错误的颜色位数', styleValue.split('#')[1])
                  }
                }
                else {
                  console.error('解析颜色出错！')
                }
              }
              else {
                console.error('解析 style 出错：', styleName, styleValue)
                // styles.push({'name': styleName, 'value': styleValue})
                // addStyles.push({'name': styleName, 'value': styleValue})
              }
            }
          }
        }
      }
      else if (s.tagName === 'strong') {
        styles.push({'name': 'strong', 'value': true})
        addStyles.push({'name': 'strong', 'value': true})
      }
      else {
        console.error('解析 xml 出错，没有处理的 tagName:', s.tagName)
      }
      for (let i = 0; i < s.childNodes.length; i++) {
        check(s.childNodes[i], parent, styles)
      }
    }
    else {
      console.error('解析 xml 出错，没有处理的 nodeType:', s.nodeType)
    }
    while (addStyles.length) {
      styles.pop()
      addStyles.pop()
    }
  }
  for (let i = 0; i < xmlDoc.children.length; i++) {
    check(xmlDoc.children[i], res, [])
  }
  return res
}

const delBeforeEndSpace = (str:string):string => {
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== ' ') {
      str = str.slice(i, str.length)
      break
    }
  }
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] !== ' ') {
      str = str.slice(0, i + 1)
      break
    }
  }
  return str
}

const yjsSortSlide = (oldIndex:number, newIndex:number) => {
  console.log('sort slide:', oldIndex, newIndex)
}

const defaultFile = {
  'title': '未命名演示文稿',
  'theme': {
    'themeColor': '#2aba8a',
    'fontColor': '#202124',
    'fontName': 'Microsoft Yahei',
    'backgroundColor': '#fff',
    'shadow': {
      'h': 3,
      'v': 3,
      'blur': 2,
      'color': '#808080'
    },
    'outline': {
      'width': 2,
      'color': '#d9d9d9',
      'style': 'solid'
    }
  },
  'slides': [
    {
      'id': 'test-slide-1',
      'elements': [
        {
          'type': 'text',
          'id': 'idn7Mx',
          'left': 40,
          'top': 30,
          'width': 291,
          'height': 58.390625,
          'lineHeight': 1.2,
          'content': '<p><strong><span style=\'font-size:  36px\'>Demo</span></strong></p>',
          'rotate': 0,
          'defaultFontName': 'Microsoft Yahei',
          'defaultColor': '#333'
        },
        {
          'type': 'text',
          'id': '7stmVP',
          'left': 655,
          'top': 20,
          'width': 300,
          'height': 80,
          'content': '<p><span style=\'font-size:  18px\'>Brief description of your service, product, or proposal.</span></p>',
          'rotate': 0,
          'defaultFontName': 'Microsoft Yahei',
          'defaultColor': '#333'
        },
        {
          'type': 'image',
          'fixedRatio': true,
          'src': 'imgs/bg-home.png',
          'id': 'FnpZs4',
          'left': 60,
          'top': 120,
          'width': 880,
          'height': 410,
          'rotate': 0
        }
      ],
      'background': {
        'type': 'solid',
        'color': '#ffffff'
      }
    },
    {
      'id': 'test-slide-2',
      'elements': [
        {
          'type': 'text',
          'id': 'ptNnUJ',
          'left': 145,
          'top': 148,
          'width': 711,
          'height': 77.59375,
          'lineHeight': 1.2,
          'content': '<p style=\'text-align: center;\'><strong><span style=\'font-size: 48px\'>在此处添加标题</span></strong></p>',
          'rotate': 0,
          'defaultFontName': 'Microsoft Yahei',
          'defaultColor': '#333'
        },
        {
          'type': 'text',
          'id': 'mRHvQN',
          'left': 207.50000000000003,
          'top': 249.84259259259264,
          'width': 585,
          'height': 56,
          'content': '<p style=\'text-align: center;\'><span style=\'font-size: 24px;\'>在此处添加test副标题123</span></p>',
          'rotate': 0,
          'defaultFontName': 'Microsoft Yahei',
          'defaultColor': '#333'
        },
        {
          'type': 'line',
          'id': '7CQDwc',
          'left': 323.09259259259267,
          'top': 238.33333333333334,
          'start': [
            0,
            0
          ],
          'end': [
            354.8148148148148,
            0
          ],
          'points': [
            '',
            ''
          ],
          'color': '#2aba8a',
          'style': 'solid',
          'width': 4
        },
        {
          'type': 'shape',
          'id': '09wqWw',
          'left': 0,
          'top': 422.73148148148147,
          'width': 1000.2962962962963,
          'height': 162.96296296296296,
          'viewBox': [
            200,
            200
          ],
          'path': 'M 0 20 C 40 -40 60 60 100 20 C 140 -40 160 60 200 20 L 200 180 C 140 240 160 140 100 180 C 40 240 60 140 0 180 L 0 20 Z',
          'fill': '#2aba8a',
          'fixedRatio': false,
          'rotate': 0
        }
      ],
      'background': {
        'type': 'solid',
        'color': '#fff'
      }
    },
    {
      'id': 'test-slide-3',
      'elements': [
        {
          'type': 'shape',
          'id': 'vSheCJ',
          'left': 183.5185185185185,
          'top': 175.5092592592593,
          'width': 605.1851851851851,
          'height': 185.18518518518516,
          'viewBox': [
            200,
            200
          ],
          'path': 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
          'fill': '#2aba8a',
          'fixedRatio': false,
          'rotate': 0
        },
        {
          'type': 'shape',
          'id': 'Mpwv7x',
          'left': 211.29629629629628,
          'top': 201.80555555555557,
          'width': 605.1851851851851,
          'height': 185.18518518518516,
          'viewBox': [
            200,
            200
          ],
          'path': 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
          'fill': '#2aba8a',
          'fixedRatio': false,
          'rotate': 0,
          'opacity': 0.7
        },
        {
          'type': 'text',
          'id': 'WQOTAp',
          'left': 304.9074074074074,
          'top': 198.10185185185182,
          'width': 417.9629629629629,
          'height': 140,
          'content': '<p style=\'text-align: center;\'><strong><span style=\'color: #ffffff;\'><span style=\'font-size: 80px\'>感谢观看</span></span></strong></p>',
          'rotate': 0,
          'defaultFontName': 'Microsoft Yahei',
          'defaultColor': '#333',
          'wordSpace': 5
        }
      ],
      'background': {
        'type': 'solid',
        'color': '#fff'
      }
    }
  ],
  'slideIndex': 0,
  'viewportRatio': 0.5625
}

let awareness:any
const yjxInit = (onComplete:() => void) => {
  onInitCompleted = onComplete
  yDoc = new Y.Doc(),
  (window as any)['yDoc'] = yDoc
  yjsData = yDoc.getMap('pptData')
  const provider = new WebsocketProvider(
    'wss://pagepeek.keepsecret.io/ws/',
    parseQueryString().file || 'ppt10013',
    yDoc
  )
  provider.on('sync', inited)
  awareness = provider.awareness
}

const yjsGetAwareness = () => {
  return awareness
}

export { yjxInit, yjsData, yjsSlides, yjsUuid, yjsFle, yDoc, needYJS, yjsAddSlide, yjsRegistUseSlideHandler,
  yjsUpdateAnimations,
  yjsUpdateTurnningMode,
  yjsDeleteSlides,
  yjsGetAwareness,
  editElementText,
  setEditorElementInput,
  yjsGetTextXML,
  yjsSetTextChangeBack,
  yjsSetTableTextChangeBack,
  yjsEditTableTextInsert,
  yjsSetSlideAttributes,
  yjsSetSlidesBackground,
  yjsSetElementAttributes,
  yjsDeleteElementAttributes,
  yjsAddElement, yjsDeleteElement, yjsUpdateElement, yjsUpdateSlide,
  yjsSortSlide, }
