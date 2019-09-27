// pages/cardGame/components/prizeCenter/prizeCenter.js
import {setAddress} from '../../util/apis'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPrzieCenter: {
      type: Boolean,
      value: false
    },
    onlyShowExpress: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    prizeList: [],
    input: [
      {
        label: "姓名：",
        type: 'name',
        value: '',
      },
      {
        label: "电话：",
        type: 'tel',
        value: '',
      },
      {
        label: "地址：",
        type: 'address',
        value: '',
        textarea: true
      },
    ],
    prizeExpress: {
      show: false,
      prize: {},
    },
    static: {},
    maskIndex: 0,
    addressChange: false,
    toastAnimation: 'prize-toast-animate .3s linear forwards',
    addressAnimation: 'prize-toast-animate .3s linear forwards',
    maskAnimation: 'mask-animate .3s linear forwards',
  },
  ready() {
    //初始化我的奖品列表
    this.initPrizeList()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    initPrizeList() {
      const {
          prizeList, 
          staticConfig: {
            bg_prize, 
            bg_prizeExpress,
            bg_prizeCenter, 
            btn_checkAddress, 
            btn_expressClose,
            btn_expressConfirm,
            btn_close,
          }
      } = app.globalData.cardGameConfig
      this.setData({
        prizeList,
        static: {
          bg_prize, 
          bg_prizeExpress,
          bg_prizeCenter, 
          btn_checkAddress, 
          btn_expressClose,
          btn_expressConfirm,
          btn_close,
      }})
      app.$bus.on('getPrize', prize => {
        let { prizeList } = this.data
        prize.exchange_id && (prize.id = prize.exchange_id)
        prizeList.unshift(prize)
        this.setData({prizeList})
      })

      app.$bus.on('checkPrize', (prize_id, store) => {
        let { prizeList } = this.data
        let prize = prizeList.find(({ id }) => id === prize_id);
        prize.check = 1;
        prize.takeGoodStore = store;
        console.log('checkPrize', prizeList, prize_id, store)
        this.setData({prizeList})
      })
    },
    closePrizeCenter() {
      this.setData({
        toastAnimation: 'prize-close-animate .3s linear forwards',
        maskAnimation: 'mask-close-animate .3s linear forwards',
      })
      setTimeout(()=> {
        app.$bus.emit('prizeCenter', {show: false})
        this.setData({
          toastAnimation: 'prize-toast-animate .3s linear forwards',
          maskAnimation: 'mask-animate .3s linear forwards',
        })
      }, 300)
    },
    confirmAddress({target: {dataset: {id, index}}}) {
      let {input, prizeList, addressChange} = this.data
      if (!id) {
        index = prizeList.length - 1
        id = prizeList[index].exchange_id
      }
      const name = input[0].value
      const tel = input[1].value
      const address = input[2].value
      const {unionid} = app.globalData.cardGameConfig.user
      if (addressChange) {
        setAddress(name, tel, address, id, unionid).then(({code}) => {
          if (code == 0 ) {
            prizeList[index].courier_name = name
            prizeList[index].courier_tel = tel
            prizeList[index].courier_address = address
            this.setData({prizeList, addressChange: false})
            this.quitExpressToast()
          }
        })
      } else {
        this.quitExpressToast()
      }
    },
    handleAddressInput({detail: {value}, target: {dataset: {index}}}) {
      let {input} = this.data
      input[index].value = value
      this.setData({input, addressChange: true})
    },
    checkPrize({ target: { dataset: { type, id, check, name } } }) {
      switch (type) {
        //虚拟奖品 
        case 0:
          wx.switchTab({
            url: '/pages/yhq_voucher/yhq_voucher'
          })
          break;
        // newType
        // 获得要选择门店的优惠券
        case 3:
          if (check) {
            wx.switchTab({
              url: '/pages/yhq_voucher/yhq_voucher'
            })
          } else {
            // 弹出选择门店弹窗
            this.closePrizeCenter();
            setTimeout(() => {
              app.$bus.emit('toastList', [{
                type: 'selectStore',
                btns: [{
                  text: '确定',
                  type: 'getCoupon',
                }],
                prize: {
                  id,
                  name
                }
              }]);
              app.$bus.emit('selectCoupon', id, name);
            }, 500);
          }
          break;
        default:
          let prizeIndex
          let {input, prizeList} = this.data
          const prize = prizeList.find(({id: _id}, index) => {
            if (id === _id) {
              prizeIndex = index
              return true
            }
          })
          input[0].value = prize.courier_name
          input[1].value = prize.courier_tel
          input[2].value = prize.courier_address
          //填充快递数据，弹出快递地址填写弹窗
          this.setData({
            prizeExpress: {
              show: true,
              prize,
              prizeIndex,
            },
            maskIndex: 2,
            input,
            onlyShowExpress: true
          })
          break;
      }
    },
    quitExpressToast() {
      this.setData({
        addressAnimation: 'prize-close-animate .3s linear forwards',
        maskAnimation: 'mask-close-animate .3s linear forwards',
      })
      setTimeout(()=> {
        this.setData({
          prizeExpress: {show: false},
          maskIndex: 0,
          addressAnimation: 'prize-toast-animate .3s linear forwards',
          maskAnimation: 'mask-animate .3s linear forwards'
        })
        this.properties.onlyShowExpress && app.$bus.emit('prizeCenter', {show: false})
      }, 300)
    }
  }
})
