// pages/cepingGame/pages/poster.js
import WeCropper from '../../components/we-copper/we-cropper.min.js'
import {
  uploadPostData,
  uploadImg
} from '../../util/apis';
const app = getApp()
const device = wx.getSystemInfoSync()

Component({
  /**
   * 组件的初始数据
   */
  data: {
    title: '',
    nickname: '',
    copywriting: '',
    cropperOpt: {
      src: 'http://res.cdn.24haowan.com/dingzhi/myj_ceping/images/home_bg.png',
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width: 300,
      height: 250,
      scale: 2.5,
      zoom: 8,
      canvasWidth: '100%',
      canvasHeight: '100%'
    },
    editAble: false,
    showEdit: false,
    static: {},
    lottery_chance: 0,
    wrapScale: 1,
    translateY: 0,
    // tips: '双击上方图片区域可放大编辑，长按可保存图片',
    tips: '双击上方图片区域，可缩小/放大图片，编辑后更好看哦！',
    lotteryChanceAnim: ''
  },
  lifetimes: {
    ready() {
      console.log('---------device--------->', device.windowWidth / device.windowHeight)
      this.initGlobalData()
      setTimeout(()=> {
        this.initWrapper()
      }, 300)
      // 测评结束后不弹出弹窗
      if (app.globalData.cepingGameConfig.fromRouter === 'question') {
        app.$bus.emit('toast', {
          showType: 'finish',
          duration: 5000,
          disableClose: true
        })
      }
      app.$bus.on('updateLotteryChance', lottery_chance => {
        this.setData({
          lottery_chance,
        })
        setTimeout(()=> {
          this.setData({
            lotteryChanceAnim: 'animScale'
          })
          setTimeout(()=> {
            this.setData({
              lotteryChanceAnim: ''
            })
          }, 1000)
        }, 2000)
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    initGlobalData() {
      const _static = app.globalData.cepingGameConfig
      this.setData({
        nickname: _static.user.nickName,
        static: {
          title_poster: _static.img_title_poster,
          bg_poster: _static.img_bg_poster,
          bg_poster_des: _static.img_bg_poster_des,
          btn_lottery: _static.img_btn_lottery,
          btn_playAgain: _static.img_btn_playAgain,
          btn_share: _static.img_btn_share,
          bg_tip1: _static.img_bg_tip1,
          bg_tip2: _static.img_bg_tip2,
          btn_undo: _static.img_btn_undo,
          btn_reUpload: _static.img_btn_reUpload,
          btn_save: _static.img_btn_save,
          bg_edit: _static.img_bg_edit,
          logo_footer: _static.img_logo_footer,
        },
        title: _static.resultDesTitle || '',
        copywriting: _static.resultDes || '',
        lottery_chance: _static.user.left_lottery_chance
      })
      if (!_static.resultDes) {
        for (let i = 0; i < _static.result.length; i++) {
          let {
            img,
            range,
            description,
            title
          } = _static.result[i]
          // console.log(range, score)
          if (this.calcRange(range, _static.record.score)) {
            // console.log('result_' + i, img)
            app.$storage({
              type: 'img',
              key: 'result_' + i,
              data: img
            }).then(({
              data
            }) => {
              _static.resultImg = data[0];
              _static.resultDes = description;
              _static.resultDesTitle = title;
              this.setData({
                title: _static.resultDesTitle || '',
                copywriting: _static.resultDes || ''
              })
            })
          }
        }
      }
    },
    calcRange(range, score) {
      const pre = range[0]
      const pos = range[range.length - 1]
      const [low, high] = range.match(/\d+/g)
      // console.log(pre, low, high, pos)
      if (pre === '(') {
        if (+low >= +score) return false
      } else if (pre === '[') {
        if (+low > +score) return false
      }
      if (pos === ')') {
        if (+high <= +score) return false
      } else if (pos === ']') {
        if (+high < +score) return false
      }
      return true
    },
    initWrapper() {
      const _this = this
      wx.createSelectorQuery().in(this).select('#wrapper')
        .boundingClientRect(function (rect) {
          console.log(rect)
          _this.initWeCropper(rect.height, rect.width)
          
        }).exec()
    },
    initWeCropper(height, width) {
      if (device.windowWidth / device.windowHeight >= 0.66) {
        this.setData({
          wrapScale: 0.9,
          translateY: 5
        })
      }
      const {
        cropperOpt
      } = this.data
      const {
        photoSrc,
        record = {},
        id,
        user: {
          unionid
        }
      } = app.globalData.cepingGameConfig
      const _w = width * 0.98 * this.data.wrapScale
      const _h = height * 1 * this.data.wrapScale
      const wToh = 1.75
      const w = 100 / 2
      const h = w * wToh
      Object.assign(cropperOpt, {
        ...record,
        height: height,
        width: width,
        src: photoSrc || record.img,
        initOnce: !!record.imgLeft
      })
      this.setData({
        cropperOpt: {
          canvasWidth: `calc(${width * this.data.wrapScale}px - 18rpx)`,
          canvasHeight: `calc(${height * this.data.wrapScale}px - 18rpx)`
        }
      })
      console.log(cropperOpt, photoSrc)
      cropperOpt.src = cropperOpt.src.replace('http://mimage.myj.com.cn/', 'https://mimage.myj.com.cn/')

      this.cropper = new WeCropper(cropperOpt, this)
        .on('ready', (ctx) => {
        })
        .on('beforeImageLoad', (ctx) => {
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx, self) => {
          wx.hideToast();
          // 第一次画图片&&最后一次测评结束后&&没有测评结果图片信息，才上传图片信息
          if (!this.data.inited &&
            app.globalData.cepingGameConfig.user.left_game_chance === 0 &&
            !app.globalData.cepingGameConfig.record.imgLeft
          ) {
            this.data.inited = true
            this.data.initPhotoSrc = photoSrc
            uploadPostData({
              game_id: +id,
              unionid,
              imgLeft: self.imgLeft,
              imgTop: self.imgTop,
              scaleWidth: self.scaleWidth,
              scaleHeight: self.scaleHeight
            })
          }
        })
        .on('beforeDraw', (ctx, self) => {
          const {
            resultImg,
            // img_bg_qrcode,
            // img_qrcode
          } = app.globalData.cepingGameConfig
          resultImg && ctx.drawImage(resultImg, 0, 0, _w, _h);
          // img_bg_qrcode && ctx.drawImage(img_bg_qrcode, _w - w * 1.1, _h - h, w, h);
          // img_qrcode && ctx.drawImage(img_qrcode, _w - w * 0.98, _h - h * 0.73, 39, 39);
        })
    },
    touchStart(e) {
      if (this.data.editAble) {
        this.cropper.touchStart(e)
      } else if (e.touches.length === 1) {
        this.doubleClick(e)
        this.longPress(e)
      }
    },
    touchMove(e) {
      this.data.editAble && this.cropper.touchMove(e)
    },
    touchEnd(e) {
      this.data.editAble ?
        this.cropper.touchEnd(e) :
        (this.data.inLongPress = false)
    },
    savePhoto(fromLongTouch = false) {
      const _this = this
      this.cropper.getCropperImage().then(config => {
        wx.canvasToTempFilePath({
          ...config,
          fileType: 'jpg',
          success({
            tempFilePath
          }) {
            wx.showLoading({
              title: '保存中',
            })
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success: (res) => {
                wx.hideLoading()
                app.$bus.emit('toast', {
                  showType: 'saved',
                  // disableClose: true,
                  duration: 2000
                })
                _this.closeEdit()
              },
              fail(res) {
                wx.hideLoading()
                wx.showToast({
                  icon: 'none',
                  title: res,
                  duration: 1000
                })
                console.log('saveImageToPhotosAlbum', res);
              },
              complete() {
                if (fromLongTouch === true) {
                  console.log('长按保存，不上传图片信息')
                  return
                }
                // 没有测评机会才上传图片和图片信息
                console.log('剩余次数：', app.globalData.cepingGameConfig.user.left_game_chance)
                if (app.globalData.cepingGameConfig.user.left_game_chance === 0) {
                  const self = _this.cropper
                  const config = app.globalData.cepingGameConfig
                  app.globalData.cepingGameConfig.record = {
                    img: config.photoSrc || config.record.img,
                    imgLeft: self.imgLeft,
                    imgTop: self.imgTop,
                    scaleWidth: self.scaleWidth,
                    scaleHeight: self.scaleHeight,
                    score: config.record.score
                  }
                  uploadPostData({
                    game_id: +config.id,
                    unionid: config.user.unionid,
                    imgLeft: self.imgLeft,
                    imgTop: self.imgTop,
                    scaleWidth: self.scaleWidth,
                    scaleHeight: self.scaleHeight
                  })
                  if (_this.data.initPhotoSrc !== config.photoSrc) {
                    console.log('重新上传图片')
                    uploadImg('img', config.photoSrc, {
                      game_id: +config.id,
                      unionid: config.user.unionid
                    })
                  }
                }
              }
            })
          },
          fail: (res) => {
            console.log('canvasToTempFilePath', res);
          }
        }, this);
      })
    },
    longPress() {
      if (this.data.timer) return;
      this.data.inLongPress = true
      this.data.timer = setTimeout(() => {
        this.data.inLongPress && this.savePhoto(true)
        this.data.timer = null
      }, 800)
    },
    doubleClick(e) {
      const curTime = e.timeStamp
      const lastTime = this.data.lastTapTime || 0
      if (curTime - lastTime > 0) {
        if (curTime - lastTime < 300) {
          this.cropper.saveImgData()
          this.data.inLongPress = false;
          this.setData({
            showEdit: true
          })
          setTimeout(()=> {
            this.setData({
              editAble: true
            })
          }, 100)
        }
      }
      this.data.lastTapTime = curTime
    },
    undo() {
      this.cropper.readAndSetImgData(() => {
        this.closeEdit()
      })
    },
    closeEdit() {
      this.setData({
        editAble: false
      })
      setTimeout(()=> {
        this.setData({
          showEdit: false
        })
      }, 1000)
    },
    reUpload() {
      const _this = this
      app.$bus.emit('toast', {
        showType: 'chooseImg',
        callBack: function (src) {
          console.log(src)
          _this.cropper.pushOrign(src)
        }
      })
    },
    playAgain() {
      app.$bus.emit('router', 'home');
    },
    lottery() {
      // if (this.data.lottery_chance > 0) {
      const {
        lottery_id,
        lottery_url = ''
      } = app.globalData.cepingGameConfig
      lottery_url ? wx.navigateTo({
        url: lottery_url + lottery_id
      }) : console.log('没有配置抽奖路径')
      app.globalData.cepingGameConfig.toLotery = true
      // }
    },
  }
})