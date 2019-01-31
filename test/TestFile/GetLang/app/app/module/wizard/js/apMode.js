'use strict';
import $ from 'jquery';
import util from './wizardUtil.js';

class ApMode {
    constructor(apWirelessComp) {
        let that = this,
            $ssid = apWirelessComp.getComponent("apSsid"),
            $channel = apWirelessComp.getComponent("apChannel"),
            $secType = apWirelessComp.getComponent("apSecType"),
            $encType = apWirelessComp.getComponent("apWpaAuth"),
            $password = apWirelessComp.getComponent("apPassword");

        this.initData ={};
        this.step = 0;
        /**
         * 初始化模块的值
         */
        this.init = function () {
          util.updateComponent(apWirelessComp,that.initData);
        };
        /**
         * 获取模块的数据
         */
        this.getInitData = function(tempData){
            that.initData = tempData;
        };
        /**
         * 上一步
         */
        this.goBefore = function () {
            if (that.step == 1 || that.step == 2) {
                //清除错误提示
                util.clearValidateTips(apWirelessComp);
                util.hideAll();
                $(".ap-step" + (--that.step)).removeClass("none"); //再将对应的模块显示出来  并且step--

                if (that.step == 0) {
                    $("#prevBtn").addClass("none"); //显示上一步按钮
                } else if (that.step == 1) {
                    $("#nextBtn").attr("value", _("下一步")); //显示上一步按钮
                }
            }
        };
        /**
         * 下一步
         */
        this.goNext = function () {
            switch (that.step) {
                case 0: {
                    //清空数据
                    util.reset(apWirelessComp);

                    $ssid.show();
                    $("#prevBtn").removeClass("none"); //显示上一步按钮
                    util.clearValidateTips(apWirelessComp);
                    
                    //初始化该模块的值
                    that.init();

                } break;
                case 1: {
                    if (!util.validate(apWirelessComp)) {//有错误
                        // $.message(_("输入有误，请检查红色输入区域")) ;
                        return;
                    } else {
                        $("#workMode").html(_("AP模式"));
                        $("#nextBtn").attr("value", "保存"); //最后一步了 提示保存
                    }
                } break;
                case 2: {
                   let data = apWirelessComp.getValue();
                   data.mode = "ap";
                    util.submit(data);
                    break;
                } break;
            }
            if (that.step != 2) {
                util.hideAll(); //先将所有模块隐藏
                $(".ap-step" + (++that.step)).removeClass("none"); //再将对应的模块显示出来  并且step++
            }

        };
    }
}
module.exports = ApMode;