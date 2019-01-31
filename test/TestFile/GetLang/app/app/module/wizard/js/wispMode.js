'use strict';
import $ from 'jquery';
import util from './wizardUtil.js';

class WispMode {
    constructor(scanComp, wirelessComp, ipComp, connectComp, apWirelessComp) {
        let that = this;
        var tpData = {},
            $netBridge = scanComp.getComponent("netBridge"),
            $remoteApSsid = scanComp.getComponent("remoteApSsid"),
            $scanBtn = scanComp.getComponent("scanBtn"),
            $scanTable = scanComp.$scanTable,

            $remoteSsid = wirelessComp.getComponent("remoteSsid"),
            $remoteMac = wirelessComp.getComponent("remoteMac"),
            $remoteChannel = wirelessComp.getComponent("remoteChannel"),

            $apChannel = apWirelessComp.getComponent("apChannel"),

            $ip = ipComp.getComponent("lanIp"),
            $mask = ipComp.getComponent("lanMask");

        var compStep = [null, scanComp, wirelessComp, connectComp, apWirelessComp, ipComp, null];
        this.step = 0;
        this.init = function () {
            let data = that.initData;
            util.reset(scanComp, wirelessComp, ipComp, connectComp, apWirelessComp);
            util.updateComponent(scanComp, wirelessComp, ipComp, connectComp, apWirelessComp, data);

            //无线WAN没有透明网桥
            $netBridge.hide();
            //第二个参数是决定是否触发callback函数
            $scanBtn.setValue("1", true);
            $scanTable.hide();
        };
        /**
          * 获取模块数据
         */
        this.getInitData = function (tempData) {
            that.initData = tempData;
        };
        this.goBefore = function () {

            switch (that.step) {
                case 0: {
                } break;
                case 1: {
                    $("#prevBtn").addClass("none"); //隐藏上一步按钮
                } break;
                case 2: {
                    $("#apChannel").removeAttr("disabled").removeClass('form-disabled');
                } break;
                case 3: {
                } break;
                case 4: {
                } break;
                case 5: {
                    util.showComponent(ipComp);
                    $(".wisp-desc").addClass("none");
                    $(".exc-wisp").removeClass("none");
                } break;
                case 6: {
                    //将保存变为下一步按钮
                    $("#nextBtn").attr("value", _("下一步"));
                }
            }
            //清除组件的错误提示信息
            if (!!compStep[that.step]) {
                util.clearValidateTips(compStep[that.step]);
            }
            util.hideAll();
            $(".wisp-step" + (--that.step)).removeClass("none"); //再将对应的模块显示出来  并且step--

        };

        this.goNext = function () {
            if (that.step != 6) {
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

                        //如果ssid是被修改过的 mac置空
                        if ($remoteSsid.getValue() != $remoteApSsid.getValue()) {
                            $remoteMac.setValue("");
                        }
                        //给上级AP赋值
                        $remoteSsid.setValue($remoteApSsid.getValue());

                    } break;
                    case 2: {
                        $apChannel.setValue($remoteChannel.getValue());
                        $("#apChannel").attr("disabled","disabled").addClass('form-disabled');

                    } break;
                    case 3: {

                    } break;
                    case 4: {

                        //隐藏组件
                        util.hideComponent(ipComp);
                        //只显示需要的
                        $ip.show();
                        $mask.show();
                        $(".wisp-desc").removeClass("none");
                        $(".exc-wisp").addClass("none");
                    } break;
                    case 5: {
                        $("#workMode").html(_("无线WAN模式"));
                        $("#nextBtn").attr("value", _("保存")); //最后一步了 提示保存
                    } break;

                }
                util.hideAll(); //先将所有模块隐藏
                $(".wisp-step" + (++that.step)).removeClass("none"); //再将对应的模块显示出来  并且step++
            } else { //==6   保存提交
                let wirelessData = wirelessComp.getValue();
                let connectData = connectComp.getValue();
                let apData = apWirelessComp.getValue();
                let ipData = ipComp.getValue();
                let otherData = {
                    "mode": "wisp"
                };
                let dataSubmit = $.extend({}, wirelessData, apData, connectData, ipData, otherData);

                 //设置跳转地址
                 util.changeJumpIp(dataSubmit.lanIp);
                util.submit(dataSubmit);
            }
        };


    }
}
module.exports = WispMode;