import { defineStore } from 'pinia'

export interface AIBotState {
    aiBotVisible: boolean
}

export const useAIBotStore = defineStore('aiBot', {
  state: (): AIBotState => ({
    aiBotVisible: true, // AI 对话框
  }),

  getters: {
    getAIBotState(state) {
      return state.aiBotVisible
    },
  },

  actions: {
    setAIBotState(visible: boolean) {
      this.aiBotVisible = visible
    },
  },
})