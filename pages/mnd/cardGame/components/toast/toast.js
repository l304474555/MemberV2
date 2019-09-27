// pages/cardGame/components/toast/toast.js
import {
  receiveCard,
  gotCoupon
} from '../../util/apis'
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toastList: {
      type: Array,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    static: {},
    showPrompt: false,
    star: [{
        animation: 'star-animate 1s linear .1s infinite',
        top: '144rpx',
        left: '500rpx'
      },
      {
        animation: 'star-animate 1s linear .3s infinite',
        top: '184rpx',
        left: '472rpx'
      },
      {
        animation: 'star-animate 1s linear .1s infinite',
        top: '416rpx',
        left: '136rpx'
      },
      {
        animation: 'star-animate 1s linear .3s infinite',
        top: '456rpx',
        left: '156rpx'
      }
    ],
    toastAnimation: 'toast-animate .3s linear forwards',
    maskAnimation: 'mask-animate .3s linear forwards',
    storeName: ''
  },

  ready() {
    const that = this;
    this.init();
    app.$bus.on('backToMP', () => {
      wx.getStorage({
        key: 'jikaStoreinfo',
        success({ data = {} }) {
          console.log('jikaStoreinfo reflesh Store', data);
          const storeName = data.jkstoreName;
          that.setData({ storeName });
        }
      });
    });
    app.$bus.on('selectCoupon', (id, name) => {
      console.log('selectCoupon', id, name)
      this.couponId = id;
      this.couponName = name;
    });
    // this.getStore();
    // test
    // wx.setStorage({
    //   key:"jikaStoreinfo",
    //   data: {
    //     // currStoreInfo: {
    //       jkstoreName: 'jkstoreName',
    //       jkstoreCode: 'jkstoreCode',
    //       storeAdress: 'storeAdress',
    //       storelat: 'storelat',
    //       storelng: 'storelng',
    //       distance: 'distance',
    //       province: 'province',
    //     // }
    //   }
    // })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      const {
        bg_toast,
        toast_tip,
        toast_exchange,
        btn_4,
        btn_2,
        btn_close,
        toast_register,
        btn_register_2,
        btn_register_4,
        star
      } = app.globalData.cardGameConfig.staticConfig
      this.setData({
        static: {
          bg_toast,
          toast_tip,
          toast_exchange,
          btn_4,
          btn_2,
          btn_close,
          toast_register,
          btn_register_2,
          btn_register_4,
          star
        }
      })
    },
    close(cb) {
      this.setData({
        toastAnimation: 'close-animate .3s linear forwards',
        maskAnimation: 'mask-close-animate .3s linear forwards'
      })
      app.$bus.emit('prompt', {
        show: false
      })
      this.setData({
        showPrompt: false
      })
      setTimeout(() => {
        let {
          toastList
        } = this.data
        toastList.shift()
        app.$bus.emit('toastList', toastList)
        this.setData({
          toastAnimation: 'toast-animate .3s linear forwards',
          maskAnimation: 'mask-animate .3s linear forwards'
        })
        typeof cb === 'function' && cb();
      }, 300)
    },
    register() {
      wx.reLaunch({
        url: '/pages/member_card/index',
      })
    },
    showPrizeCenter() {
      this.close()
      app.$bus.emit('prizeCenter', {
        show: true
      })
    },
    selectStore() {
      wx.navigateTo({
        url: '/pages/yhq_choose_store/yhq_choose_store?jika=jika',
      })
    },
    getCoupon() {
      const { couponId, couponName } = this
      console.log('couponId', couponId, 'couponName', couponName);
      const that = this;
      // 获取缓存
      wx.getStorage({
        key: 'jikaStoreinfo',
        // 有门店缓存就获取优惠券
        success({ data }) {
          const {
            game_id,
            user: {
              unionid,
              pubOpenId
            },
          } = app.globalData.cardGameConfig
          console.log('jikaStoreinfo', data)
          if (!data.jkstoreCode && data.jkstoreCode != 0) {
            wx.showToast({
              title: '请选择提货门店，方可获得优惠券哦',
              icon: 'none',
              duration: 2000
            })
            return
          }
          gotCoupon(game_id, unionid, pubOpenId, data.jkstoreCode, couponId).then(() => {
            that.close(() => {
              app.$bus.emit('toastList', [{
                type: 'exchangeSuccess',
                detail: `恭喜你成功获得了${couponName}奖品，快去奖品中心查看相关信息吧！`,
                btns: [{
                  text: '查看奖品',
                  type: 'showPrizeCenter',
                }],
              }])
            });
            app.$bus.emit('checkPrize', couponId, data.jkstoreCode);
            wx.removeStorage({ key: 'jikaStoreinfo' });
          }).catch(err => {
            console.log('gotCoupon', err);
          })
        },
        // 没有就提示 请选择提货门店，方可获得优惠券哦
        fail(res) {
          wx.showToast({
            title: '请选择提货门店，方可获得优惠券哦',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },
    toLotteryUrl() {
      // const {
      //   lottery_url
      // } = app.globalData.cardGameConfig.staticConfig
      const {
        game_id,
        staticConfig: {
          lottery_url
        }
      } = app.globalData.cardGameConfig
      wx.reLaunch({
        url: lottery_url,
        success() {
          wx.removeStorage({
            key: 'LOTTERY_CHANCE_KEY' + game_id
          })
        }
      })
    },
    showExpress() {
      this.close()
      app.$bus.emit('prizeCenter', {
        show: true,
        onlyShowExpress: true
      })
    },
    receive() {
      const {
        game_id,
        user: {
          unionid
        }
      } = app.globalData.cardGameConfig
      let {
        card_type,
        prompt
      } = this.data.toastList[0]
      console.log(prompt)
      receiveCard(unionid, card_type, game_id).then(({
        code
      }) => {
        if (code == 0) {
          //需要弹提示框
          if (prompt) {
            prompt.realShow = true
            this.setData({
              showPrompt: true
            })
            app.$bus.emit('prompt', prompt)
            // let text = ''
            // prompt.lines.forEach(line=> {
            //   text += line + '\n'
            // })
            // app.$bus.emit('toastList', [{
            //   type: 'tip',
            //   detail: text,
            //   btns: [{
            //     type: 'close',
            //     text: '我知道了',
            //   }]
            // }])
            setTimeout(() => {
              app.$bus.emit('prompt', {
                show: false
              })
              this.setData({
                showPrompt: false
              })
            }, (prompt.timeout) || 0)
            this.close()
            //不需要弹提示框
          } else {
            this.close()
          }
        }
      })
    },
    stopPopEvent() {
      return
    }
  }
})