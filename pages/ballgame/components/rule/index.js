import bus from '../../util/bus.js';

Component({

    /**
     * 组件的初始数据
     */
    data: {
        static: {},
        show: false,
        maskAnim: '',
        dialogAnim: ''
    },
    ready() {
        this.initUI();
        this.init();
    },
    /**
     * 组件的方法列表
     */
    methods: {
        initUI() {
            const _updateUI = ()=> {
                this.setData({
                    static: {
                        bg: bus.getConfig('dialog.img.ruleMask'),
                        rule_bg: bus.getConfig('dialog.img.ruleBg'),
                        rule_close: bus.getConfig('dialog.img.btnRuleClose'),
                        rule_know: bus.getConfig('dialog.img.btnRuleKnow'),
                        rule_content: bus.getConfig('dialog.img.ruleContent')
                    }
                })
            }
            _updateUI();
            bus.on('update:config', _updateUI);
        },
        init() {
            this.fadeShow = wx.createAnimation({
                duration: 500,
                timingFunction: 'linear'
            }).opacity(1).step().export();
            this.fadeClose = wx.createAnimation({
                duration: 1000,
                timingFunction: 'linear'
            }).opacity(0).step().export();
            bus.on('showRule', (show)=> {
                show ? this.show() : this.close();
            });
        },
        show() {
            this.setData({
                show: true,
                maskAnimcss: 'fade-animate 0.5s linear',
                dialogAnim: 'dialog-animate 0.8s linear forwards'
            })
        },
        close() {
            this.setData({
                maskAnim: this.fadeClose,
                dialogAnim: 'dialog-close-animate 0.8s linear forwards'
            })
            bus.wait(1000)
                .then(() => {
                    this.setData({
                        show: false
                    })
                })
        }
    }
})
