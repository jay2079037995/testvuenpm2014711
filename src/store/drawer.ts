import { defineStore } from 'pinia'

export interface DrawerState {
    drawerVisible: boolean
}

export const useDrawerStore = defineStore('drawer', {
  state: (): DrawerState => ({
    drawerVisible: false, // 是否暂时 DrawerPanel
  }),

  getters: {
    getDrawerState(state) {
      return state.drawerVisible
    },
  },

  actions: {
    setDrawerState(visible: boolean) {
      this.drawerVisible = visible
    },
  },
})