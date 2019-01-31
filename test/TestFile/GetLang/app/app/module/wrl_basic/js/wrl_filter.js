'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput.js';
import '../../../common/component/FormCheckBox.js';
import '../../../common/component/FormRadioList.js';
import '../../../common/component/FormText.js';
import '../../../common/component/FormMultiInput.js';
import '../../../common/component/FormTable.js';
import '../../../common/component/ModalDialog.js';
import '../../../common/component/FormHelpText.js';

function ModuleLogic() {
    var data,  //页面总数据
        cmp,   //上半部分的组件
        tableCmp,   //显示表格组件
        tableData,  //显示表格数据
        modal = null,   //模态框组件
        onlineTableData,    //在线设备数据
        onlineTableCmp,     //在线设备组件
        statusCmp = new Array();    //表格里checkBox组件的集合

    this.init = function () {
        _initHelpText();
        _registComponent();
        _initEvent();
        _getData();
    };

    let _initHelpText = function(){
		$("#wrl_filter-help-text").FormHelpText({
                "desc":[_("You can create an access control rule to allow or disallow the specified devices to connect to the wireless network of this device.")],
                "text":[
                { "title":_("Disallow:"),"text":_("disallow the wireless clients with MAC addresses listed here to connect to the wireless network of this device.")},
                { "title":_("Allow:"),"text":_("allow wireless clients with the MAC addresses listed here to connect to the wireless network of this device.")}
                ]
        });
    };
    
    let _getData = function () {
        $.post("goform/getWrlFilterList", (res) => {
            data = JSON.parse(res);
            tableData = data.macList;
            tableCmp.reLoad(tableData);
            cmp.updateComponents(data);
        });
    };

    let _registComponent = function () {
        //展示信息的组件群
        cmp = $.componentManager({
            "container": "#filter-wrap",
            "formCfg": {
                "ssid": {

                }, "macFilterEn": {

                }, "filterMode": {
                    "selectArray": {
                        "deny": _("仅禁止"),
                        "allow": _("仅允许")
                    },
                    "defaultValue": "deny"
                }, "mac": {
                    "inputCfg": [
                        { "maxLength": "2", "required": false, "dataOptions": { "type": "mac1.all" } },
                        { "maxLength": "2", "required": false, "dataOptions": { "type": "mac1.specific" } },
                        { "maxLength": "2", "required": false, "dataOptions": { "type": "mac1.specific" } },
                        { "maxLength": "2", "required": false, "dataOptions": { "type": "mac1.specific" } },
                        { "maxLength": "2", "required": false, "dataOptions": { "type": "mac1.specific" } },
                        { "maxLength": "2", "required": false, "dataOptions": { "type": "mac1.specific" } }
                    ],
                    "autoValidate": false,
                    "css": "mac-wrap",
                    "inputCount": 6,
                    "joiner": ":"
                }
            }
        });

        //展示需要进行访问空的的设备的组件表格
        tableCmp = $("#macList").TablePage({
            "showStyle": 2,
            "css": "filter-table",
            "key": "index",
            "sortFunction": function (a, b) {
                return parseInt(a.index) - parseInt(b.index);
            },
            "columns": [
                { "title": _("序号"), "width": "50", "field": "index" },
                { "title": _("MAC 地址"), "width": "200", "field": "mac" },
                {
                    "title": _("状态"), "width": "200", "field": "select", "format": (data, dataField, rowData) => {
                        return '<div data-key="FormCheckbox" class="statusEn" default-value="' + rowData.status + '" id="status-' + rowData.index + '">';
                    }, "rendered": function () {
                        statusCmp = [];
                        let arr = this.$element.find(".statusEn");
                        let len = arr.length;
                        for (var i = 0; i < len; i++) {
                            let _i = i;
                            let tpCmp = $(arr[i]).Rcomponent({
                                "text": _("启用"),
                                "changeCallBack": function () {
                                    let index = this.$element.attr("id").split("-")[1];
                                    tableData[index - 1].status = this.getValue();
                                }, "renderedCallBack": function () {
                                    this.setValue(tableData[_i].status);
                                }
                            });
                            if (!!tpCmp) {
                                statusCmp.push(tpCmp);
                            }
                        }
                    }
                },
            ],
            "actionColumn": {
                "columnName": _("操作按钮"),
                "actions": [
                    {
                        "width": "100",
                        "type": "delete",
                        "text": _("删除"),
                        "callback": deleteLine
                    }
                ]
            }

        });
        //在线设备信息的表格组件
        onlineTableCmp = $("#online-list").TablePage({
            "showStyle": 2,
            "showCheckbox": true,
            "css": "filter-table",
            "key": "index",
            "columns": [
                { "title": _("序号"), "width": "50", "field": "index" },
                { "title": _("IP 地址"), "width": "200", "field": "ip" },
                { "title": _("MAC 地址"), "width": "200", "field": "mac" },
                {
                    "title": _("连接时间"), "width": "250", "field": "connectTime", "format": (data) => {
                        let time = parseInt(data);
                        let str = "";
                        str = Math.floor(time / 86400) > 0 ? Math.floor(time / 86400) + _("天") : "";
                        str += Math.floor(time / 3600 % 24) > 0 ? Math.floor(time / 3600 % 24) + _("小时") : "";
                        str += Math.floor(time / 60 % 60) > 0 ? Math.floor(time / 60 % 60) + _("分") : "";
                        str += Math.floor(time % 60) + _("秒");
                        return str;
                    }
                }
            ]
        });
        //在线设备模态框组件
        modal = $.modalDialog({
            "title": _("在线设备"),
            "width": 800,
            "content": $("#online-modal"),
            "buttons": [
                {
                    "text": _("添加"),
                    "theme": "ok",
                    "autoHide": false,
                    "callback": function () {
                        //获取选择到的数据的key值
                        let arrs = onlineTableCmp.getSelected();
                        for (var i = 0; i < arrs.length; i++) {
                            let index = getIndex(arrs[i]),
                                mac = onlineTableData[index].mac,
                                obj = {
                                    "index": (tableData.length + 1).toString(),
                                    "mac": mac,
                                    "status": "1"
                                };
                            if (!isDup(mac)) {
                                tableData.push(obj);
                                tableCmp.reLoad(tableData);
                            }
                        }
                        modal.hide();
                    }
                },
                {
                    "text": _("取消"),
                    "callback": function () {
                        modal.hide();
                    }
                }
            ]
        });
        modal.hide();
    };

    let _initEvent = function () {
        $("#addMac").on("click", addMac);
        $("#addOnlineList").on("click", getOnlineList);
        $("#submit").on("click", () => {
            if (G.userType !== 'admin') {
                $.formMessage({
                    'message': _('You must log in as an administrator to make any change.'),
                    'displayTime': 1500
                });
                return false;
            } 
            
            let subData = getSubmitData();
            $.post("goform/setWrlFilterList", subData, (res) => {
                res = JSON.parse(res);
                if (res.errCode == "0") {
                    $.formMessage(_("保存成功"));
                }
            });
        });
        //当输入mac输入完2个时自动跳到下一个
        $(".form-multi-input").on("keyup", function (event) {
            let $this = $(this),
                name = $this.attr("name"),
                index = parseInt(name[name.length - 1]),
                e = event || window.event,
                charCode = e.charCode || e.keyCode;
        
            //如果输入了两个直接跳到下一个输入框
            if (index != 5) {
                if ($this.val().length == 2) {
                    $this.blur();
                    $(".form-multi-input[name=mac" + (index + 1) + "]").val("");
                    $(".form-multi-input[name=mac" + (index + 1) + "]").focus();
                }
            }
        });
        $(".form-multi-input").on("keydown", function (event) {
            let $this = $(this),
                name = $this.attr("name"),
                index = parseInt(name[name.length - 1]),
                e = event || window.event,
                charCode = e.charCode || e.keyCode;
            //摁的backspace   如果删完了，跳到上一个
            if (charCode === 8) {
                if (index != 0 && $this.val().length == 0) {
                    $this.blur();
                    $(".form-multi-input[name=mac" + (index - 1) + "]").focus();
                }
            }
        });

    };

    /**
     * 考虑到可能会加入排序，
     * 所以用循环遍历的方法去检查排序后的数据在原数据的位置
     * @param {*index值} index 
     */
    function getIndex(index) {
        for (var i = 0; i < onlineTableData.length; i++) {
            if (index == onlineTableData[i].index) {
                return i;
            }
        }
        return -1;
    }
    /**
     * 检查mac是否与已有规则重复
     * 检查mac过滤规则是否超过16条
     * @param {*mac} tpMac 
     */

    function isDup(tpMac) {
        for (var i = 0; i < tableData.length; i++) {
            if (tpMac == tableData[i].mac) {
                $.formMessage({
                    "message": _("该MAC地址 %s 已存在规则中", [tpMac]),
                    "displayTime": 3000
                });
                return true;
            }
        }
        if (tableCmp.data.length >= 16) {
            $.formMessage(_("Only 16 rules is supported!"));
            return true;
        }
        return false;
    }
    /**
     * 获取在线设备信息
     */
    function getOnlineList() {
        //点击添加在线设备
        $.post("goform/getOnlineList", (res) => {
            //获取在线设备数据并储存在data里
            onlineTableData = JSON.parse(res).onlineList;
            onlineTableCmp.reLoad(onlineTableData);
            modal.show();
        });
    }
    /**
     * 手动添加一个MAC
     * 校验mac是否合法
     * 将MAC变为大写并拼接到table组件的data后面
     */
    function addMac() {
        let mac = cmp.getComponent("mac").getValue().toUpperCase();
        //验证mac是否有误
        if (!cmp.submit(2)) {
            return;
        }
        for (let i = 0; i < 6; i++) {
            if ($("input[name=mac" + i + "]").val() == "") {
                $("input[name=mac" + i + "]").focus();
                $.formMessage(_("请输入一个有效的MAC地址"));
                return false;
            }
        }
        if (mac == "00:00:00:00:00:00") {
            $.formMessage(_("The MAC address cannot be 00:00:00:00:00:00."));
            return;
        }
        let tpObj = {
            "index": (tableData.length + 1).toString(),
            "mac": mac,
            "status": "1"
        };
        if (!isDup(mac)) {
            tableData.push(tpObj);
            tableCmp.reLoad(tableData);
        }
    }
    /**
     * 删除一行的数据
     * 删除一行后将下面的所有行向上移
     * 并且下面的行index--
     */
    function deleteLine() {
        let index = $(this).attr("data-index");
        statusCmp.splice(index, 1);
        tableData.splice(index, 1);
        for (var i = 0; i < tableData.length; i++) {
            //当删除某一列时需要把序号重新排序
            if (parseInt(tableData[i].index) > index) {
                tableData[i].index = (parseInt(tableData[i].index) - 1).toString();
            }
        }
        tableCmp.reLoad(tableData);
    }
    /**
     * 提交数据
     */
    function getSubmitData() {
        let subData = {
            "action": "add",
            "selectSsid": null,
            "macFilterEn": cmp.getComponent("macFilterEn").getValue(),
            "filterMode": cmp.getComponent("filterMode").getValue(),
            "macList": ""
        };
        let tpData = tableCmp.getValue();
        for (var i = 0; i < tpData.length; i++) {
            if (i) {
                subData.macList += "~";
            }
            subData.macList += tpData[i].mac;
            subData.macList += ";";
            subData.macList += statusCmp[i].getValue();
        }

        return subData;
    }


}

module.exports = new ModuleLogic();