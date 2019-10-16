// pages/store_map/store_map.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
let timeout = null; //多次滑动限制
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parm:{ //ajax参数
      groupId:0,
      keyWord:''
    },
    coordinate:{ //坐标
      local: "",
      rightTop: "",
      leftBottom: "",
    },
    markers: [],//地图门店瞄点
    cruMarker: '',//当前点击的门店
    isShowList: false,//显示列表
    isShowBotMsg: false,//显示底部门店信息
    isShowTips: false,//显示联系门店信息，拨打复制添加联系人
    isMove: false,
    inputInfo: '搜索店号、店名'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initMap()
  },

  //初始化地图
  initMap: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    this.mapCtx = wx.createMapContext('storeMap')
    setTimeout(()=>{
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.setData({
            ['coordinate.local']: {
              latitude: res.latitude,
              longitude: res.longitude
            }
          })
        //延迟执行:首次渲染获取map左下角右上角经纬度bug
         setTimeout(()=>{
           this.getMapRegion('init')
         },1000)
        }
      })
    })
  },

  //获取当前可视屏幕
  getMapRegion: function (isInit) {
    this.mapCtx.getRegion({
      success: (res) => {
        var [leftBottom, rightTop] = [
          res.southwest,//屏幕左下角经纬度
          res.northeast,//屏幕右上角经纬度
        ]
        this.setData({
          ['coordinate.rightTop']: rightTop,
          ['coordinate.leftBottom']: leftBottom,
        })
        let init = isInit ? isInit:''
        this.getMapList(init)
        
      }
    })
  },

  //获取当前可视屏幕的门店,isInit是否第一次渲染
  getMapList(isInit){
    wx.showNavigationBarLoading()
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetNearStoreList",
      biz: {
        groupId: this.data.parm.groupId, 
        uLat: this.data.coordinate.local.latitude,
        uLng: this.data.coordinate.local.longitude,
        leftBotLng: this.data.coordinate.leftBottom.longitude, 
        leftBotLat: this.data.coordinate.leftBottom.latitude, 
        rightTopLng: this.data.coordinate.rightTop.longitude,
        rightTopLat: this.data.coordinate.rightTop.latitude,
      },
      success: (res)=> {
        if (res.Code == 0) {
          let list_data = [], hasCurMarkers = false
          if(!res.Result.length){return}
          res.Result.forEach((i)=>{
            if (this.data.cruMarker){
              if (this.data.cruMarker.StoreCode == i.StoreCode){
                var w = 40, h = 56;
                hasCurMarkers = true
              } 
            }
            var id = JSON.stringify({
              id: i.$id,
              StoreCode: i.StoreCode,
              StoreName: i.StoreName,
              DetailAddr: i.Province + i.City + i.Town + i.DetailAddr,
              Hour: i.Hour,
              Telephone: i.Telephone,
              Distance: (i.Distance / 1000).toFixed(2) + 'KM',
              latitude: i.TenXunWeiDu,
              longitude: i.TenXunJinDu,
            })
            list_data.push({
              id: id,
              StoreCode: i.StoreCode,
              latitude: i.TenXunWeiDu,
              Distance: (i.Distance / 1000).toFixed(2) + 'KM',
              longitude: i.TenXunJinDu,
              name: i.StoreName,
              width: w ? w : 20,
              height: h ? h : 26,
              iconPath: '../img/coordinate.png',
              ShortName: i.ShortName,
              StoreName: i.StoreName,
              Telephone: i.Telephone,
              Adress: i.Province + i.City + i.Town + i.DetailAddr
            })
          })
          this.setData({
            markers:list_data
          })
          if (isInit){
            var minDistance = 999
            var minMarker = ''
            var localLat = this.data.coordinate.local.latitude
            list_data.forEach((i)=>{
              if (minDistance > i.Distance.split('KM')[0]) {
                minMarker = i
              }
              minDistance = minDistance > i.Distance.split('KM')[0] ? i.Distance.split('KM')[0] : minDistance
            })
            setTimeout(()=>{
              this.tapMaker({
                type: '',
                markerId: minMarker.id
              })
            })
          }

          if (!hasCurMarkers){
            this.setData({
              cruMarker : '',
              isShowBotMsg : false
            })
          }
        }
      },
      fail: function (msg) {
        wx.showModal({ title: '网络异常', content: "﹋o﹋请稍后再试。", showCancel: false });
      },
      complete: (res) => {
        setTimeout(() => {
          this.setData({ isMove: true })
        }, 2000)
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }
    });
  },
  // 搜索门店
  searchList(){
    // 取消input聚焦，赋值keyWord
    this.setData({ inputFocus:false })
    // 赋值keyWord中，延迟执行
    setTimeout(()=>{
      if (!this.data.parm.keyWord) {
        wx.showToast({
          title: '请输入关键字,或滑动地图',
          icon: 'none'
        })
        return false
      }
      wx.showNavigationBarLoading()
      wx.showLoading({
        title: '搜索中',
      })
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.SearchStoreList",
        biz: {
          keyWord: this.data.parm.keyWord,
          ulng: this.data.coordinate.local.longitude,
          ulat: this.data.coordinate.local.latitude,
          groupId: 0
        },
        success: (res) => {
          // var res = JSON.parse(DATA)
          console.log(res)
          if (res.Code == 0) {
            let list_data = [], hasCurMarkers = false;
            this.setData({ isShowList: true })
            if (!res.Result.length) {
              this.setData({
                markers: [],
                cruMarker: '',
                isShowBotMsg: false
              })
              return
            }
            res.Result.forEach((i) => {
              if (this.data.cruMarker) {
                if (this.data.cruMarker.id == i.$id) {
                  var w = 40, h = 56;
                  hasCurMarkers = true
                }
              }
              var id = JSON.stringify({
                id: i.$id,
                StoreCode: i.StoreCode,
                StoreName: i.StoreName,
                DetailAddr: i.Province + i.City + i.Town + i.DetailAddr,
                Hour: i.Hour,
                Telephone: i.Telephone,
                Distance: (i.Distance / 1000).toFixed(2) + 'KM',
                latitude: i.TenXunWeiDu,
                longitude: i.TenXunJinDu,
              })
              list_data.push({
                id: id,
                StoreCode: i.StoreCode,
                latitude: i.TenXunWeiDu,
                Distance: (i.Distance / 1000).toFixed(2) + 'KM',
                longitude: i.TenXunJinDu,
                name: i.StoreName,
                width: w ? w : 20,
                height: h ? h : 26,
                iconPath: '../img/coordinate.png',
                ShortName: i.ShortName,
                StoreName: i.StoreName,
                Telephone: i.Telephone,
                Adress: i.Province + i.City + i.Town + i.DetailAddr
              })
            })
            this.setData({
              markers: list_data
            })
            if (!hasCurMarkers) {
              this.setData({
                cruMarker: '',
                isShowBotMsg: false
              })
            }
          }
        },
        fail: function (msg) {
          wx.showModal({ title: '网络异常', content: "﹋o﹋请稍后再试。", showCancel: false });
        },
        complete: function (res) {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
        }
      });
    },500)
  },
  //滑动移动地图
  changeMap(event) {
    clearTimeout(timeout);
    console.log(this.data.isMove)
    if (event.type == 'end' && this.data.isMove) {
      console.log('moveEnd')
      console.log(this.data.isMove)
      timeout = setTimeout(() => {
        this.getMapRegion()
      }, 500);
    }
  },
  
  // 点击地图
  tapMap(e){
    this.data.markers.forEach((i, index) => {
      if (i.width > 26) {
        var w = `markers[${index}].width`
        var h = `markers[${index}].height`
        this.setData({
          [w]: 20,
          [h]: 26
        })
      }
    })
    this.setData({
      cruMarker: '',
      isShowBotMsg: false,
    })
  },
  // 点击门店
  tapMaker(e){
    let type = e.type
    this.setData({ isMove: false })
    console.log(e)
    let markerId = (type == 'tap' ? (e.currentTarget.dataset.item.id) : (e.markerId))
    let curMaker = (type == 'tap' ? JSON.parse(e.currentTarget.dataset.item.id) : JSON.parse(e.markerId))
    if (this.data.cruMarker.id == curMaker.id) {
      this.setData({
        isShowList: false
      }) 
      return
    }
    
    if (type == 'tap') {
      this.mapCtx.includePoints({
        padding: [10,0,300,0],
        points: [{
          longitude: curMaker.longitude,
          latitude: curMaker.latitude
        }]
      })
    }
    setTimeout(()=>{
      this.setData({ isMove: true })
    },2000)
    let markers = this.data.markers
    this.setData({
      cruMarker: curMaker,
      isShowBotMsg: true,
      isShowList: false,
    })
    markers.forEach((i,index)=>{
      if (i.width>26){
        var w = `markers[${index}].width`
        var h = `markers[${index}].height`
        this.setData({
          [w]: 20,
          [h]: 26
        })
      }
      if (JSON.parse(i.id).id == curMaker.id){
        var w = `markers[${index}].width`
        var h = `markers[${index}].height`
        this.setData({
          [w]: 40,
          [h]: 52
        })
      }
    })
  },
  //开始导航，去门店
  goToStore() {
    wx.openLocation({
      latitude: this.data.cruMarker.latitude,
      longitude: this.data.cruMarker.longitude,
      scale: 18
    })
  },
  //联系门店
  switchCallStore(e) {
    var isShowTips = !this.data.isShowTips
    this.setData({
      isShowTips: isShowTips
    })
  },
  // 列表拨打门店
  callStoreTel(e) {
    if (!e.target.dataset.tel) { return }
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.tel
    })
  },
  // 联系门店操作提示
  tapTips(e) {
    let type = e.target.dataset.type
    if (!type) { return }
    switch (type) {
      case 'call':
        wx.makePhoneCall({
          phoneNumber: this.data.cruMarker.Telephone
        })
        break;
      case 'copy':
        wx.setClipboardData({
          data: this.data.cruMarker.Telephone,
          success: function (res) {
            wx.getClipboardData({
              success: function (res) {
                wx.showToast({
                  title: '复制成功'
                })
              }
            })
          }
        })
        break;
      case 'add':
        wx.addPhoneContact({
          firstName: this.data.cruMarker.StoreName,
          mobilePhoneNumber: this.data.cruMarker.Telephone,
          addressStreet: this.data.cruMarker.DetailAddr
        })
        break;
    }
  },

  //显示列表
  showList: function () {
    let isShowList = this.data.isShowList
    this.setData({
      isShowList:!isShowList
    })
  },
  /* cover-input start */
  tapInput() {
    this.setData({
      //在真机上将焦点给input
      inputFocus: true,
      //初始占位清空
      inputInfo: ''
    });
  },
  blurInput(e) {
    this.setData({
      inputInfo: e.detail.value || '搜索店号、店名',
      ['parm.keyWord']: e.detail.value
    });
  },
   /* cover-input end */

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})