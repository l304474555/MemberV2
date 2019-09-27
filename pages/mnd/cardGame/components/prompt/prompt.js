// pages/cardGame/components/prompt/prompt.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lines: {
      type: Array,
      value: []
    },
    timeout: {
      type: Number,
      value: 3000,
    },
  },

  attached() {
    const {timeout} = this.properties
    setTimeout(() => {
      app.$bus.emit('prompt', {show: false})
    }, timeout)
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
