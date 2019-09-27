import api from '../../util/apis.js';
import util from '../../util/util.js';
import bus from '../../util/bus.js';
import dayjs from '../../util/day.js';

let shareParams = {};

const list = {
    lGet: {
        page: 1,
        next_page: 0,
        size: 20,
        total: 0,
        lock: false
    },
    lUse: {
        page: 1,
        next_page: 0,
        size: 20,
        total: 0,
        lock: false
    }
}

Page({
    /**
     * 页面的初始数据
     */
    data: {
        static: {},
        tabIndex: 0,
        tabBgList: {
            itemGet: ['', ''],
            itemUse: ['', ''],
        },
        list: {
            lGet: [],
            lUse: []
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.initUI();
        Object.assign(list, {
            lGet: {
                page: 1,
                next_page: 0,
                size: 20,
                total: 0,
                lock: false
            },
            lUse: {
                page: 1,
                next_page: 0,
                size: 20,
                total: 0,
                lock: false
            }
        })
        this.loadGetList();
        this.loadUseList();
    },

    initUI() {
        const _updateUI = () => {
            this.setData({
                static: {
                    bg: bus.getConfig('integral.img.bg'),
                    itemBg: bus.getConfig('integral.img.itemBg'),
                    logo: bus.getConfig('integral.img.logo')
                },
                tabBgList: {
                    itemGet: [
                        bus.getConfig('integral.img.btnGet'),
                        bus.getConfig('integral.img.btnGetDark')
                    ],
                    itemUse: [
                        bus.getConfig('integral.img.btnUseDark'),
                        bus.getConfig('integral.img.btnUse')
                    ]
                }
            })
        }
        _updateUI();
        bus.on('update:config', _updateUI);
    },

    selectTab({currentTarget: {dataset: {index}}}) {
        this.realSelectTab(index);
    },

    realSelectTab(index) {
        this.setData({
            tabIndex: parseInt(index)
        });
    },

    loadGetList() {
        list.lGet.lock = true;
        api.integralList('add', list.lGet.page)
            .then(res => {
                let content = res.content.map(item => {
                    item.integral = Math.abs(item.integral);
                    item.img = bus.picList[item.event];
                    item.time = dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss');
                    return item;
                });
                delete res.content;
                Object.assign(list.lGet, res);
                if (list.lGet.page > 1) {
                    content = this.list.lGet.concat(content);
                }
                this.setData({
                    'list.lGet': content
                }, () => {
                    setTimeout(() => {
                        list.lGet.lock = false;
                    }, 300);
                })
            }).catch(e => {
                list.lGet.lock = false;
            })
    },

    loadUseList() {
        list.lUse.lock = true;
        api.integralList('consume', list.lUse.page)
            .then(res => {
                let content = res.content.map(item => {
                    item.integral = Math.abs(item.integral);
                    item.img = bus.picList[item.event];
                    item.time = dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss');
                    return item;
                });
                delete res.content;
                Object.assign(list.lUse, res);
                if (list.lUse.page > 1) {
                    content = this.list.lUse.concat(content);
                }
                this.setData({
                    'list.lUse': content
                }, () => {
                    setTimeout(() => {
                        list.lUse.lock = false;
                    }, 300);
                })
            }).catch(e => {
                list.lUse.lock = false;
            })
    },

    loadmore(e) {
        let type = e.target.dataset.type;
        switch(type) {
            case 'get':
                if (list.lGet.lock || list.lGet.next_page === 0) {
                    break;
                }
                list.lGet.lock = true;
                list.lGet.page = +list.lGet.page + 1
                this.loadGetList();
                break;
            case 'consume':
                if (list.lUse.lock || list.lUse.next_page === 0) {
                    break;
                }
                list.lUse.lock = true;
                list.lUse.page = +list.lUse.page + 1
                this.loadUseList();
                break;
        }
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
