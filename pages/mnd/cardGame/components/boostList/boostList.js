// pages/cardGame/components/boostList/boostList.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    boostList: {
      type: Array,
      value: []
    },
    title: {
      type: String,
      value: ''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    static: {},
  },
  ready() {
    const {staticConfig: {title_friends, bg_friendsList}} = app.globalData.cardGameConfig
    this.setData({
      static: {
        title_friends,
        bg_friendsList
      },
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
