// custom-tab-bar/custom-tab-bar.js
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    companyCode: {
      type: String,
      value: 'GD'
    },
    selectIndex: {
      type: String,
      value: '0'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: 0,
    color: "#333333",
    selectedColor: "#d1121b",
    gdList: [{
      pagePath: "/pages/yhq_index/yhq",
      iconPath: "/pages/img/nav_01.png",
      selectedIconPath: "/pages/img/nav_01_select.png",
      text: '首页',
      isToMiniProgram: false,
      appId: ''
    }, {
      pagePath: "",
      iconPath: "/image/takeout1.png",
      selectedIconPath: "/image/takeout2.png",
      text: '外卖',
      isToMiniProgram: true,
      appId: 'wx64286f463c42df55'
    }, {
      pagePath: "",
      iconPath: "/image/groupbuy1.png",
      selectedIconPath: "/image/groupbuy2.png",
      text: '团购',
      isToMiniProgram: true,
      appId: 'wx572796b93d5c783b'
    }, {
      pagePath: "/pages/yhq_voucher/yhq_voucher",
      iconPath: "/pages/img/nav_02.png",
      selectedIconPath: "/pages/img/nav_02_select.png",
      text: '我的券',
      isToMiniProgram: false,
      appId: ''
    }, {
      pagePath: "",
      iconPath: "/pages/img/nav_03.png",
      selectedIconPath: "/pages/img/nav_03_select.png",
      text: '会员卡',
      isToMiniProgram: true,
      appId: 'wxc94d087c5890e1f8'
    }],
    otherList: [{
      pagePath: "/pages/yhq_index/yhq",
      iconPath: "/pages/img/nav_01.png",
      selectedIconPath: "/pages/img/nav_01_select.png",
      text: '首页',
      isToMiniProgram: false,
      appId: ''
    }, {
      pagePath: "/pages/yhq_promotion/yhq_promotion",
      iconPath: "/pages/img/nav_04.jpg",
      selectedIconPath: "/pages/img/nav_04_select.jpg",
      text: '附近优惠',
      isToMiniProgram: false,
      appId: ''
    }, {
      pagePath: "/pages/yhq_voucher/yhq_voucher",
      iconPath: "/pages/img/nav_02.png",
      selectedIconPath: "/pages/img/nav_02_select.png",
      text: '我的券',
      isToMiniProgram: false,
      appId: ''
    }, {
      pagePath: "",
      iconPath: "/pages/img/nav_03.png",
      selectedIconPath: "/pages/img/nav_03_select.png",
      text: '会员卡',
      isToMiniProgram: true,
      appId: 'wxc94d087c5890e1f8'
    }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeTab(e) {
      let {
        index,
        url,
        istominiprogram,
        appid
      } = e.currentTarget.dataset;

      // let {
      //   selected
      // } = this.data;
      // if (selected === index) return;
      // wx.switchTab({
      //   url
      // })
      // wx.navigateTo({
      //   url: url,
      // })
      if (!istominiprogram) {
        wx.redirectTo({
          url: url,
        })
      } else {
        wx.navigateToMiniProgram({
          appId: appid,
        })
      }


      // this.setData({
      //   selected: index
      // })
    }
  }
})