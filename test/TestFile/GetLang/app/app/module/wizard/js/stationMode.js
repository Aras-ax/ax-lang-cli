'use strict';
import $ from 'jquery';
import util from './wizardUtil.js';

class StationMode {
    constructor(scanComp, wirelessComp, ipComp) {
        let that = this,
            $netBridge = scanComp.getComponent("netBridge"),
            $remoteApSsid = scanComp.getComponent("remoteApSsid"),
            $scanBtn = scanComp.getComponent("scanBtn"),
            $scanTable = scanComp.$scanTable,

            $remoteSsid = wirelessComp.getComponent("remoteSsid"),
            $remoteMac = wirelessComp.getComponent("remoteMac");

        var compStep = [null, scanComp, wirelessComp, ipComp, null];

        this.step = 0;
        this.initData = {};

        this.init = function () {
            let data = that.initData;
            util.reset(scanComp, wirelessComp, ipComp);
            util.updateComponent(scanComp, wirelessComp, ipComp, data);

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
                } break;
                case 3: {
                } break;
                case 4: {
                    //将保存变为下一步按钮
                    $("#nextBtn").attr("value", _("下一步"));
                } break;
            }
            //清除组件的错误提示信息
            if (!!compStep[that.step]) {
                util.clearValidateTips(compStep[that.step]);
            }
            util.hideAll();
            $(".station-step" + (--that.step)).removeClass("none"); //再将对应的模块显示出来  并且step--
        };

        this.goNext = function () {
            if (that.step != 4) {
                //验证对应的组件是否有误
                if (!!compStep[that.step] && !util.validate(compStep[that.step])) { //步数为3时单独校验
                    return;
                }
                switch (that.step) {
                    case 0: {
                        scanComp.selectData = null;
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

                        //显示所有ip组件，避免切换过来没有的情况
                        util.showComponent(ipComp);
                    } break;
                    case 3: {

                        $("#workMode").html(_("客户端模式"));
                        $("#nextBtn").attr("value", _("保存")); //最后一步了 提示保存
                    } break;
                }
                util.hideAll(); //先将所有模块隐藏
                $(".station-step" + (++that.step)).removeClass("none"); //再将对应的模块显示出来  并且step++
            } else { //==4   保存提交
                let wirelessData = wirelessComp.getValue();
                let ipData = ipComp.getValue();
                let otherData = {
                    "mode": "station",
                    "netBridge": scanComp.getComponent("netBridge").getValue() == "" ? "0" : "1"
                };
                let dataSubmit = $.extend({}, wirelessData, ipData, otherData);

                 //设置跳转地址
                 util.changeJumpIp(dataSubmit.lanIp);
                util.submit(dataSubmit);
            }
        };


    }
}
module.exports = StationMode;