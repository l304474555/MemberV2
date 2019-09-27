import Scratch from '../components/scratch/scratch.js'
import wenan from 'wenan.js'
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js")
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isStart: true,
    locationProvince: '定位中...', //用户定位到的省份
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP", //腾讯api地图key
    isShowUserInfoBtn: false, //用户是否已授权
    configInfo: null, //配置信息
    memberId: '', //会员编号
    isShowRule: false, //是否展示规则弹框
    result: -3, //刮一刮结果：0优惠券，-1；谢谢参与；-2初始
    isShowResult: false, //是否显示刮奖结果
    ismember: false, //是否是会员
    isbegin: false, //是否开始刮一刮
    sessionId: '',
    memberIdTxt: '', //我是第...个会员
    rule: '', //规则
    wenan: '', //文案
    isshowguagua: false,
    activityInfoData: '',
    lutteryNo: 0 //抽奖活动号

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    /**初始化刮刮乐组件 */
    let result = wx.getStorageSync("result");
    let lotterryno = wx.getStorageSync("lotterryno");
    let memberid = wx.getStorageSync("memberid");
    //let rule = wx.getStorageSync("rule");
    let wenan = wx.getStorageSync("wenan");
    let userLocationProvince = wx.getStorageSync("userlocation");
    if (result === '') {
      this.getAnniversaryRecord();
      // this.getUserlocation();
      // this.iniguagua("");
    } else if (result !== '' && memberid != '' && userLocationProvince != '' && wenan != '') {
      this.setData({
        memberIdTxt: '我是第' + memberid + '位会员',
        result: result,
        memberId: memberid,
        isShowRule: false,
        isshowguagua: false,
        locationProvince: userLocationProvince,
        wenan: wenan,
        // rule: rule,
        lutteryNo: lotterryno,
        isShowResult: true
      });
      //WxParse.wxParse('activityrule', 'html', rule, this, 1);
      //this.iniguagua("12345687");
    }
  },
  /**获取用户定位到的省份 */
  getUserlocation: function() {
    let timestap = Date.parse(new Date());
    let userLocationProvince = wx.getStorageSync("userlocation");
    let expretimelocation = wx.getStorageSync("locationp");

    if (userLocationProvince && expretimelocation < timestap) {
      //重新定位
      this.location();
    } else {
      if (userLocationProvince != '') //去缓存里的定位
      {
        this.setData({
          locationProvince: userLocationProvince
        });
        if (userLocationProvince != '广东省') {
          wx.showModal({
            title: '温馨提示',
            content: '该活动仅限广东省会员参与',
            showCancel: 'false'
          });
          return;
        } else {
          //加载活动信息
          this.getAnnisaryConfig();
        }
      } else {
        //重新定位
        this.location();
      }
    }
  },
  /**定位用户所在的省份 */
  location: function() {
    let that = this;
    let demo = new QQMapWX({
      key: that.data.key // 必填
    });

    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        /**纬度 */
        var latitude = res.latitude;
        /**经度 */
        var longitude = res.longitude;
        /**根据定位到的经纬度反转获取到城市 */

        demo.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(res) {
            console.log(res.result.address_component)
            if (res.result != null && res.result.address_component != null && res.result.address_component.province != '') {
              that.setData({
                locationProvince: res.result.address_component.province
              });
              /**把定位到的省份定位到缓存 */
              let timestap = Date.parse(new Date());
              let expretion = timestap + 86400000;
              wx.setStorageSync('locationp', expretion)
              wx.setStorageSync("userlocation", res.result.address_component.province);
            }
            if (res.result.address_component.province != '广东省') {
              wx.showModal({
                title: '温馨提示',
                content: '该活动仅限广东省会员参与',
                showCancel: 'false'
              });
              return;
            } else {
              //加载活动信息
              that.getAnnisaryConfig();
            }
          },
          fail: function(res) {
            console.log("逆地址解析城市失败");
          },
          complete: function(res) {}
        });
      },
      fail: function() {
        /**定位失败 */
        wx.showModal({
          title: '温馨提示',
          content: '请开启定位才能参与活动哦~',
          showCancel: false,
          success(res) {
            /**点击确定开启定位 */
            wx.openSetting({
              success: function(dataAu) {
                if (dataAu.authSetting["scope.userLocation"] == true) {
                  that.location();
                } else {
                  wx.showToast({
                    title: '授权失败',
                    icon: 'success',
                    duration: 1000
                  })
                }
              }
            });

          }
        });
      },
      complete: function() {

      }
    });
  },
  replaceShareWriting: function(text){
    function isNumber(val) {
      var regPos = /^\d+(\.\d+)?$/; //非负浮点数
      var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
      if (regPos.test(val) || regNeg.test(val)) {
        return true;
      } else {
        return false;
      }
    }
    if (!isNumber(text)){
      return text
    } else {
      let tempText = ''
      wenan.tempWenan.forEach(item=>{
        if(item.id==text){
          tempText = item.text
        }
      })
      return tempText
    }
  },
  /**获取活动配置信息 */
  getAnnisaryConfig: function() {
    var that = this;
    wx.showLoading({
      title: '载入中...请稍后',
    });
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      that.setData({
        sessionId: user.sessionId,
        result: -2
      });
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetAnnisaryConfig",
        biz: {
          sessionId: user.sessionId
        },
        success: function(res) {
          console.log("GetAnnisaryConfig");
          console.log(res);


          let result = wx.getStorageSync("result");
          if (res.Code == "0") {
            if (res.Result != null) {
              let infodata = {};
              infodata.Id = res.Result.Id;
              infodata.ActivityName = res.Result.ActivityName;
              infodata.LuckActiviyNo = res.Result.LuckActiviyNo;
              infodata.ShareWriting = res.Result.ShareWriting;
              infodata.MemberId = res.Result.MemberId;
              infodata.isAnnisaryMember = res.Result.isAnnisaryMember;
              infodata.CouponId = res.Result.CouponId;
              infodata.isData = res.Result.isData;
              let activityInfoDataStr = JSON.stringify(infodata);
              let wenan = that.replaceShareWriting(res.Result.ShareWriting)
              that.setData({
                configInfo: res.Result,
                wenan: wenan,
                activityInfoData: activityInfoDataStr
              });
              wx.setStorageSync("memberid", res.Result.MemberId);
              wx.setStorageSync("wenan", wenan);
              wx.setStorageSync("rule", res.Result.ActivityRule);
              wx.setStorageSync("activityid", res.Result.Id);
              // if (res.Result.ActivityRule!='')
              // {
              // WxParse.wxParse('activityrule', 'html', res.Result.ActivityRule, that, 1);
              // }
              if (result != '') {
                that.setData({
                  result: result
                });
                return;
              } else {
                that.iniguagua(res.Result.MemberId);
                setTimeout(function() {
                  const {
                    isStart
                  } = that.data
                  that.scratch.start();
                }, 1000);
              }
            }
          } else if (res.Code == "301") {
            that.setData({
              ismember: true
            });
            return;
          } else {
            if (result != '') {
              that.setData({
                result: result
              });
              return;
            } else {
              wx.showModal({
                title: '温馨提示',
                content: res.Msg,
                showCancel: false
              });
              that.iniguagua("");
            }
          }

        },
        fail: function(msg) {
          wx.showToast({
            title: '活动暂未开始哦',
            icon: 'none'
          });
          console.log("调用GetAnniversaryRecord失败" + JSON.stringify(msg));
        },
        complete: function(res) {
          wx.hideLoading();
        }
      });
    });
  },
  //重置刮一刮
  resetGuagua: function(){
    this.setData({
      isbegin: false,
      isShowResult: false,
      result: ''
    })
    if(this.scratch){
      this.scratch.restart()
    } 
    // else {
    //   this.iniguagua(this.data.memberId)
    // }
  },
  /**初始化刮一刮组件 */
  iniguagua: function(memberid) {
    let membertxt = '';
    if (memberid != '') {
      membertxt = "我是第" + memberid + "位会员";
    }
    let that = this;
    that.setData({
      memberId: memberid
    });
    that.scratch = new Scratch(that, {
      canvasWidth: 220,
      canvasHeight: 46,
      localImg:'../img/guagua.png',
      // imageResource: 'https://mimage.myj.com.cn/MicroMallFileServer/Files/CouponBanner/201906/fd52a5f77c3d52da.png',
      maskColor: 'red',
      r: 10,
      awardTxt: membertxt,
      awardTxtColor: '#3985ff',
      awardTxtFontSize: '24px',
      callback: () => {
        that.touchstart()
      },
      tapStart: () => {
        that.touchstart()
      }
    });
    //加载scratch的imageResource延迟显示遮罩图片
    setTimeout(()=>{
      this.setData({
        showSratch: true
      })
    },500)
  },
  /**刮奖 */
  aniversaryHandleResult: function() {
    var that = this;
    if (that.data.sessionId == '') {
      wx.showModal({
        title: '温馨提示',
        content: '您的登录信息已过期，正在重新登录请稍后...',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            myjCommon.getLoginUser(function(user) {
              if (!user.isLogin) {
                that.setData({
                  isShowUserInfoBtn: true
                });
                return;
              }
              that.aniversaryHandleResult(user.sessionId);
              that.setData({
                sessionId: user.sessionId
              });
            });
          }
        }
      });
      return;
    }
    if (that.data.activityInfoData == '') {
      that.getAnnisaryConfig();
      return;
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.AniversaryHandleResult",
      biz: {
        sessionId: that.data.sessionId,
        activityInfoData: that.data.activityInfoData,
        province: that.data.locationProvince
      },
      success: function(res) {
        wx.hideLoading();
        console.log("刮奖结果");
        console.log(res);
        if (res.Code == "0") {
          if (res.Result != null) {
            if (res.Result > 10) {//抽奖的
              that.setData({
                result: 1,
                lutteryNo: res.Result,
                isShowResult: true
              });
              wx.setStorageSync("result", 1);
              wx.setStorageSync("lotterryno", res.Result);
            } else if (res.Result==2)//优惠券
            {
              that.setData({
                result: 2,
                isShowResult: true
              });
              wx.setStorageSync("result", 2);
            }
             else {//谢谢参与
              that.setData({
                result: 0,
                isShowResult: true
              });
              wx.setStorageSync("result", 0);
            }
          }

        } else if (res.Code == "301") {
          that.setData({
            ismember: true
          });
          return;
        } else {
          that.setData({
            result: -1,
            isShowResult: true
          });
        }
    
      },
      fail: function(msg) {
        that.setData({
          result: -1,
          isShowResult: true
        });
        // wx.setStorageSync("result", -1);
        console.log("调用AniversaryHandleResult失败" + JSON.stringify(msg));
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  /**查询用户是否已刮过奖，如果已经刮过奖了则不在让它刮奖并且把刮奖结果缓存起来 */
  getAnniversaryRecord: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      wx.showLoading({
        title: '结果加载中...请稍后',
      });
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetAnniversaryRecord",
        biz: {
          sessionId: user.sessionId
        },
        success: function(res) {
          console.log("调用GetAnniversaryRecord结果");
          console.log(res);
          if (res.Code == "0") {
            let result = res.Result;
            that.setData({
              memberIdTxt: '我是第' + result.MemberId + '位会员',
              result: result.IsLottery,
              isshowguagua: false,
              isShowResult: true,
              wenan: result.Wenan,
              locationProvince: result.Province
            });
            if (result.IsLottery == 1 && result.ActivityId > 0) {
              that.setData({
                lutteryNo: result.ActivityId
              });
              wx.setStorageSync("lotterryno", result.ActivityId);
            }
            wx.setStorageSync("memberid", result.MemberId);
            wx.setStorageSync("wenan", result.Wenan);
            wx.setStorageSync("rule", result.ActivityRule);
            wx.setStorageSync("result", result.IsLottery);
            wx.setStorageSync("activityid", res.Result.AnniversaryId);
            if (result.Province != '') {
              wx.setStorageSync("userlocation", result.Province);
            }
            if (result.ActivityRule != '') {
              WxParse.wxParse('rule', 'html', result.ActivityRule, that, 1);
            }
          } else {
            that.getUserlocation();
            // that.iniguagua("");
          }
        },
        fail: function(msg) {
          console.log("调用GetAnniversaryRecord失败" + JSON.stringify(msg));
        },
        complete: function(res) {
          wx.hideLoading();
        }
      });
    });
  },
  /**加载活动规则   */
  getActivityRule: function() {
    let that = this;
    let id = wx.getStorageSync("activityid");
    if (id == "") {
      if (that.data.configInfo.activityid != '')
        return;
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetAnniverryRule",
      biz: {
        anniveryId: id
      },
      success: function(res) {
        console.log("GetAnniverryRule");
        console.log(res);
        if (res.Code == "0") {
          if (res.Result != null) {
            that.setData({
              rule: res.Result,
              isShowRule: true
            });
            WxParse.wxParse('activityrule', 'html', res.Result, that, 1);
            // let rule = wx.getStorageSync("rule");
            // wx.setStorageSync("rule", res.Result);
          }
        } else {
          that.setData({
            isShowRule: true
          });
        }
      },
      fail: function(msg) {
        console.log("调用GetAnniversaryRecord失败" + JSON.stringify(msg));
        that.setData({
          isShowRule: true
        });
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  touchstart: function() {
    console.log("开始刮")
    if (this.data.isbegin) {
      console.log("已经刮过了")
      return;
    } else {
      console.log("刮第一次")
      this.setData({
        isbegin: true
      });
      wx.showLoading({
        title: '结果即将出来请耐心等待！',
      });
      this.aniversaryHandleResult();
     
    }
  },
  /**刮完后显示结果 */
  touchend: function() {
    console.log("结束了")
    this.setData({
      isShowResult: true
    });
  },
  /**跳去翻牌抽奖 */
  toLotterry: function() {
    wx.navigateTo({
      url: '/pages/yhq_luckdraw/yhq_luckdraw?activityid=' + this.data.lutteryNo,
    });
  },
  /**点返回按钮返回首页 */
  backindex: function() {
    wx.switchTab({
      url: '/pages/yhq_index/yhq',
    });
  },
  /**关闭活动规则 */
  closeTast: function() {
    var that = this;
    that.setData({
      isshowguagua: false,
      isShowRule: false
    });

  },
  /**展示活动规则 */
  showRules: function() {
    this.getActivityRule();
    this.setData({
      isshowguagua: true
    });
  },
  /**分享给朋友 */
  shareFriends: function() {
    this.onShareAppMessage();
  },
  /**跳转到我的优惠券页面 */
  toMyCoupon: function() {
    wx.switchTab({
      url: '/pages/yhq_voucher/yhq_voucher',
    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      noMemberTask: false
    });
    myjCommon.logFormId(e.detail.formId);
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  closeTask:function()
  {
    this.setData({
      ismember:false
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  getUserInfoBtnClick: function(e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.getAnnisaryConfig();
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var sharetitle ='刮开有2个“2”就能抽大奖啦，快来看你有多“2”~';
    //result==1 && isShowResult
    if (this.data.isShowResult  && this.data.memberId!='')
    {
      sharetitle = "我的编号是" + this.data.memberId;
      if (this.data.result==1)
      {
        sharetitle = sharetitle+",获得一次抽奖机会哦~"
      } else if (this.data.result == 2)
      {
        sharetitle = sharetitle + "，获得了一张优惠券哦～"
      }
    }
    return {
      title: sharetitle,
      imageUrl: 'https://mimage.myj.com.cn/MicroMallFileServer/Files/EditorPic/201906/8t7y8t7ut.png',
      path: 'pages/anniversary/anniversary',
      success: (res) => {}
    }
  }
})