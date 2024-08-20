import i18n from '@/assets/locales/index'

export const ELEMENT_TYPE_ZH: { [key: string]: string } = {
  text: i18n.global.t('element.text'),
  image: i18n.global.t('element.image'),
  shape: i18n.global.t('element.shape'),
  line: i18n.global.t('element.line'),
  chart: i18n.global.t('element.chart'),
  table: i18n.global.t('element.table'),
  video: i18n.global.t('element.video'),
  audio: i18n.global.t('element.audio'),
  latex: i18n.global.t('element.latex'),
}

export const MIN_SIZE: { [key: string]: number } = {
  text: 20,
  image: 20,
  shape: 15,
  chart: 200,
  table: 20,
  video: 250,
  audio: 20,
  latex: 20,
}