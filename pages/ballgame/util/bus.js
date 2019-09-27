const getLink = (path)=> {
    // return `http://192.168.0.124:2333/${path}`;
    return `http://res.cdn.24haowan.com/dingzhi/custom/myj/${path}`;
}

class EventBus {
    constructor() {
        this.PubSubCache = {
            $uid: 1
        }
        this.data = {
            appid: wx.getAccountInfoSync().miniProgram.appId,
            activity: {},
            userInfo: {
                nickname: '',
                headimgurl: ''
            },
            integral: 0,
            userMessage: {}
        }
        this.config = {}
        this.moduleList = []
        this.picList = {}
    }

    getConfig(keys, defaultValue = '') {
        keys = keys.split('.');
        let item = this.config;
        for (const key of keys) {
            item = item[key];
            if (!item) {
                return item || defaultValue;
            }
        }
        return item;
    }

    wait(time) {
        return new Promise((resolve, reject)=> {
            setTimeout(resolve, time);
        });
    }

    on(type, handler) {
        let cache = this.PubSubCache[type] || (this.PubSubCache[type] = {})
        handler.$uid = handler.$uid || this.PubSubCache.$uid++
        cache[handler.$uid] = handler
    }

    emit(type, ...params) {
        let cache = this.PubSubCache[type]

        if (!cache) return

        for (let key in cache) {
            cache[key].call(this, ...params)
        }
    }

    off(type, handler) {
        if (!handler || !handler.$uid) {
            return
        }
        let cache = this.PubSubCache[type]
        if (!cache) {
            return
        }
        if (handler.$uid in cache) {
            delete cache[handler.$uid]
        }
        if (Object.keys(cache).length <= 0) {
            delete this.PubSubCache[type]
        }
    }
}

const eventBus = new EventBus()

export default eventBus