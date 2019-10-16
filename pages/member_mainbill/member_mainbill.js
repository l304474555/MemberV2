var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateList:[], //账单月份
    currMonth:'',
    currYear:'',
    currYandMonth:'',//当前年月
    pageIndex:1,
    pageSize:10,
    billDtlList:[],//账单列表明细
    isCompleted:false,
    totalBillInfo:null,//汇总信息
    showdate:false,
    isShowUserInfoBtn:false,
    isreturn:false,
    isloadcompelete:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if (this.data.isreturn)
    {}else
    {
    this.getcureeMonth();
    //app.currProvince="广东省";
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      billDtlList: [],//账单列表明细
      isCompleted: false,
      totalBillInfo:null
    });
    }
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
    //在标题栏中显示加载
    wx.showNavigationBarLoading();
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      billDtlList: [],//账单列表明细
      isCompleted: false,
      totalBillInfo: null
    }, () => { this.getcureeMonth();});
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.loadBillDtlList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**展示日期 */
  showDate: function () {
    if (this.data.showdate) {
      this.setData({
        showdate: false
      });
    } else {
      this.setData({
        showdate: true
      });
    }
  },
  /**获取当前月份和上个月份 */
  getcureeMonth:function()
  {
    var date=new Date();
    var currMonth = (date.getMonth()+ 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); //当前月
    
    var lastMonth = (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()); //上个月
    var lastlaterMonth = (date.getMonth() - 1 < 10 ? '0'+ (date.getMonth() - 1) : date.getMonth() - 1); //上个月
    var year = date.getFullYear().toString();
    if (date.getMonth() + 1<=1)
    {
      //year = date.getFullYear()-1;
      lastMonth=12;
      lastlaterMonth=11;
    } else if (lastMonth==1)
    {
      lastlaterMonth = 12;
    }
    var arrMonth=[];
    arrMonth.push(currMonth);
    arrMonth.push(lastMonth);
    arrMonth.push(lastlaterMonth);
    console.log(arrMonth)
    this.setData({
      dateList: arrMonth,
      currMonth: currMonth,
      currYear: year,
      currYandMonth: (year.toString() + currMonth.toString())
    });
    this.loadBill();
    this.loadBillDtlList();
  },
  /**加载账单信息 */
  loadBill:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      wx.showLoading({
        title: '数据载入中...',
      });
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetMemberBillTotal",
        biz: { 
          sessionId: user.sessionId, 
          currMonth: that.data.currYandMonth,
          provinceName: app.currProvince
           },
        success: function (res) {
          
          if(res.Result!=null)
          {
            that.setData({
              totalBillInfo: res.Result
            });
          }
        },
        fail: function (msg) {
          console.log("调用GetMemberBillTotal接口失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideNavigationBarLoading();
          // 停止下拉动作
          wx.stopPullDownRefresh();
        }
      });
    });
  },
  loadBillDtlList:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.WeiXinPayOrderDtl",
        biz: {
          sessionId: user.sessionId,
          currMonth: that.data.currYandMonth,
          provinceName: app.currProvince,
          pageSize: that.data.pageSize,
          pageIndex: that.data.pageIndex
        },
        success: function (res) {
          console.log(res)
          if (res.Result.EntityList!=null)
          {
          var list = that.data.billDtlList.concat(res.Result.EntityList);
            that.setData({
              billDtlList: list
            });
          //是否加载完
          var pCount = parseInt(res.Result.TotalCount / that.data.pageSize);
          if (res.Result.TotalCount % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompleted: true
            });
          }
          }
        },
        fail: function (msg) {
          console.log("调用WeiXinPayOrderDtl接口失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
          that.setData({
            isloadcompelete:true
          });
          wx.stopPullDownRefresh();
        }
      });
    });
  },
  /**选择月份查询账单 */
  searchBill:function(e)
  {

    var date = new Date();
    var currMonth = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); //当前月

    var lastMonth = (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()); //上个月
    var lastlaterMonth = (date.getMonth() - 1 < 10 ? '0' + (date.getMonth() - 1) : date.getMonth() - 1); //上个月
    var year = date.getFullYear().toString();

    //选择的月份
    var month = e.target.dataset.month;

    if (month == 11 || month == 12)
    {
      year = date.getFullYear()-1;
    }
    this.setData({
      showdate:false,
      currYandMonth: (year+month.toString()),
      currMonth: month,
      pageIndex: 1,
      pageSize: 10,
      billDtlList: [],//账单列表明细
      totalBillInfo:null,
      isreturn:false,
      isCompleted: false
    });
    this.loadBill();
    this.loadBillDtlList();
  },
  urlDtl:function(e)
  {
    var uid = e.currentTarget.dataset.uid;
    console.log(uid)
    var storeName = e.currentTarget.dataset.storename;
    var yandmonth = e.currentTarget.dataset.yandmonth;
    wx.navigateTo({
      url: '../member_bill_detail/member_bill_detail?uid=' + uid + '&storename=' + storeName + '&YearandMonth=' + yandmonth,
    });
  },
  getUserInfoBtnClick: function (e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.getUserLocationInfo();
    }
  },
  retunMemberIndex:function()
  {
    wx.reLaunch({
      url: '../member_index/member_index',
    });
  }

})