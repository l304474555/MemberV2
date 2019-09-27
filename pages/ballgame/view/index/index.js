import api from '../../util/apis.js';
import util from '../../util/util.js';
import bus from '../../util/bus.js';

let hide = false;
let shareParams = {};

Page({
    /**
     * 页面的初始数据
     */
    data: {
        debug: false,
        showGetUserInfo: false,
        canIUseGerUserInfo: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserPhone: wx.canIUse('button.open-type.getPhoneNumber'),
        version: 1,
        integral: 0,
        userInfo: {},
        static: {},
        moduleList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(params) {
        this.listen();
        let version = wx.getStorageSync('version');
        if (version !== this.data.version) {
            wx.setStorageSync('jwt', '');
            wx.setStorageSync('version', this.data.version);
        }

        const jwt = wx.getStorageSync('jwt');
        shareParams = params || {};
        if (!jwt) {
            this.setData({
                showGetUserInfo: true
            })

            util.checkGetUserInfo()
                .then(res => {
                    if (!res) {
                        this.setData({
                            showGetUserInfo: true
                        });
                    } else {
                        this.startLogin();
                    }
                })
        }
        this.initUI();
    },

    listen() {
        bus.on('update:config', () => {
            this.setData({
                static: {
                    bg: bus.getConfig('home.img.bg'),
                    logo: bus.getConfig('home.img.logo'),
                    title: bus.getConfig('home.img.title'),
                    btnRule: bus.getConfig('home.img.btnRule'),
                    btnShowIntegral: bus.getConfig('home.img.btnShowIntegral'),
                    userInfoBg: bus.getConfig('home.img.userInfoBg'),
                    btnHome: bus.getConfig('home.img.btnToHome'),
                    scoreName: bus.getConfig('other.other.scoreName')
                },
                moduleList: bus.moduleList
            })
            console.log(bus);
        })
        bus.on('update:userInfo', () => {
            this.setData({
                userInfo: bus.data.userInfo
            })
        })
        bus.on('update:integral', () => {
            this.setData({
                integral: bus.data.integral || 0
            })
        })
    },

    initUI() {
        api.boot(19)
            .then(res => {
                if (typeof res.config === 'string') {
                    res.config = JSON.parse(res.config);
                }
                Object.assign(bus.config, res.config.baseConfig);
                bus.moduleList = res.config.moduleList;
                let picList = res.config.listPicConfig;
                if (picList.length > 0) {
                    bus.picList = picList.reduce((pre, cur)=> {
                        pre[cur.event] = cur.img;
                        return pre;
                    }, {});
                }
                delete res.config;
                Object.assign(bus.data.activity, res);
                bus.emit('update:config');
            });
    },

    getUserInfo(e) {
        if (e.detail.userInfo) {
            this.startLogin();
        }
    },

    startLogin() {
        util.wxLogin()
            .then(res => {
                this.setData({
                    showGetUserInfo: false
                })
                bus.data.userMessage = res.userMessage;
                bus.data.token = res.token;
                bus.data.integral = res.integral.integral || 0;
                bus.emit('update:integral');
                this.checkFromShare();
            });
    },

    checkFromShare() {
        if (shareParams.type === 'web') {
            util.toPage({
                url: shareParams.url,
                params: {
                    ...JSON.parse(shareParams.params),
                    jwt: bus.data.token,
                    headimgurl: bus.data.userInfo.headimgurl,
                    nickname: bus.data.userInfo.name
                }
            })
        } else if (shareParams.type === 'wxmini') {
            // util.toPage({
            //     url: item.url,
            //     appid: item.appid
            // })
        }
        shareParams = {};
    },

    toPage({currentTarget: {dataset: {item}}}) {
        console.log(item)
        // wx.setClipboardData({
        //     data: bus.data.userInfo.headimgurl + ' ' + bus.data.token,
        //     success: function (res) {
        //         wx.showModal({
        //             title: '提示',
        //             content: '复制成功',
        //             showCancel: false
        //         });
        //     }
        // })
        if (!item.url) {
            return;
        }
        if (item.urlType.value === 'web') {
            util.toPage({
                url: item.url,
                params: {
                    jwt: bus.data.token,
                    headimgurl: bus.data.userInfo.headimgurl,
                    nickname: bus.data.userInfo.name
                }
            })
        } else if (item.urlType.value === 'wxmini') {
            util.toPage({
                url: item.url,
                appid: item.appid,
                jumpType: item.jumpType
            })
        }
    },

    showRule() {
        bus.emit('showRule', true);
    },

    showIntegral() {
        util.toPage({
            url: '/pages/ballgame/view/integral/index'
        })
    },

    toHome() {
        util.toPage({
            url: '/pages/yhq_index/yhq',
            jumpType: 'switchTab'
        })
    },

    onShow() {
        if (hide) {
            hide = false;
            this.initUI();
            util.getJwt()
                .then(res=> {
                    bus.data.userMessage = res.userMessage;
                    bus.data.token = res.token;
                    bus.data.integral = res.integral.integral || 0;
                    bus.emit('update:integral');
                })
        }
    },

    onHide() {
        hide = true;
    },

    onShareAppMessage() {
        let params = {
            title: bus.getConfig('other.other.shareTitle'),
            path: '/pages/ballgame/view/index/index',
            imageUrl: bus.getConfig('other.img.share')
        };
        return params;
    }
});
