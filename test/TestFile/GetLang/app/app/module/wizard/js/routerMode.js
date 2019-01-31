'use strict';
import $ from 'jquery';
import util from './wizardUtil.js';

class RouterMode {
    constructor(connectComp, apWirelessComp) {
        let that = this;
        this.initData = {};
        this.step = 0;
        var compStep = [null, connectComp, apWirelessComp, null];
        /**
         *初始化数据 
         */
        this.init = function () {
            let data = that.initData;
            util.reset(connectComp, apWirelessComp);
            util.updateComponent(connectComp, apWirelessComp,data);

        };
        /**
         * 获取模块数据
         */
        this.getInitData = function (tempData) {
            that.initData = tempData;
        };
        /**
         * 上一步
         */
        this.goBefore = function () {
            //清除组件的错误提示信息
            if (!!compStep[that.step]) {
                util.clearValidateTips(compStep[that.step]);
            }
            switch (that.step) {
                case 0: {
                } break;
                case 1: {
                    $("#prevBtn").addClass("none"); //隐藏上一步按钮
                } break;
                case 2: {
                } break;
                case 3: {
                    //将保存变为下一步按钮
                    $("#nextBtn").attr("value", _("下一步"));
                } break;
            }   
            util.hideAll();
            $(".router-step" + (--that.step)).removeClass("none"); //再将对应的模块显示出来  并且step--
        };
        /**
         * 下一步
         */
        this.goNext = function () {
            if (that.step != 3) {
                //验证对应的组件是否有误
                if (!!compStep[that.step] && !util.validate(compStep[that.step])) { //步数为3时单独校验
                    return;
                }
                switch (that.step) {
                    case 0: {
                        $("#prevBtn").removeClass("none"); //显示上一步按钮
                        that.init();
                    } break;
                    case 1: {

                    } break;
                    case 2: {
                       $("#workMode").html(_("路由模式"));
                        $("#nextBtn").attr("value", _("保存")); //最后一步了 提示保存
                    } break;
                }
                util.hideAll(); //先将所有模块隐藏
                $(".router-step" + (++that.step)).removeClass("none"); //再将对应的模块显示出来  并且step++
            } else { //==3   保存提交
                let apWirelessData = apWirelessComp.getValue();
                let connectData = connectComp.getValue();
                let otherData = {
                    "mode": "router"
                };
                let dataSubmit = $.extend({}, apWirelessData, connectData,otherData);

                util.submit(dataSubmit);
            }
        };


    }
}
module.exports = RouterMode;