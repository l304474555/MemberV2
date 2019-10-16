// pages/member_account/member_account.js
var myjCommon = require("../../utils/myjcommon.js");
var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    endYear: '',
    currUserInfo: null, //用户信息
    tags: [], //标签数组
    selectedtags: [], //选中的标签
    selectedtagsStr: "",
    starSign: '', //星座
    gender: ['女', '男'],
    genIndex: 0,
    profession: [],
    proIndex: 0,
    istagsTask: false, //显示标签选择框,
    remindTask: false, //标签选择提示框
    upSucesstask: false, //修改信息成功提示框
    target: false,
    isMember: false, //是否是会员弹框
    erroMsg: '', //提示信息
    errTags: [], //添加标签时弹出框会刷出原来的
    localtarget: "index" //保存会员信息后返回上一个操作，入口有2个
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.GetUserInfo();
    var target = options.target;
    this.setData({
      localtarget: target
    });
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
    var myDate = new Date();
    var year = myDate.toLocaleDateString();
    this.setData({
      endYear: year
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //把选中的日期显示到文本框
  bindDateChange: function(e) {
    var that = this;
    //选择的年月日
    var seleDate = e.detail.value;
    //截取月份
    var month = seleDate.substring(5, 7);
    //截取日期
    var date = seleDate.substring(8, 10);
    //根据选择的日期赋值对应的星座
    var star = that.getStarbydate(month, date);
    this.setData({
      date: seleDate,
      starSign: star
    })
  }, //根据月份匹配星座
  getStarbydate: function(month, date) {
    var star = '';
    if (month == '01' && date >= 20 || month == '02' && date <= 18) {
      star = "水瓶座";
    }

    if (month == '02' && date >= 19 || month == '03' && date <= 20) {
      star = "双鱼座";
    }

    if (month == '03' && date >= 21 || month == '04' && date <= 20) {
      star = "白羊座";
    }

    if (month == '04' && date >= 21 || month == '05' && date <= 20) {
      star = "金牛座";
    }

    if (month == '05' && date >= 21 || month == '06' && date <= 21) {
      star = "双子座";
    }

    if (month == '06' && date >= 22 || month == '07' && date <= 22) {
      star = "巨蟹座";
    }

    if (month == '07' && date >= 23 || month == '08' && date <= 22) {
      star = "狮子座";
    }

    if (month == '08' && date >= 23 || month == '09' && date <= 22) {
      star = "处女座";
    }

    if (month == '09' && date >= 23 || month == 10 && date <= 22) {
      star = "天秤座";
    }

    if (month == 10 && date >= 23 || month == 11 && date <= 21) {
      star = "天蝎座";
    }

    if (month == 11 && date >= 22 || month == 12 && date <= 21) {
      star = "射手座";
    }

    if (month == 12 && date >= 22 || month == '01' && date <= 19) {
      star = "摩羯座";
    }
    return star;
  },
  //职业选择
  SelectProChange: function(e) {
    this.setData({
      proIndex: e.detail.value
    });

  },
  //性别选择
  selectSexChange: function(e) {
    this.setData({
      genIndex: e.detail.value
    });
  },
  //获取用户信息
  GetUserInfo: function() {
    wx.showLoading({
      title: '信息载入中...',
    })
    var that = this;
    myjCommon.getLoginUser(
      function(user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: '登录失败，请稍后重试。',
            showCancel: false
          });
          return false;
        }
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetUserInfo",
          biz: {
            sessionId: user.sessionId
          },
          success: function(res) {
            if (res.Code == "301") {
              that.setData({
                isMember: true
              });
              /**初始化注册会员组件方法 */
              that.regerter1 = that.selectComponent("#regerter");
              that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
              return;
            } else {

              //职业
              var job = "";
              var jobList = [];
              var item = [];
              if (res.Job != undefined) {
                if (res.Job.length > 0) {
                  if (res.Job[0].JobContent != "") {
                    job = res.Job[0].JobContent;
                    jobList = job.split(' ');
                    for (var i = 0; i < jobList.length; i++) {
                      item.push({
                        index: i,
                        name: jobList[i]
                      });
                    }
                    that.setData({
                      profession: item
                    });
                  }
                }
              }

              //标签
              var firstTags; //一级标签
              var secondTag = []; //二级标签
              var newSecondTags = []; //二级标签新数组包含了是否被选中的字段
              var tags = [];

              if (res.Tag != undefined) {
                if (res.Tag.length > 0 && !that.data.target) {
                  for (var i = 0; i < res.Tag.length; i++) {
                    newSecondTags = [];
                    firstTags = res.Tag[i].FirstTag;
                    secondTag = res.Tag[i].SecondTag.split(' '); //以空格拆分二级标签
                    for (var k = 0; k < secondTag.length; k++) {
                      newSecondTags.push({
                        secondTag: secondTag[k],
                        isSelected: false
                      });
                    }
                    tags.push({
                      firstTags: firstTags,
                      secondTag: newSecondTags
                    });
                  }
                  that.setData({
                    tags: tags
                  });
                }
              }
              if (res.UserInfo != undefined) {
                //个人信息
                if (res.UserInfo != null) {
                  that.setData({
                    currUserInfo: res.UserInfo
                  });

                  //处理标签
                  if (res.UserInfo.Tags != "") {
                    var mytags = [];
                    mytags = res.UserInfo.Tags.split('$');
                    var item = [];
                    var tagsStr = "";
                    for (var i = 0; i < mytags.length; i++) {
                      tagsStr = tagsStr + mytags[i] + "$";
                      item.push({
                        mytags: mytags[i]
                      });
                    }
                    var tasg = tagsStr.substring(tagsStr.length - 1, 0);
                    that.setData({
                      selectedtags: item,
                      selectedtagsStr: tasg,
                      errTags: item
                    });
                  }

                  //处理日期格式 只取年月日
                  if (res.UserInfo.Birthday != null && res.UserInfo.Birthday != "1900-01-01T00:00:00") {
                    var date = res.UserInfo.Birthday.substring(0, 10);
                    var month = date.substr(5, 2);
                    var day = date.substr(8, 2);
                    //根据日期显示对应的星座
                    var star = that.getStarbydate(month, day);
                    that.setData({
                      date: date,
                      starSign: star
                    });

                  }

                  //处理性别
                  if (res.UserInfo.Sex != null) {
                    that.setData({
                      genIndex: res.UserInfo.Sex
                    });
                  }

                  //处理职业
                  if (res.UserInfo.Profession != "") {
                    for (var i = 0; i < that.data.profession.length; i++) {
                      if (that.data.profession[i].name == res.UserInfo.Profession) {
                        that.setData({
                          proIndex: that.data.profession[i].index
                        });
                        break;
                      }
                    }
                  }
                }
              }

            }
          },
          fail: function(msg) {
            console.log("调用api失败" + JSON.stringify(msg));
          },
          complete: function(res) {

          }

        });

      });

    wx.hideLoading();
  },
  //选择标签
  selectTags: function(e) {
    var that = this;
    //当前选中的标签
    var currSelectTag = e.target.dataset.tag;
    var list = that.data.tags;
    var item = null;

    for (var i = 0; i < list.length; i++) {
      for (var k = 0; k < list[i].secondTag.length; k++) {
        if (list[i].secondTag[k].secondTag == currSelectTag) {
          item = list[i].secondTag[k];
          break;
        }
      }
    }
    if (item != null) {
      item.isSelected = !item.isSelected;
      this.setData({
        tags: list
      })
    }
  },
  //保存标签
  saveTags: function() {
    this.setData({
      selectedtags: [],
      selectedtagsStr: "",
      target: false
    });
    var list = this.data.tags;
    var seleTagList = [];
    var seletagstr = "";
    //判断 每个分类选择1~3个选项
    //var count=0; //用于判断所选的标签是否是1-3个 少于或者多出要弹出提示框


    var that = this;
    for (var i = 0; i < list.length; i++) {
      for (var k = 0; k < list[i].secondTag.length; k++) {
        if (list[i].secondTag[k].isSelected) {
          seletagstr = seletagstr + list[i].secondTag[k].secondTag + "$";
          //count=count+1;
          seleTagList.push({
            mytags: list[i].secondTag[k].secondTag
          });
        }
      }
      /*
       if(count>=1 && count<=3)
       {
         count=0;
         continue;
       }else
       {
        that.setData({
          target:true 
        });  
         wx.showModal({
           title: '温馨提示',
           content: '请每个分类选择1~3个选项哦。选择完成后点击确定即可',
           showCancel:false,
           success: function (res) {
             that.setData({
               selectedtags: that.data.errTags
             });
           }
         })
         break;
       }*/
    }

    //去掉最后一个字符
    if (!that.data.target) {
      var tagsstr = seletagstr.substring(seletagstr.length - 1, 0);
      that.setData({
        istagsTask: false,
        selectedtags: seleTagList,
        selectedtagsStr: tagsstr,
        target: false
      });

    }
  },
  //弹出标签选择框
  showtagsTask: function() {
    //解析显示用户之前已选的标签
    var mytags = this.data.selectedtags;
    var tags = this.data.tags;
    var firsttag = '';
    var newtags = [];
    var sescondtag = [];
    var isselcted = false;
    for (var i = 0; i < tags.length; i++) {
      firsttag = tags[i].firstTags;
      sescondtag = [];
      for (var j = 0; j < tags[i].secondTag.length; j++) {
        isselcted = false;
        for (var k = 0; k < mytags.length; k++) {
          if (mytags[k].mytags == tags[i].secondTag[j].secondTag) {
            isselcted = true
          } else {
            continue;
          }
        }
        sescondtag.push({
          isSelected: isselcted,
          secondTag: tags[i].secondTag[j].secondTag
        });
      }


      newtags.push({
        firstTags: firsttag,
        secondTag: sescondtag
      });
    }
    this.setData({
      tags: newtags
    });

    this.setData({
      istagsTask: true
    });
  }, //关闭弹框
  closeTask: function() {

    this.setData({
      istagsTask: false,
      upSucesstask: false,
      isMember: false
    });
  },
  returnindex: function() {
    if (this.data.localtarget == 'center') {
      wx.reLaunch({
        url: '../member_center/member_center',
      })
    } else {
      wx.reLaunch({
        url: '../member_index/member_index',
      })
    }

  },
  //关闭提示框
  closeRmind: function() {
    if (!app.globalData.refreshFlag) {


      this.setData({
        remindTask: false
      });

      this.GetUserInfo();
    }
  },
  //提交表单
  submitInfo: function(e) {
    var erroMsg = '';
    var nickName = e.detail.value["nickname"];
    var mobile = e.detail.value["mobile"];
    var sex = e.detail.value["sex"];
    var birthday = e.detail.value["birthday"];
    var starsign = e.detail.value["starPro"];
    var promition = e.detail.value["profetion"];
    var hoby;

    if (mobile == '') {
      erroMsg = '请填写手机号';
      this.setData({
        erroMsg: erroMsg
      });
      return false;
    } else if (sex == '') {
      erroMsg = '请选择性别';
      this.setData({
        erroMsg: erroMsg
      });
      return false;

    } else if (birthday == '') {
      erroMsg = '请选择生日';
      this.setData({
        erroMsg: erroMsg
      });
      return false;
    } else if (this.data.selectedtags.length <= 0) {
      erroMsg = '必须选择最少1个，最多3个喜好';
      this.setData({
        erroMsg: erroMsg
      });
      return false;
    }
    var sexindex = 0;
    if (sex == "女") {} else {
      sexindex = 1
    }

    var that = this;
    myjCommon.getLoginUser(
      function(user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: '登录失败，请稍后重试。',
            showCancel: false
          });
          return false;
        }
        /*
        console.log(user.sessionId)
        console.log(nickName);
        console.log(mobile);
        console.log(sexindex)
        console.log(birthday)
        console.log(starsign)
        console.log(promition)
        console.log(that.data.selectedtagsStr)*/

        //调用修改接口修改新
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.AddUserInfo",
          biz: {
            sessionId: user.sessionId,
            nickName: nickName,
            mobile: mobile,
            sex: sexindex,
            birthday: birthday,
            statSign: starsign,
            profetion: promition,
            hoby: that.data.selectedtagsStr
          },
          success: function(res) {
            if (res.Msg == "成功") {
              /* that.setData({
                 upSucesstask:true
               });*/
              wx.showToast({
                title: '修改信息成功',
                icon: 'success',
                duration: 2000,
                success: function(e) {
                  setTimeout(function() {
                    if (that.data.localtarget == "index") {
                      wx.switchTab({
                        url: '../member_index/member_index',
                      })
                    } else {
                      wx.switchTab({
                        url: '../member_center/member_center',
                      })
                    }
                  }, 1500) //延迟时间 这里是1秒  
                },
                fail: function() {},
                complete: function() {

                }
              })


            }
          },
          fail: function(msg) {
            console.log("调用AddUserInfo失败" + JSON.stringify(msg));
          },
          compelete: function() {

          }
        });

      });
  },
  //领取会员卡
  getMemberCard: function(e) {
    var that = this;
    // myjCommon.logFormId(e.detail.formId);
    wx.switchTab({
      url: "/pages/member_card/index"
    });
    that.setData({
      isMember: false
    });
  }

})