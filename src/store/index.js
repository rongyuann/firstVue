import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  // state 中存放全局共享的数据
  state: {
    loginName: ''
  },
  mutations: {
    setLoginName (state, username) {
      state.loginName = username
    }
  }
})

export default store
