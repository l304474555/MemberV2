import api from './apis.js';
import bus from './bus.js';

const entries = obj=> {
    let result = [];
    for (let key in obj) {
        result.push([key, obj[key]]);
    }
    return result;
};

const makeUrlParams = params=> {
    return entries(params).map(([k, v])=> `${k}=${v}`).join('&');
}

const makeUrlParams2 = ({url = '', params = {}, obj = {}})=> {
    url = url.split('?');
    url.push('')
    const arr = url[1].split('&');
    if (arr.length > 0) {
        Object.assign(params, arr.reduce((pre, item) => {
            item = item.split('=');
            if (item.length < 2) {
                return pre;
            }
            const key = item[0]
            item.splice(0, 1);
            pre[key] = item.reduce((pre, cur) => `${pre}${cur}`);
            return pre;
        }, {}));
    }
    params = {
        url: url[0],
        ...obj,
        params: JSON.stringify(params)
    };
    return makeUrlParams(params);
}

const toPage = ({ url = '', params = {}, appid = '', jumpType = 'navigateTo'})=> {
    if (url.indexOf('http') === 0) {
        wx.navigateTo({
            url: `/pages/ballgame/view/web/index?${makeUrlParams2({url, params})}`,
        });
    } else {
        const params = makeUrlParams(params);
        // if (url[0] !== '/') {
        //     url = '/' + url;
        // }
        const obj = {
            url
        }
        if (params) {
            obj.url += '?' + params;
        }
        if (appid && appid !== bus.data.appid) {
            jumpType = 'navigateToMiniProgram';
            obj.path = obj.url;
            delete obj.url;
        }
        if (['navigateTo',
            'navigateToMiniProgram',
            'switchTab',
            'reLaunch',
            'redirectTo'
            ].indexOf(jumpType) === -1) {
            jumpType = 'navigateTo';
        }
        appid && (obj.appId = appid);
        wx[jumpType](obj);
    }
}


const checkGetUserInfo = ()=> {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    })
}


const wxLogin = () => {
    return new Promise((resolve, reject) => {
        wx.showLoading();
        wx.login({
            success: ({ code }) => {
                wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                        getSessionId(res, code)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            }
        });
    });
}

const getSessionId = (res, code) => {
    return new Promise((resolve, reject) => {
        bus.data.userInfo = {
            name: res.userInfo.nickName,
            headimgurl: res.userInfo.avatarUrl,
            sex: res.userInfo.gender,
            province: res.userInfo.province,
            city: res.userInfo.city
        }
        bus.emit('update:userInfo');
        api.login(res, code)
            .then(({ data }) => {
                if (data.Code == 0) {
                    const sessionid = JSON.parse(data.Result).Result;
                    bus.data.sessionid = sessionid;
                    getJwt().then(resolve).catch(reject);
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '登录失败'
                    })
                    reject(data);
                }
            })
            .catch(reject);
    });
}

const getJwt = () => {
    return api.getJwt(bus.data.sessionid);
}

export default {
    entries,
    makeUrlParams,
    makeUrlParams2,
    toPage,
    checkGetUserInfo,
    wxLogin,
    getJwt
}