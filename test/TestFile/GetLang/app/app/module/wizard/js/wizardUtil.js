'use strict';
import $ from 'jquery';

//隐藏所有步骤
function Util() {
    let that = this;
    this.jumpIp = "192.168.2.1";
    this.changeJumpIp = function (ip) {
        that.jumpIp = ip;
    };
    /**
     * 隐藏快速设置所有东西
     */
    this.hideAll = function () {
        let mode = ["ap", "station", "wisp", "wirelessWan", "p2mp", "repeat", "router"];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < mode.length; j++) {
                $("." + mode[j] + "-step" + i).addClass("none");
            }
        }
    };

    /**
     * 只是显示组件里所有的
     * {@param comp}组件的componentManager
     */
    this.showComponent = function (comp) {
        for (var prop in comp.components) {
            if (comp.components.hasOwnProperty(prop)) {
                //所有组件都由issingle这个属性，过滤
                if (prop != "isSingle" && (typeof comp.components[prop].show === "function")) {
                    comp.components[prop].show();
                }

            }
        }
    };

    /**
     * 隐藏某个组件
     * {@param comp}组件的componentManager
     */
    this.hideComponent = function (comp) {
        for (var prop in comp.components) {
            if (comp.components.hasOwnProperty(prop)) {
                //所有组件都由issingle这个属性，过滤
                if (prop != "isSingle" && (typeof comp.components[prop].hide === "function")) {
                    comp.components[prop].hide();
                }

            }
        }
    };
    /**
     * 更新组件数据，最后一个参数为数据
     */
    this.updateComponent = function () {
        let args = arguments;
        let data = arguments[arguments.length - 1];
        for (let j = 0; j < arguments.length - 1; j++) {
            if (!!arguments[j].updateComponents && (typeof arguments[j].updateComponents === "function")) {
                arguments[j].updateComponents(data);
            }
        }
    };

    /**
     * 清除所有模块的数据
     */
    this.reset = function () {
        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i].reset && typeof arguments[i].reset === "function") {
                arguments[i].reset();
            }
        }
    };
    /**
     * 将组件的值赋给某个对象
     */
    this.valObj = function (obj, comp) {
        for (var prop in comp.components) {
            if (comp.components.hasOwnProperty(prop)) {
                //所有组件都由issingle这个属性，过滤
                if (prop != "isSingle" && typeof comp.components[prop].getValue === "function") {
                    obj[prop] = comp.components[prop].getValue();
                }

            }
        }
        return obj;
    };

    /**
     * 清除组件的错误提示信息
     * {@param comp}组件的componentManager
     */
    this.clearValidateTips = function (comp) {
        comp = comp.components;
        for (let prop in comp) {
            if (comp.hasOwnProperty(prop)) {
                if ((typeof comp[prop].removeValidateText) === "function") {
                    comp[prop].removeValidateText();
                }
            }
        }
    };

    //提交
    this.submit = function (data) {
        if (G.userType !== 'admin') {
            $.formMessage({
                'message': _('You must log in as an administrator to make any change.'),
                'displayTime': 1500
            });
            return false;
        } else {
            $.post("goform/setWizardInfo", data, (errCode) => {
                errCode = JSON.parse(errCode).errCode;
                if (errCode == "0") {
                    // $.formMessage(_("保存成功"));
                    $.progress({
                        "jumpTo": that.jumpIp + "/login.html",
                        "msg": _('The system is rebooting,it will take about 2 minutes, please wait…'),
                        "duration": 80
                    });
                } else if (errCode == "-1") {
                    $.formMessage(_("保存失败"));
                }
            });
        }
    };

    //验证
    this.validate = function (comp) {
        if (!!comp.submit && (typeof comp.submit === "function"))
            return comp.submit(2);
    };
}

var util = new Util();
module.exports = util;