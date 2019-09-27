import { getUserInfo, register } from '../../util/apis.js';
import util from '../../util/util.js';
import bus from '../../util/bus.js';

const app = getApp();

let webviewMessage = {};
let shareParamss = {};

Page({
    /**
     * 页面的初始数据
     */
    data: {
        url: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options);
        let url = options.url;
        if (options.params) {
            const params = util.makeUrlParams(JSON.parse(options.params));
            if (params) {
                url += '?' + params;
            }
        }
        this.setData({
            url
        })
    },

    onWebviewMessage(e) {
        let data = e.detail.data;
        console.log(e);
        if (data.length > 0) {
            webviewMessage = data[data.length - 1];
        } else {
            webviewMessage = null;
        }
        console.log('接收到webview的消息', webviewMessage);
    },

    onShareAppMessage() {
        let params = {
            title: bus.getConfig('other.other.shareTitle'),
            path: '/pages/ballgame/view/index/index',
            imageUrl: bus.getConfig('other.img.share')
        };
        if (webviewMessage) {
            let message = {
                imageUrl: webviewMessage.img,
                title: webviewMessage.shareTitle
            };
            const paramstr = util.makeUrlParams2({
                url: webviewMessage.params.url,
                params: webviewMessage.params.params,
                obj: {
                    type: 'web'
                }
            })
            message.path = `/pages/ballgame/view/index/index?${paramstr}`;
            Object.assign(params, message);
            console.log(message);
        }
        return params;
    }
});
