'use strict';
import $ from 'jquery';
import util from './wizardUtil.js';

class RepeaterMode {
    constructor(multiScanComp, wirelessComp, ipComp) {
        let that = this,
            $remoteMac1 = multiScanComp.getComponent("remoteMac1"),
            $multiScanBtn = multiScanComp.getComponent("multiScanBtn"),
            $multiScanTable = multiScanComp.$multiScanTable,

            $remoteSsid = wirelessComp.getComponent("remoteSsid"),
            $remoteMac = wirelessComp.getComponent("remoteMac");

        var compStep = [null, multiScanComp, wirelessComp, ipComp, null];
        this.step = 0;
        /**
         *初始化数据 
         */
        this.init = function () {
            let data = that.initData;
            util.reset(multiScanComp, wirelessComp, ipComp);
            util.updateComponent(multiScanComp, wirelessComp, ipComp, data);

            //第二个参数是决定是否触发callback函数
            $multiScanBtn.setValue("1", true);
            $multiScanTable.hide();
            $remoteMac.setValue($remoteMac1.getValue());
            
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
                    $(".multiscan-desc").addClass("none");
                    $(".scan-desc").removeClass("none");
                    $remoteSsid.$title[0].innerHTML = _("上级AP");
                    $remoteMac.$title[0].innerHTML = _("上级AP的MAC地址");
                } break;
                case 3: {
                    $(".remote-desc").addClass("none");
                    $(".exc-wisp").removeClass("none");
                } break;
                case 4: {
                    //将保存变为下一步按钮
                    $("#nextBtn").attr("value", _("下一步"));
                } break;
            }

            util.hideAll();
            $(".repeater-step" + (--that.step)).removeClass("none"); //再将对应的模块显示出来  并且step--

        };
        /**
         * 下一步
         */
        this.goNext = function () {
            if (that.step != 4) {
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
                        //文字描述有所不同
                        $(".multiscan-desc").removeClass("none");
                        $(".scan-desc").addClass("none");
                        $remoteSsid.$title[0].innerHTML = _("对端AP1");
                        $remoteMac.$title[0].innerHTML = _("对端AP1的MAC地址");

                        //如果mac修改过则置空
                        if($remoteMac1.getValue() != $remoteMac.getValue()){
                            $remoteSsid.setValue("");
                        }
                        //然后给mac赋值
                        $remoteMac.setValue($remoteMac1.getValue());
                    } break;
                    case 2: {
                        $(".remote-desc").removeClass("none");
                        $(".exc-wisp").addClass("none");
                    } break;
                    case 3: {
                        $("#workMode").html(_("中继模式"));
                        $("#nextBtn").attr("value", _("保存")); //最后一步了 提示保存
                    } break;
                }
                util.hideAll(); //先将所有模块隐藏
                $(".repeater-step" + (++that.step)).removeClass("none"); //再将对应的模块显示出来  并且step++
            } else { //==4   保存提交
                let wirelessData = wirelessComp.getValue();
                let multiScanData = multiScanComp.getValue();
                let ipData = ipComp.getValue();
                let otherData = {
                    "mode": "repeater"
                };
                let dataSubmit = $.extend({}, wirelessData, ipData, multiScanData, otherData);

                 //设置跳转地址
                 util.changeJumpIp(dataSubmit.lanIp);
                util.submit(dataSubmit);
            }
        };


    }
}
module.exports = RepeaterMode;