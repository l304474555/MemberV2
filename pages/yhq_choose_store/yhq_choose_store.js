// pages/yhq_choose_store/yhq_choose_store.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeList: [], // 门店列表
    isCompelete: false,
    pageIndex: 1,
    pageSize: 20,
    lat: 0, //维度
    lng: 0, //经度
    currenLocation: '',//当前所在的位置
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    searchKeywords: '', //搜索关键字
    currStoreInfo: {
      storeName: '',//门店名称
      storeCode: '',//门店号
      storeAddress: '',//门店地址
      storelat: 0.00,//门店经维度
      storelng: 0.00,//门店经经度
      distance: 0,//门店距离
      province: '',//门店所在省份
      phone:'',//电话号码
    },
    jkStoreInfo: {
      jkstoreName: '',//门店名称
      jkstoreCode: ''//门店号
    },
    currenStoreDistance: '',
    isloadend: false,
    lucky:'',
    jika:'',
    groupid:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.lucky!=undefined)
    { 
      this.setData({
        lucky : options.lucky
      })
      this.data.guid = wx.getStorageSync('guid')
    }
    if(options.jika!=undefined)
    {
      this.setData({
        jika: options.jika
      })
    }
    if (options.groupid != undefined && options.groupid>0)
    {
      this.setData({
        groupid: options.groupid
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onshow")
    this.setData({
      storeList: [], // 门店列表
      isCompelete: false,
      pageIndex: 1,
      pageSize: 20,
      searchKeywords: '',
      currenStoreDistance: 0,
      isloadend: false
    });
    this.locationCurrInfo();

  },
  /**加载门店信息 */
  locationCurrInfo: function () {
    console.log("定位")
    var that = this;
    /**获取当前地理位置 */
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        /**纬度 */
        var latitude = res.latitude;
        /**经度 */
        var longitude = res.longitude;
        console.log(latitude)
        console.log(longitude)
        //根据当前经纬度获取附近门店信息
        that.setData({
          lat: latitude,
          lng: longitude
        });
        //根据得到的经纬度信息去加载门店信息
        that.loadStoreInfo(latitude, longitude, "");
        var storeinfo = wx.getStorageSync("storeinfo");
        //var newStoreInfo={};
      

        if (storeinfo != '') {
          // newStoreInfo.StoreName = storeinfo.StoreName;
          // newStoreInfo.StoreCode = storeinfo.StoreCode;
          // newStoreInfo.Province = storeinfo.Province;
          // newStoreInfo.City = storeinfo.City;
          // newStoreInfo.Town = storeinfo.Town;
          // newStoreInfo.DetailAddr = storeinfo.Province + storeinfo.City + storeinfo.Town+storeinfo.DetailAddr;
          // newStoreInfo.DetailAddr = storeinfo.DetailAddr;
          that.setData({
            currStoreInfo: storeinfo
          });
        }
        //根据经纬度信息去获取当前位置信息
        var demo = new QQMapWX({
          key: that.data.key // 必填
        });

        // 根据经纬度信息去获取当前所在的具体位置
        demo.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            if (res.status == 0) {
              var locationinfo = res.result;
              var curreninfo = locationinfo.address_reference.landmark_l2.title;
              var currLat = locationinfo.address_reference.landmark_l2.location.lat;
              var currLng = locationinfo.address_reference.landmark_l2.location.lng;

              that.setData({
                currenLocation: curreninfo
              });
            }
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
            console.log(res);
          }
        });
      },
      fail: function (res) {
        that.loadStoreInfo(that.data.lat, that.data.lng, "");
        that.setData({
          currenLocation: "请手动搜索门店"
        });
        var storeinfo = wx.getStorageSync("storeinfo");
        if (storeinfo != '') {
          that.setData({
            currStoreInfo: storeinfo
          });
        }
      },
      complete: function () {
      }
    });

  },
  loadStoreInfo: function (ulat, ulng, searkeyWords) {
    console.log(searkeyWords)
    console.log(ulat)
    console.log(ulng)
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetStoreListData",
      biz: {
        keyWords: searkeyWords,
        pageIndex: that.data.pageIndex,
        pageSize: that.data.pageSize,
        uLng: ulng,
        uLat: ulat,
        groupId: that.data.groupid
      },
      success: function (res) {
        console.log(res)
        var curredistance = 0;
        if (res.EntityList!=null)
        {
        for (var i = 0; i < res.EntityList.length; i++) {
          if (that.data.lat == 0 && that.data.lng == 0) {
            res.EntityList[i].Distance = '';
          } else {
            if (res.EntityList[i].Distance >= 1) {
              res.EntityList[i].Distance = parseFloat(res.EntityList[i].Distance).toFixed(2) + 'km';
            } else {
              res.EntityList[i].Distance = (res.EntityList[i].Distance * 1000).toFixed(0) + 'm';
            }
          }
        }
        }
        var list = that.data.storeList.concat(res.EntityList);
        that.setData({
          storeList: list
        });
        // list.unshift
        // list = [...arr[0], ...list]

        //是否加载完
        var pCount = parseInt(res.TotalCount / that.data.pageSize);
        if (res.TotalCount % that.data.pageSize > 0) {
          pCount++;
        }
        if (that.data.pageIndex >= pCount) {
          that.setData({
            isCompleted: true
          });
        }
      },
      fail: function (msg) {
        console.log(JSON.stringify(msg))
      },
      complete: function (res) {
        that.setData({
          isloadend: true
        });
        wx.hideLoading();
      }
    });
  },
  /**搜索门店 */
  seachStore: function (e) {
    var keyword = e.detail.value;
    this.setData({
      searchKeywords: keyword
    });
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      storeList: []
    });
    this.loadStoreInfo(this.data.lat, this.data.lng, this.data.searchKeywords);
  },
  //首页选择门店逻辑
  updateIndexStore(e){
    var storeinfo = e.currentTarget.dataset.item;
    if (storeinfo)
    {
    wx.setStorageSync("newstoreinfo", storeinfo);
    }
    app.currCity = storeinfo.City;
    app.latitude = storeinfo.GaoDeWeiDu;
    app.longitude = storeinfo.GaoDeJinDu;
    this.setData({
      currStoreInfo: {
        storeName: storeinfo.StoreName,
        storeCode: storeinfo.StoreCode,
        storeAddress: storeinfo.Province + storeinfo.City + storeinfo.Town + storeinfo.DetailAddr,
        storelat: storeinfo.GaoDeWeiDu,
        storelng: storeinfo.GaoDeJinDu,
        distance: storeinfo.Distance,
        province: storeinfo.Province,
        phone: storeinfo.Telephone,
        companycode: storeinfo.CompanyCode
      }
    });
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //获取上一页的信息:订单数据
    prevPage.setData({
      isupdateshop:true,
      currStoreInfo: this.data.currStoreInfo
    });
    wx.setStorageSync("storeinfo", this.data.currStoreInfo);
    wx.showToast({
      title: '选择门店成功！',
      icon: 'success',
      success: function () {
        setTimeout(function () {
          wx.navigateBack({});
        }, 500);
      }
    });
  },
  //获取门店信息逻辑
  getStoreInfo(storeinfo){
    //当前选择的门店信息
    var storeObj = {};
    console.log(storeinfo)
    storeObj.TakeGoodsStoreName = storeinfo.storeName;
    storeObj.TakeOutStore = storeinfo.storeCode;
    storeObj.TakeGoodsStoreAddress = storeinfo.storeAddress;
    storeObj.TakeGoodsStorePhone = storeinfo.phone;
    //抽奖入口
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //获取上一页的信息
    var myPrizeList = prevPage.data.myPrizeList //奖品券的list
    var prizecurrStoreInfo = prevPage.data.prizecurrStoreInfo //优惠券的门店对象
    //奖品券入口
    if (myPrizeList) {
      // 保存地址到奖品券
      var storeStr = JSON.stringify(storeObj);
      this.updateChooseStoreStatus(storeStr, this.data.guid);
    }else if (prizecurrStoreInfo) {//优惠券门店对象 入口
      prevPage.setData({
        prizecurrStoreInfo: storeObj
      })
      wx.navigateBack()
    }
  },
  /**选择门店 */
  updateStore: function (e) {
    var target = e.currentTarget.dataset;
    var storeinfoM = {};
    if (target.target != 'current') {
      if (this.data.lucky) {
        //非当前current的列表点击逻辑
        var storeinfo = e.currentTarget.dataset.item;
        storeinfo.storeName = storeinfo.StoreName;
        storeinfo.storeCode = storeinfo.StoreCode;
        storeinfo.storeAddress = storeinfo.Province + storeinfo.City + storeinfo.Town + storeinfo.DetailAddr ;
        storeinfo.phone = storeinfo.Telephone;
        this.getStoreInfo(storeinfo);
      }
       else if (this.data.jika)//从集卡小程序跳进来选择门店
      {
        var storeinfo = e.currentTarget.dataset.item;
        var that=this;
        that.setData({
          jkStoreInfo: {
            jkstoreName: storeinfo.StoreName,//门店名称
            jkstoreCode: storeinfo.StoreCode,//门店号
          }
        });
        if (storeinfo && storeinfo.StoreName && storeinfo.StoreCode)
        {
        wx.setStorageSync("jikaStoreinfo", this.data.jkStoreInfo);
        }
       wx.navigateBack();
      }
       else {
        //首页入口
        //首页列表点击逻辑
        this.updateIndexStore(e);
        return
      }
    }else 
    { 
      var storeinfo = this.data.currStoreInfo;
      if (this.data.lucky){
        
        this.getStoreInfo(storeinfo)
      } 
      else if (this.data.jika)//从集卡小程序跳过来选择门店
      {
        var that = this;
        that.setData({
          jkStoreInfo: {
            jkstoreName: storeinfo.storeName,//门店名称
            jkstoreCode: storeinfo.storeCode,//门店号
          }
        });
        if (storeinfo && storeinfo.storeName && storeinfo.storeCode) {
        wx.setStorageSync("jikaStoreinfo", this.data.jkStoreInfo);
        }
        wx.navigateBack();
      }
      else{
        //首页入口
        console.log('首页入口')
        return
      }
  }
return
//如果切换了门店信息则把开屏礼包的弹框给关掉
    // var pages = getCurrentPages();
    // var prevPage = pages[pages.length - 2]; //获取上一页的信息
    // prevPage.setData({
    //   isShowScreen:false
    // });
    if (this.data.lucky!='')
    {
        var storeObj={};
        storeObj.TakeGoodsStoreName = storeinfoM.StoreName;
        storeObj.TakeOutStore = storeinfoM.StoreCode;
        storeObj.TakeGoodsStoreAddress = storeinfoM.TakeGoodsStoreAddress;
        prevPage.setData({
          prizecurrStoreInfo: {
            TakeGoodsStoreName: storeinfo.StoreName,
            TakeOutStore: storeinfo.StoreCode,
            TakeGoodsStoreAddress: storeinfo.Province + storeinfo.City + storeinfo.Town + storeinfo.DetailAddr,
            TakeGoodsStorePhone: storeinfo.Telephone
          }
        }); 
        var guid = wx.getStorageSync("guid");
        if (this.data.lucky == 'prize' && guid != '') {
          for (var i = 0; i < prevPage.data.myPrizeList.length; i++) {

            if (guid == prevPage.data.myPrizeList[i].GCGuId) {
              prevPage.data.myPrizeList[i].TakeGoodStore = storeinfo.StoreCode;
              prevPage.setData({
                myPrizeList: prevPage.data.myPrizeList
              });
              break;
            }
          }
          var storeStr = JSON.stringify(storeObj);
          this.updateChooseStoreStatus(storeStr, guid);
        }
    }
    
    

  },

  /**选择门店 原来*/
  updateStore2: function (e) {
    var storeinfo = e.currentTarget.dataset.item;
    app.currCity = storeinfo.City;
    app.latitude = storeinfo.GaoDeWeiDu;
    app.longitude = storeinfo.GaoDeJinDu;
    this.setData({
      currStoreInfo: {
        storeName: storeinfo.StoreName,
        storeCode: storeinfo.StoreCode,
        storeAddress: storeinfo.Province + storeinfo.City + storeinfo.Town + storeinfo.DetailAddr,
        storelat: storeinfo.GaoDeWeiDu,
        storelng: storeinfo.GaoDeJinDu,
        distance: storeinfo.Distance,
        province: storeinfo.Province
      }
    });
    wx.setStorageSync("storeinfo", this.data.currStoreInfo);

    //如果切换了门店信息则把开屏礼包的弹框给关掉
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //获取上一页的信息
    prevPage.setData({
      isShowScreen: false
    });

    wx.showToast({
      title: '选择门店成功！',
      icon: 'success',
      success: function () {
        setTimeout(function () {
          wx.navigateBack({

          });
        }, 1500);
      }
    });

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  hrefmap: function () {
    wx.navigateTo({
      url: '../map/map',
    });
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
    if (this.data.isCompelete) {
      return;
    }
    this.data.pageIndex++;
    this.loadStoreInfo(this.data.lat, this.data.lng, this.data.searchKeywords);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**当用户选择了门店，把门店保存到表里然后给用户发券 */
  updateChooseStoreStatus: function (storeInfo, gCGuId) {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      //var storeInfo = that.data.prizecurrStoreInfo;
      if (storeInfo== '') {
        return;
      }
      if (gCGuId == '') {
        return;
      }
      //var storeInfoStr = JSON.stringify(storeInfo);
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.UpdateChooseStoreStatus",
        biz: {
          sessionId: user.sessionId,
          gCGuId: gCGuId,
          storeInfo: storeInfo
        },
        success: function (res) {
          console.log("更改发券值");
          console.log(res)
          if (res.Code == "0") {

            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2]; //获取上一页的信息
            var myPrizeList = prevPage.data.myPrizeList
            for (var i=0; i < myPrizeList.length;i++){
              console.log(myPrizeList[i].GCGuId)
              console.log(gCGuId)
              if (myPrizeList[i].GCGuId == gCGuId){
                myPrizeList[i].TakeGoodStore_Code = JSON.parse(storeInfo).TakeOutStore
                myPrizeList[i].TakeGoodsStoreAddress = JSON.parse(storeInfo).TakeGoodsStoreAddress
                myPrizeList[i].TakeGoodsStoreName = JSON.parse(storeInfo).TakeGoodsStoreName
                myPrizeList[i].TakeGoodsStorePhone = JSON.parse(storeInfo).TakeGoodsStorePhone
                console.log(myPrizeList[i])
                prevPage.setData({
                  myPrizeList: myPrizeList
                });
                break;
              }
            }
            // return
            // myPrizeList.forEach((m,index)=>{
            //   if (m.GCGuId == gCGuId){
            //     myPrizeList[index] = gCGuId
            //     prevPage.setData({
            //       myPrizeList: myPrizeList
            //     });
            //   }
            // })
            wx.navigateBack();
          }else{
            wx.showToast({
              title: '服务器异常,请稍后重试',
              icon: 'none'
            })
          }
        },
        fail: function (msg) {
          wx.showToast({
            title: '服务器异常,请稍后重试',
            icon: 'none'
          })
        },
        complete: function (res) {
          that.setData({
            isPrize: false
          })
        }
      });
    });

  }
})