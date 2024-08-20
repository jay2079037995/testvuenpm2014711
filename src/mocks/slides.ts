import type {PPTElement, PPTLineElement, PPTShapeElement, PPTTextElement, Slide } from '@/types/slides'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { useSlidesStore } from '@/store'

// ppt 数据
export const slides: Slide[] = [
  {
    id: 'test-slide-1',
    elements: [
      /* {
        type: 'shape',
        id: '4cbRxp',
        left: 0,
        top: 200,
        width: 546,
        height: 362.5,
        viewBox: [200, 200],
        path: 'M 0 0 L 0 200 L 200 200 Z',
        fill: '#2aba8a',
        fixedRatio: false,
        opacity: 0.7,
        rotate: 0
      },
      {
        type: 'shape',
        id: 'ookHrf',
        left: 0,
        top: 0,
        width: 300,
        height: 320,
        viewBox: [200, 200],
        path: 'M 0 0 L 0 200 L 200 200 Z',
        fill: '#2aba8a',
        fixedRatio: false,
        flipV: true,
        rotate: 0
      }, */
      {
        type: 'text',
        id: 'idn7Mx',
        left: 40,
        top: 30,
        width: 291,
        height: 73,
        lineHeight: 1.2,
        content: '<p><strong><span style=\'font-size:  36px\'>Demo</span></strong></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#333'
      },
      {
        type: 'text',
        id: '7stmVP',
        left: 655,
        top: 20,
        width: 300,
        height: 36,
        content: '<p><span style=\'font-size:  18px\'>Brief description of your service, product, or proposal.</span></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#333'
      },
      /* {
        type: 'line',
        id: 'FnpZs4',
        left: 361,
        top: 238,
        start: [0, 0],
        end: [549, 0],
        points: ['', ''],
        color: '#2aba8a',
        style: 'solid',
        width: 2,
      }, */
      {
        type: 'image',
        fixedRatio: true,
        src: 'imgs/bg-home.png',
        id: 'FnpZs4',
        left: 60,
        top: 120,
        width: 880,
        height: 410,
        rotate: 0
      },
    ],
    background: {
      type: 'solid',
      color: '#ffffff',
    }
  },
  {
    id: 'test-slide-2',
    elements: [
      {
        type: 'text',
        id: 'ptNnUJ',
        left: 145,
        top: 148,
        width: 711,
        height: 100,
        lineHeight: 1.2,
        content: '<p style=\'text-align: center;\'><strong><span style=\'font-size: 48px\'>在此处添加标题</span></strong></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#333',
      }, 
      {
        type: 'text',
        id: 'mRHvQN',
        left: 207.50000000000003,
        top: 249.84259259259264,
        width: 585,
        height: 20,
        content: '<p style=\'text-align: center;\'><span style=\'font-size: 8px\'>在此处添加副标题</span></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#333',
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
        left: 0,
        top: 422.73148148148147,
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
      color: '#fff',
    }
  },
  {
    id: 'test-slide-3',
    elements: [
      {
        type: 'shape',
        id: 'vSheCJ',
        left: 183.5185185185185,
        top: 175.5092592592593,
        width: 605.1851851851851,
        height: 185.18518518518516,
        viewBox: [200, 200],
        path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
        fill: '#2aba8a',
        fixedRatio: false,
        rotate: 0
      }, 
      {
        type: 'shape',
        id: 'Mpwv7x',
        left: 211.29629629629628,
        top: 201.80555555555557,
        width: 605.1851851851851,
        height: 185.18518518518516,
        viewBox: [200, 200],
        path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
        fill: '#2aba8a',
        fixedRatio: false,
        rotate: 0,
        opacity: 0.7
      }, 
      {
        type: 'text',
        id: 'WQOTAp',
        left: 304.9074074074074,
        top: 198.10185185185182,
        width: 417.9629629629629,
        height: 140,
        content: '<p style=\'text-align: center;\'><strong><span style=\'color: #ffffff;\'><span style=\'font-size: 80px\'>感谢观看</span></span></strong></p>',
        rotate: 0,
        defaultFontName: 'Microsoft Yahei',
        defaultColor: '#333',
        wordSpace: 5
      }
    ],
    background: {
      type: 'solid',
      color: '#fff',
    }
  },
]

// 新建页面空slide
export const createEmptySlide = (): Slide => {
  const slidesStore = useSlidesStore()
  const { theme } = storeToRefs(slidesStore)

  const emptyTextElement1: PPTTextElement = {
    type: 'text',
    content: '<p style=\'text-align: center;\'><strong><span style=\'font-size: 48px\'>在此处添加标题</span></strong></p>',
    defaultFontName: theme.value.fontName,
    defaultColor: theme.value.fontColor,
    id: nanoid(10),
    left: 145,
    top: 148,
    width: 711,
    height: 77,
    rotate: 0,
    lineHeight: 1.2
  }

  const emptyTextElement2: PPTTextElement = {
    type: 'text',
    content: '<p style=\'text-align: center;\'><span style=\'font-size: 24px\'>在此处添加副标题</span></p>',
    defaultFontName: theme.value.fontName,
    defaultColor: theme.value.fontColor,
    id: nanoid(10),
    left: 207.50000000000003,
    top: 249.84259259259264,
    width: 585,
    height: 56,
    rotate: 0
  }

  const emptyLineElement: PPTLineElement = {
    type: 'line',
    start: [0, 0],
    end: [354.8148148148148, 0],
    style: 'solid',
    color: theme.value.themeColor,
    points: ['', ''],
    id: nanoid(10),
    left: 323.09259259259267,
    top: 238.33333333333334,
    width: 4
  }

  const emptyShareElement: PPTShapeElement = {
    type: 'shape',
    viewBox: [200, 200],
    path: 'M 0 20 C 40 -40 60 60 100 20 C 140 -40 160 60 200 20 L 200 180 C 140 240 160 140 100 180 C 40 240 60 140 0 180 L 0 20 Z',
    fixedRatio: false,
    fill: theme.value.themeColor,
    id: nanoid(10),
    left: 0,
    top: 422.73148148148147,
    width: 1000.2962962962963,
    height: 162.96296296296296,
    rotate: 0
  }
  const newElementList:PPTElement[] = []
  newElementList.push(emptyTextElement1)
  newElementList.push(emptyTextElement2)
  newElementList.push(emptyLineElement)
  newElementList.push(emptyShareElement)

  const emptySlide: Slide = {
    id: nanoid(10),
    elements: newElementList,
    background: {
      type: 'solid',
      color: theme.value.backgroundColor,
    },
  }
  return emptySlide
}