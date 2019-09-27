// const behave = require('../../util/behavior.js')
const { choose } = require('../../util/apis')
let isChosen = false
Component({
  properties: {
    shown: {
      type: Boolean,
      value: false
    },
    type: {
      type: String,
      value: 'fail',
    },
    data: {
      type: Array,
      value: [],
      observer(val) {  
        if(this.data.type === 'choose') {
          isChosen = false
          // 如果是选奖品弹窗，要设置大小，从新排序
          this.setData({
            tableW : val.length < 5 ? '500' : '564'
          })
        } else if (this.data.type === 'win') {
          // 如果是胜出弹窗，则设置封面
          this.setData({ 
            poster: val[0]
          })
        }
      }
    }
  },
  data: {
    poster: '',
    tableW: ''
  },
  // behaviors: [behave],
  methods: {
    close() {
      this.triggerEvent('bridge', {
        dialogShown: false,
        currentTag: 'start'
      })
    },
    replay() {
      this.triggerEvent('bridge', {
        dialogShown: false
      })
    },
    goTicket() {
      wx.switchTab({
        url: '/pages/yhq_voucher/yhq_voucher'
      })
    },
    choose(e) {
      if(isChosen) return
      isChosen = true
      const index = e.target.dataset.index
      wx.showLoading()
      choose(e.target.dataset.uuid).then(() => {
        wx.hideLoading()
        wx.showToast({
          title: '领券成功，券将会在3-15分钟内派发到您的账户上哦~',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          poster: this.data.data[index].gift_img,
        })
        this.triggerEvent('bridge', {
          dialogType: 'win'
        })
      }).catch(e => {
        wx.hideLoading()     
        wx.showToast({
          title: e.data.msg,
          icon: 'none',
          duration: 2000
        })
      })

    }
  }
})
