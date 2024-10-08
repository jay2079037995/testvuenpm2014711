import type { App } from 'vue'

import Contextmenu from './contextmenu'
import ClickOutside from './clickOutside'
import Tooltip from './tooltip'
import TooltipLeft from './tooltipLeft'

export default {
  install(app: App) {
    app.directive('contextmenu', Contextmenu)
    app.directive('click-outside', ClickOutside)
    app.directive('tooltip', Tooltip)
    app.directive('tooltipleft', TooltipLeft)
  }
}
