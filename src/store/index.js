import { createStore } from 'vuex'

const store = createStore({
  state: {
    userInfo: null // 用于保存用户信息
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    }
  },
  actions: {
    updateUserInfo({ commit }, userInfo) {
      commit('setUserInfo', userInfo)
    }
  },
  getters: {
    getUserInfo: (state) => state.userInfo
  }
})

export default store 