// pages/sign/sign.js
const app = getApp();
const myjCommon = require("../../utils/myjcommon.js");
const WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curYear: new Date().getFullYear(), // 年份
    curMonth: new Date().getMonth()+1,// 月份 0-11
    day: new Date().getDate(), // 日期 1-31 若日期超过该月天数，月份自动增加
    weeksType:'cn',
    isShowRule:false,
    isShowSign: false,
    MemberCnt:'0',//我的积分
    datColor: [],//日历签到数组
    signNum:0,//累积签到次数
    MemberSign:null,
    containDay:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GetMemberSignConfigInfo();
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

  },
  //获取配置
  GetMemberSignConfigInfo(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    myjCommon.getLoginUser(function (user) {
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetMemberSignConfigInfo",
        biz: {
          sessionId: user.sessionId,
          provinceName: app.currProvince,
          cityName: app.currCity,
          channel:1
      },
        success: function (res) {
          console.log(res)
          if(res.Code==0){
            that.setData({
              Banners: res.Result.Banners,
              SignRecords: res.Result.SignRecords,
              MemberSignRules: res.Result.MemberSignRules,
              MemberCnt: res.Result.MemberCnt
            });
            if (res.Result.MemberSign)
            {
            let SignRecords = res.Result.SignRecords;
            that.setData({
              MemberSign: res.Result.MemberSign
            })
            that.recordToDataColor(SignRecords);
            }else
            {
              wx.showModal({
                title: '温馨提示',
                content: '暂无配置签到活动信息哦',
                showCancel:false
              })
            }
          }else
          {
            wx.showModal({
              title: '温馨提示',
              content: res.Msg,
              showCancel:'none'
            });
          }
        },
        fail: function (msg) {
          console.log("获取配置失败：" + JSON.stringify(msg));
        },
        complete: function (res) { wx.hideLoading(); }
      })
    })
  },
  //已签到改变日历颜色
  recordToDataColor(records){
    let data = [],that = this;
    records.forEach(item=>{
      let day = item.SignTime.split(' ')[0];
      let month = 'current'
      day = day.split('-')
      if (day[1] * 1 < this.data.curMonth) { month = 'prev' };
      data.push({
        month: month,
        day: day[2],
        color: '#fff',
        background: '#fb4d3e'
      })
    })
    that.setData({
      datColor: data
    })
    that.checkCanNotTapSign()
  },
  checkCanNotTapSign(){
    this.data.datColor.forEach(item=>{
      if (item.day == this.data.day && item.month == 'current'){
        this.setData({
          canNotTapSign: true
        })
      }
    })
  },
  //点击签到
  tapSign(){
    if (this.data.MemberSign==null ||this.data.canNotTapSign){return;};
    let that = this, getCnt='',couponid=0;
    let count = 0, consecutiveDays='';
    let containDay=0;
    this.data.MemberSignRules.forEach(item=>{
      if (item.ConsecutiveDays == (this.data.datColor.length+1)){
        getCnt = item.RewardPoints
        couponid = item.CouponActivityId||0
        consecutiveDays = item.ConsecutiveDays || 0
      }
      count++;
      if (count == this.data.MemberSignRules.length && getCnt==='')
      {
        containDay = this.data.datColor.length;
        getCnt = this.data.MemberSignRules[0].RewardPoints
        couponid = this.data.MemberSignRules[0].CouponActivityId || 0
        consecutiveDays = this.data.MemberSignRules[0].ConsecutiveDays
        
        this.setData({
          datColor:[],
          containDay: containDay
        })
      }
    });
    wx.showLoading({
      title: '签到中',
    });
    myjCommon.getLoginUser(function (user) {
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.MemberSigns",
        biz: {
          sessionId: user.sessionId,
          consecutiveDays: consecutiveDays, 
          getCnt: getCnt, 
          companyCode: that.data.MemberSign.CompanyCode, 
          couponId: couponid,
          channel:1,
          activityId: that.data.MemberSign.SignActivityId
        },
        success: function (res) {
          console.log(res)
          if (res.Code == 0) {
            that.data.datColor.push({
              month: 'current',
              day: that.data.day,
              color: '#fff',
              background: '#fb4d3e'
            })
            that.data.MemberCnt+=getCnt;
            that.setData({
              getCnt: getCnt,
              isShowSign: true,
              datColor: that.data.datColor,
              MemberCnt: that.data.MemberCnt
            })
            that.checkCanNotTapSign()
          }else{
            var tips = (res.Msg)
            wx.showToast({
              title: tips,
            })
          }
        },
        fail: function (msg) {
          console.log("签到失败:" + JSON.stringify(msg));
        },
        complete: function (res) { wx.hideLoading(); }
      })
    })
  },
  //点击签到规则
  tapSignRule(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMemberSignRule",
      biz: {
        provinceName: app.currProvince,
        channel: 1
      },
      success: function (res) {
        console.log(res)
        if (res.Code == 0) {
          WxParse.wxParse('article', 'html', res.Result, that, 1);
          that.setData({
            isShowRule: true
          })
        }
      },
      fail: function (msg) {
        console.log("获取签到规则失败:" + JSON.stringify(msg));
      },
      complete: function (res) {
        wx.hideLoading();
      }
    })
  },
//点击banner
  tapBanners(e){
    console.log(e)
    let that = this,item = e.currentTarget.dataset.item;
    if (item) {
      //跳转小程序
      if (item.Jump == 2) {
        //有配置appid和页面路径，如果没有配置页面路径就直接跳转对应appid的小程序的首页
        if (item.PagePath != undefined) {
          if (item.AppId == this.data.currenAppid) { wx.navigateTo({ url: item.PagePath }); return; }
          wx.navigateToMiniProgram({
            appId: item.AppId,
            path: item.PagePath,
            envVersion: 'release',
            success(res) {
            }
          });
        }
      } else if (item.Jump == 4) {//跳转其他页面
        wx.navigateTo({
          url: '../bannerWeb/bannerWeb?bannerUrl=' + item.JumpLink
        })
      }
    }
  },
  //关闭规则弹窗
  closeRuleMsg(){
    this.setData({
      isShowRule:false,
      isShowSign:false
    })
  },
  locationCoin: function (e) {
    var target = e.currentTarget.dataset.target;
      wx.navigateTo({
        url: '../member_dh/member_dh'
      });
  }
})