// index.ts
import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'
 
const messages = {
  en,
  zh,
}
const language = (navigator.language || 'en').toLocaleLowerCase() // 这是获取浏览器的语言
const i18n = createI18n({
  // locale: 'en', // 设置语言
  locale: localStorage.getItem('lang') || language.split('-')[0] || 'en', // 首先从缓存里拿，没有的话就用浏览器语言，
  fallbackLocale: 'en', // 设置备用语言
  messages, // 语言文件
  legacy: false, // you must specify 'legacy: false' option
  globalInjection: true, // 是否开启全局
  silentTranslationWarn: true // 关闭警告信息
})
 
export default i18n