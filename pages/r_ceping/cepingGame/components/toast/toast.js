// pages/cepingGame/components/toast/toast.js
import {
  uploadImg,
} from '../../util/apis';
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toast: {
      type: Object,
      observer: function (newValue, oldValue) {
        this.setData({
          ...newValue,
          show: newValue.showType != '',
          opacity: 1
        })
        clearTimeout(this.data.__timeout);
        if (newValue.duration > 0) {
          this.data.__timeout = setTimeout(() => {
            this.close()
            // console.log('timeout', newValue.duration)
          }, newValue.duration);
        }
      }
    },
    static: {
      type: Object
    },
    router: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    disableClose: false,
    show: false,
    showType: '',
    duration: 0,
    callBack: null,
    __timeout: null,
    opacity: 0,
    noAnimation: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close(e) {
      if (e && e.target && e.target.dataset.type === 'mask' && this.data.disableClose) {
        return
      }
      clearTimeout(this.data.__timeout);
      if (this.data.noAnimation) {
        this.setData({
          disableClose: false,
          duration: 0,
          __timeout: null,
          callBack: null,
          opacity: 0,
          noAnimation: false,
          show: false,
          showType: '',
        });
      } else {
        setTimeout(() => {
          this.setData({
            show: false,
            showType: '',
          })
        }, 300)
        this.setData({
          disableClose: false,
          duration: 0,
          __timeout: null,
          callBack: null,
          opacity: 0,
          noAnimation: false
        });
      }
    },
    chooseImg(e) {
      const _this = this
      const {
        type
      } = e.target.dataset
      wx.chooseImage({
        count: 1,
        sourceType: [type],
        success: function (res) {
          const file = res.tempFilePaths[0]
          app.globalData.cepingGameConfig.photoSrc = file;
          if (_this.data.callBack) {
            _this.data.callBack(file)
          }
          // 最后一次测评结束后，才上传图片
          if (app.globalData.cepingGameConfig.user.left_game_chance === 0) {
            uploadImg('img', file, {
              game_id: +app.globalData.cepingGameConfig.id,
              unionid: app.globalData.cepingGameConfig.user.unionid
            })
            app.globalData.cepingGameConfig.record.img = file
          }
          app.$bus.emit('router', 'poster');
          _this.close();
        },
      })
    },
    toRegister() {
      this.close()
      // console.log('toRegister')
      wx.navigateTo({
        url: '/pages/member_card/index'
      })
    }
  }
})