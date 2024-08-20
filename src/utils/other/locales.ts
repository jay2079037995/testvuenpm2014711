// 国际化
import { useI18n } from 'vue-i18n' // 要在js中使用国际化
// const i18n = useI18n()
// const { locale, t } = useI18n()
const { locale} = useI18n()

// 切换语言
const changeLanguage = (lang: string) => {
  // i18n.locale.value = lang
  locale.value = lang
  localStorage.setItem('language', lang)
}