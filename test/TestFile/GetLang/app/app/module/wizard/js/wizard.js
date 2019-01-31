'use strict';
import $ from 'jquery';

import apMode from './apMode.js';
import stationMode from './stationMode.js';
import wispMode from './wispMode.js';
import universalrepeaterMode from './universalrepeaterMode.js';
import repeaterMode from './repeaterMode.js';
import p2mpMode from './p2mpMode.js';
import routerMode from './routerMode.js';

import '../../../common/component/FormRadioList.js';
import '../../../common/component/FormTable.js';
import '../../../common/component/FormText.js';
import '../../../common/component/FormHelpText.js';

import wizardUtil from './wizardUtil.js';
import utils from '../../../common/libs/common.js';

function ModuleLogic() {

	let that = this,
		step = 0,
		curMode = "ap",
		macIndex = 0,
		scaning = false,
		url = {
			"initUrl": "goform/getWizardInfo",
			"scanUrl": "goform/wrlScanList",
			"setUrl": "goform/setWizardInfo"
		};

	//模式对象，每种模式对应一个对象 @added by zy
	this.modeList = {
		"ap": null,
		"station": null,
		"universalrepeater": null,
		"wisp": null,
		"repeater": null,
		"p2mp": null,
		"router": null
	};

	//每个组件模块的组件对象分别放入一个对象里
	//上级AP无线模块组件
	this.wirelessComp = null;
	//扫描模块组件
	this.scanComp = null;
	//ip设置模块组件
	this.ipComp = null;
	//ap无线模块
	this.apWirelessComp = null;
	//接入组件
	this.connectComp = null;
	//多重上级AP的扫描组件
	this.multiScanComp = null;
	//第一页组件
	this.$workmodeList;

	this.pageData = {
		"initData": null,  //初始化快速设置的数据
		"scanData": null   //扫描获得的数据
	};
	let tempData = {};


	this.init = function () {
		initHelpText();
		initComponent();
		initEvent();
		getData();
	};

	/**
	 * 初始化帮助信息
	 */
	let initHelpText = function(){
		$("#wizard-help-text").FormHelpText({
			"text":[
				{ "title":_("AP:"),"text":_("In this mode, the device can create a wireless network for wireless devices, such as smart phones, laptops, tablets and so on.")},
				{ "title":_("Client:"),"text":_("In this mode, the device works as a wireless adapter to connect to the wireless network of peer AP, and does not provide wireless access point.")},
				{ "title":_("Universal Repeater:"),"text":_("In this mode, this device creates a same wireless network as that of peer AP for broader network coverage.")+ _("Advantage of Universal Repeater compared with Repeater mode: the WDS function is not required on peer AP.")},
				{ "title":_("WISP:"),"text":_("connect to an access point provided by ISP in wireless manner.")},
				{ "title":_("Repeater:"),"text":_("This device connects to multiple wired networks in wireless manner, and provides wireless access point.")+ _("To use the Repeater function of this device, peer AP must support WDS function, and use the same radio band as that of the device.")},
				{ "title":_("P2MP:"),"text":_("This device connects to multiple wired networks in wireless manner, but does not provide wireless access point.")+ _("P2MP mode is used to achieve communication between multiple offices of an enterprise in a city.")},
				{ "title":_("Router:"),"text":_("If this device works in Router mode, the PoE LAN/WAN port works as WAN port and is used to connect to a modem.")}
				]
		});
	};

	/**
	 * 获取页面初始数据
	 */
	let getData = function () {
		$.post(url.initUrl, (data) => {
			tempData = JSON.parse(data);
			that.pageData.initData = tempData;
			formatData();
			curMode = tempData.mode;
			initValue();
		});
	};

	let initEvent = function () {
		$("#prevBtn").on("click", () => {
			that.modeList[curMode].goBefore();
		});
		$("#nextBtn").on("click", () => {
			that.modeList[curMode].goNext();
		});

		$("#reScan").on("click", function (e) {
			e.stopPropagation();
			that.scanComp.$scanTable.hide();
			getScanList();
		});
		$("#multiReScan").on("click", function (e) {
			e.stopPropagation();
			that.multiScanComp.$multiScanTable.hide();
			getMultiScanList();
		});
		$("#reScan").parent().on("click", function (e) {
			//防止点击空白处也触发按钮
			e.stopPropagation();
		});
		//点击单扫描页面的radio自动给相应的input复制
		$("#scanTable tbody").on("click", "tr", function () {
			//因为重新选择了ssid 所以无线的参数不能用以前的了，要清空
			that.wirelessComp.reset();

			let $this = $(this);
			$this.find("input[type=radio]")[0].checked = true;
			let index = $this.attr("data-index");
			let data = that.pageData.scanData[index];
			//给上级ap输入框赋值
			that.scanComp.getComponent("remoteApSsid").setValue(data.ssid, true);
			//给下一步的上级AP和MAC赋值
			that.wirelessComp.getComponent("remoteSsid").setValue(data.ssid);
			that.wirelessComp.getComponent("remoteMac").setValue(data.mac);
			that.wirelessComp.getComponent("remoteChannel").setValue(data.channel, true);

			let authMap = {
				"AES": "aes",
				"TKIP": "tkip",
				"TKIP&AES": "aes+tkip"
			};

			that.wirelessComp.getComponent("remoteSecType").setValue(data.secType.split(",")[0].toLowerCase(), true);
			if (data.secType.split(",")[0].toLowerCase() != "wep" && data.secType.split(",")[0].toLowerCase() != "none") {
				that.wirelessComp.getComponent("remoteWpaAuth").setValue(authMap[data.secType.split(",")[1]], true);
			}

			that.scanComp.selectData = that.pageData.scanData[index];

		});

		$("#multiScanTable tbody").on("click", "tr", function () {
			let macCmp,
				$this = $(this),
				checkBox = $this.find("input[type=checkbox]")[0],
				loop = 0,
				hasEmpty = false;
			//说明是点击取消的  之前已经有标记了
			if ($this.attr("class").indexOf("mac-select-") !== -1) {
				macIndex = parseInt($this.attr("class").split("mac-select-")[1]);
				macCmp = that.multiScanComp.getComponent("remoteMac" + (macIndex + 1));
				macCmp.setValue("");
				$(this).removeClass("mac-select-" + macIndex);
				checkBox.checked = false;
			} else { //点击勾选的
				checkBox.checked = true;

				for (loop = 1; loop <= 4; loop++) {
					//优先给为空的输入框赋值
					if (that.multiScanComp.getComponent("remoteMac" + loop).getValue() == "") {
						macIndex = loop - 1;
						hasEmpty = true;
						break;
					}
				}
				//如果没有为空的情况下，优先寻找没有标签的选项
				if(!hasEmpty){
					for (loop = 0; loop <= 3; loop++) {
						//==0 说明这个没有被选中过
						if($(".mac-select-"+loop).length == 0){
							macIndex = loop;
							break;
						}
					}
				}

				//清除之前标签的记录
				if ($(".mac-select-" + macIndex).length > 0) {
					$(".mac-select-" + macIndex).find("input[type=checkbox]")[0].checked = false;
					$(".mac-select-" + macIndex).removeClass("mac-select-" + macIndex);
				}
				//给当前的数据打上标签   
				$this.addClass("mac-select-" + macIndex);

				//然后把这行的mac赋给相应的mac    0~3  转换为 1~4
				macCmp = that.multiScanComp.getComponent("remoteMac" + (macIndex + 1));
				macCmp.setValue($(this).find("td").eq(3).text(), true);

				//如果是第一个，则给无线的mac及ssid赋值
				if (macIndex == 0) {
					//因为重新选择了ssid 所以无线的参数不能用以前的了，要清空
					that.wirelessComp.reset();
					let index = $this.attr("data-index");
					let data = that.pageData.scanData[index];

					that.wirelessComp.getComponent("remoteSsid").setValue(data.ssid);
					that.wirelessComp.getComponent("remoteMac").setValue(data.mac);
					that.wirelessComp.getComponent("remoteChannel").setValue(data.channel, true);
					let authMap = {
						"AES": "aes",
						"TKIP": "tkip",
						"TKIP&AES": "aes+tkip"
					};
					that.wirelessComp.getComponent("remoteSecType").setValue(data.secType.split(",")[0].toLowerCase(), true);
				}

				//macIndex++
				macIndex = (macIndex + 1) % 4;
			}


		});
	};

	/**
	 * 初始化页面数据
	 */
	let initValue = function () {
		wizardUtil.changeJumpIp(tempData.lanIp);
		//初始化mode
		that.$workmodeList.setValue(tempData.mode, true);
		changeSecType();
	};
	/**
	 * 给一些为空的值一个默认值
	 * 主要是那些下拉框
	 */
	let formatData = function () {
		if (tempData.mode == "") {
			tempData.mode = "ap";
		}
		if (tempData.remoterWepAuth == "") {
			tempData.remoterWepAuth = "shared";
		}
		if (tempData.remoteDefaultkey == "") {
			tempData.remoteDefaultkey = "1";
		}
		if (tempData.remoteChannel == "") {
			tempData.remoteChannel = "0";
		}
		if (tempData.apWpaAuth == "") {
			tempData.apWpaAuth = "aes";
		}
		if (tempData.netBridge == "") {
			tempData.netBridge = "1";
		}
		if (tempData.apSecType == "") {
			tempData.apSecType = "none";
		}
		for (let loop = 1; loop <= 4; loop++) {
			if (tempData["remoteWepKeyType" + loop] == "") {
				tempData["remoteWepKeyType" + loop] = "ascii";
			}
		}
		if (tempData.wanType == "") {
			tempData.wanType = "dhcp";
		}
		if (!tempData.remoteApSsid) {
			tempData.remoteApSsid = tempData.remoteSsid;
		}
	};
	/**
	 * 初始化组件
	 */
	let initComponent = function () {
		//第一页组件
		that.$workmodeList = $("#formradiolist").Rcomponent({
			"dataField": "FormRadioList",
			"defaultValue": "ap",
			"css": "block-label",
			"selectArray": {
				"ap": _("AP模式") + spanWrap(_("把现有的有线网络转化为无线网络")),
				"station": _("客户端模式") + spanWrap(_("作为无线网卡，连接到上级无线网络")),
				"universalrepeater": _("万能中继模式") + spanWrap(_("中继现有无线信号，扩大无线网络覆盖范围")),
				"wisp": _("无线WAN模式") + spanWrap(_("无线连接到ISP热点，并分享网络")),
				"repeater": _("中继模式") + spanWrap(_("通过无线桥接将多个有线网络连通起来，自身提供无线接入功能")),
				"p2mp": _("P2MP模式") + spanWrap(_("通过无线桥接将多个有线网络连通起来，自身不提供无线接入功能")),
				"router": _("路由模式") + spanWrap(_("有线连接到Modem（猫），并分享网络"))
			},
			"changeCallBack": function () {
				curMode = this.value;
				if (tempData) {
					that.modeList[curMode].getInitData(tempData);
				}
			}
		});
		//无线设置模块组件
		let tempSelect = {};  //信道的select选项
		tempSelect["0"] = _("自动");
		for (let i = 1; i <= 13; i++) {
			tempSelect[i] = (i + "(" + (2007 + i * 5) + ")");
		}

		/**
		 * 上级无线设置的组件
		 */
		that.wirelessComp = $.componentManager({
			"container": "#wireless-set",
			"formCfg": {
				"remoteSsid": {
					"required": false
				}, "remoteMac": {
					"required": false
				},
				"remoteChannel": {
					"selectArray": tempSelect,
					"defaultValue": "0"
				}, "remoteSecType": {
					"selectArray": {
						"none": _("不加密"),
						"wep": _("WEP"),
						"wpa-psk": _("WPA"),
						"wpa2-psk": _("WPA2-PSK"),
						"mixed wpa/wpa2-psk": _("Mixed WPA/WPA2-PSK")
					},
					"defaultValue": "none",
					"changeCallBack": changeSecType
				}, "remoteWpaAuth": {
					"defaultValue": "aes",
					"css": "enc-radio",
					"selectArray": {
						"aes": "AES",
						"tkip": "TKIP",
						"aes+tkip": "TKIP&AMP;AES"
					}
				}, "remoteWpaPassword": {
					"dataOptions": [{ "type": "len", "args": [8, 64] }],
					"placeholder": _("输入上级无线网络密码")
				}, "remoterWepAuth": {
					"selectArray": {
						"open": _("Open"),
						"shared": _("Shared")
					},
					"defaultValue": "open"
				}, "remoteDefaultkey": {
					"selectArray": {
						"1": _("密钥1"),
						"2": _("密钥2"),
						"3": _("密钥3"),
						"4": _("密钥4")
					},
					"defaultValue": "1"
				}, "remoteWepKey1": {
					"dataOptions": [{ "type": "wep.ascii" }],
					"maxLength": 26
				}, "remoteWepKeyType1": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepSecType
				}, "remoteWepKey2": {
					"maxLength": 26,
					"dataOptions": [{ "type": "wep.ascii" }]
				}, "remoteWepKeyType2": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepSecType
				}, "remoteWepKey3": {
					"maxLength": 26,
					"dataOptions": [{ "type": "wep.ascii" }]
				}, "remoteWepKeyType3": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepSecType
				}, "remoteWepKey4": {
					"maxLength": 26,
					"dataOptions": [{ "type": "wep.ascii" }]
				}, "remoteWepKeyType4": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepSecType
				}
			}
		});

		/**
		 * ap自己无线设置的组件
		 */
		that.apWirelessComp = $.componentManager({
			"container": "#ap-wireless-set",
			"formCfg": {
				"apSsid": {
					"dataOptions": [{ "type": "ssid", "args": [1, 32] }],
					"maxLength": 32,
					"placeholder": _("请输入SSID")
				}, "apChannel": {
					"selectArray": tempSelect,
					"defaultValue": "0"
				}, "apSecType": {
					"selectArray": {
						"none": _("不加密"),
						"wpa-psk": _("WPA"),
						"wpa2-psk": _("WPA2-PSK"),
						"mixed wpa/wpa2-psk": _("Mixed WPA/WPA2-PSK")
					},
					"defaultValue": "none",
					"changeCallBack": changeApSecType
				}, "apWpaAuth": {
					"defaultValue": "aes",
					"css": "enc-radio",
					"selectArray": {
						"aes": "AES",
						"tkip": "TKIP",
						"aes+tkip": "TKIP&AMP;AES"
					}
				}, "apPassword": {
					"dataOptions": [{ "type": "ssidPassword" }],
					"maxLength": 64
				}
			}
		});

		//扫描组件
		that.scanComp = $.componentManager({
			"container": "#scan-set",
			"formCfg": {
				"scanBtn": {
					"text": '<a id="reScan" class="underline-a">' + _("重新扫描") + '</a><span id="loading" class="loading none"></span>',
					"changeCallBack": function () {
						if (this.value == "1") {
							getScanList();
						} else {
							that.scanComp.$scanTable.hide();
						}
					}
				}, "remoteApSsid": {
					"placeholder": _("请选择您要连接的SSID")
				}, "netBridge": {
					"dataTitle": _("透明网桥"),
					"dataKey": "FormCheckList",
					"dataField": "FormCheckList",
					"defaultValue": "",
					"selectArray": { "1": "" },
					"autoValidate": false,
					"required": false,
					"renderedCallBack": function () {
						this.setValue(1);
					}
				}
			}
		});
		that.scanComp.$scanTable = $("#scanTable").TablePage({
			"css": "scan-table",
			"sortFields": ["signal", "SSID"],
			"sortOpt": { "signal": 1, "SSID": 2 },
			"columns": [
				{
					"title": _("选择"), "field": "index", "width": "60", "format": function (index) {   //生成radio
						return '<input type="radio" id="check-radio-' + index + '" name="scan-radio">';
					}
				},
				{ "title": _("SSID"), "width": "205", "sortable": true, "field": "ssid", "maxLength": 17 },
				{ "title": _("信道"), "width": "60", "sortable": true, "field": "channel" },
				{ "title": _("MAC地址"), "width": "180", "sortable": true, "field": "mac" },
				{ "title": _("安全模式"), "width": "250", "sortable": true, "field": "secType", "maxLength": 18 },
				{
					"title": _("信号强度"), "width": "110", "sortable": true, "field": "signal", "format": function (signal) {
						let className = "fixed";
						if (signal <= -75) {
							className += " signal1";
						} else if (signal > -75 && signal <= -60) {
							className += " signal3";
						} else if (signal > -60) {
							className += " signal5";
						} else {
							className += " signal1";
						}
						// return '<span class="none">' + className[className.length - 1] + '</span><span class="signal ' + className + '"></span>';
						return '<span class="signal-text">' + signal + 'dBm</span><span class="signal ' + className + '"></span>';
					}
				}],
			"showStyle": 2
		});

		//ip设置相关组件
		that.ipComp = $.componentManager({
			"container": "#ip-set",
			"formCfg": {
				"lanIp": {
					"dataOptions": [{ "type": "ip.all" }]
				}, "lanMask": {
					"dataOptions": [{ "type": "mask" }]
				}, "lanGateway": {
					"dataOptions": [{ "type": "ip.all" }]
				}, "lanDns1": {
					"dataOptions": [{ "type": "ip.all" }]
				}, "lanDns2": {
					"dataOptions": [{ "type": "ip.all" }],
					"required": false
				}
			},
			"beforeSubmit": function () {
				//wisp模式下不检查
				if (that.$workmodeList.getValue() == "wisp") {
					return true;
				}
				let lanIp = this.getComponent("lanIp").getValue(),
					lanMask = this.getComponent("lanMask").getValue(),
					lanGateway = this.getComponent("lanGateway").getValue(),
					lanDns1 = this.getComponent("lanDns1").getValue(),
					lanDns2 = this.getComponent("lanDns2").getValue();

				return checkIpCmpValid("lanIp", "lanGateway", lanIp, lanMask, lanGateway, lanDns1, lanDns2);

			}
		});

		//接入设置相关组件
		that.connectComp = $.componentManager({
			"container": "#connect-set",
			"formCfg": {
				"wanType": {
					"selectArray": {
						"dhcp": _("DHCP(自动获取)"),
						"static": _("静态IP"),
						"pppoe": _("PPPoE")
					},
					"defaultValue": "dhcp",
					"changeCallBack": changeConnectType
				}, "staticIp": {
					"dataOptions": [{ "type": "ip.all" }]
				}, "staticMask": {
					"dataOptions": [{ "type": "mask" }]
				}, "staticGateway": {
					"dataOptions": [{ "type": "ip.all" }]
				}, "staticDns1": {
					"dataOptions": [{ "type": "ip.all" }]
				}, "staticDns2": {
					"dataOptions": [{ "type": "ip.all" }],
					"required": false
				}, "pppoeUser": {
					"dataOptions": [{ "type": "pppoe" }],
					"maxLength": 64
				}, "pppoePassword": {
					"dataOptions": [{ "type": "pppoe" }],
					"maxLength": 64
				}
			},
			"beforeSubmit": function () {
				if (this.getComponent("wanType").getValue() == "static") {
					let staticIp = this.getComponent("staticIp").getValue(),
						staticMask = this.getComponent("staticMask").getValue(),
						staticGateway = this.getComponent("staticGateway").getValue(),
						staticDns1 = this.getComponent("staticDns1").getValue(),
						staticDns2 = this.getComponent("staticDns2").getValue();

					//检查IP与网关是否在同一网段
					if (!checkIpCmpValid("staticIp", "staticGateway", staticIp, staticMask, staticGateway, staticDns1, staticDns2)) {
						return false;
					}
					//检查wan口IP是否与LAN IP在同一网段
					if (checkIpInSameSegment(staticIp, staticMask, that.pageData.initData.lanIp, that.pageData.initData.lanMask)) {
						$.formMessage(_("LAN IP 与 WAN IP不能在同一网段"));
						return false;
					}

				}
			}
		});

		//多选扫描组件
		that.multiScanComp = $.componentManager({
			"container": "#multi-scan-set",
			"formCfg": {
				"multiScanBtn": {
					"text": '<a id="multiReScan" class="underline-a">' + _("重新扫描") + '</a><span id="loading1" class="loading none"></span>',
					"changeCallBack": function () {
						if (this.value == "1") {
							getMultiScanList();
						} else {
							that.multiScanComp.$multiScanTable.hide();
						}
					}
				}, "remoteMac1": {
					"dataOptions":[{"type":"mac.all"}],
					"placeHolder": _("请选择您要连接的对端AP MAC地址"),
					"changeCallBack":function(){//当值不等于选中的值时选中取消
						if($(".mac-select-0").length > 0 && this.value != $(".mac-select-0").find("td").eq(3).text()){
							$(".mac-select-0").find("input")[0].checked = false;
							$(".mac-select-0").removeClass("mac-select-0");
						}
					}
				}, "remoteMac2": {
					"dataOptions":[{"type":"mac.all"}],
					"placeHolder": _("请选择您要连接的对端AP MAC地址"),
					"required": false,
					"changeCallBack":function(){
						if($(".mac-select-1").length > 0 && this.value != $(".mac-select-1").find("td").eq(3).text()){
							$(".mac-select-1").find("input")[0].checked = false;
							$(".mac-select-1").removeClass("mac-select-1");
						}
					}
				}, "remoteMac3": {
					"dataOptions":[{"type":"mac.all"}],
					"placeHolder": _("请选择您要连接的对端AP MAC地址"),
					"required": false,
					"changeCallBack":function(){
						if($(".mac-select-2").length > 0 && this.value != $(".mac-select-2").find("td").eq(3).text()){
							$(".mac-select-2").find("input")[0].checked = false;
							$(".mac-select-2").removeClass("mac-select-2");
						}
					}
				}, "remoteMac4": {
					"dataOptions":[{"type":"mac.all"}],
					"placeHolder": _("请选择您要连接的对端AP MAC地址"),
					"required": false,
					"changeCallBack":function(){
						if($(".mac-select-3").length > 0 && this.value != $(".mac-select-3").find("td").eq(3).text()){
							$(".mac-select-3").find("input")[0].checked = false;
							$(".mac-select-3").removeClass("mac-select-3");
						}
					}
				}
			}
		});
		that.multiScanComp.$multiScanTable = $("#multiScanTable").TablePage({
			"css": "scan-table",
			"sortFields": ["signal", "SSID"],
			"sortOpt": { "signal": 1, "SSID": 2 },
			"columns": [
				{
					"title": _("选择"), "field": "index", "width": "60", "format": function (index) {   //生成checkbox
						return '<input type="checkbox" id="check-radio-' + index + '" name="multi-scan-radio">';
					}
				},
				{ "title": _("SSID"), "width": "205", "sortable": true, "field": "ssid", "maxLength": 17 },
				{ "title": _("信道"), "width": "60", "sortable": true, "field": "channel" },
				{ "title": _("MAC地址"), "width": "180", "sortable": true, "field": "mac" },
				{ "title": _("安全模式"), "width": "250", "sortable": true, "field": "secType", "maxLength": 18 },
				{
					"title": _("信号强度"), "width": "110", "sortable": true, "field": "signal", "format": function (signal) {
						let className = "fixed";
						if (signal <= -75) {
							className += " signal1";
						} else if (signal > -75 && signal <= -60) {
							className += " signal3";
						} else if (signal > -60) {
							className += " signal5";
						} else {
							className += " signal1";
						}
						return '<span class="signal-text">' + signal + 'dBm</span><span class="signal ' + className + '"></span>';
					}
				}],
			"showStyle": 2
		});

		//给每个模式传入相关的组件，以便操作
		that.modeList.ap = new apMode(that.apWirelessComp);
		that.modeList.station = new stationMode(that.scanComp, that.wirelessComp, that.ipComp);
		that.modeList.universalrepeater = new universalrepeaterMode(that.scanComp, that.wirelessComp, that.ipComp);
		that.modeList.wisp = new wispMode(that.scanComp, that.wirelessComp, that.ipComp, that.connectComp, that.apWirelessComp);
		that.modeList.router = new routerMode(that.connectComp, that.apWirelessComp);
		that.modeList.repeater = new repeaterMode(that.multiScanComp, that.wirelessComp, that.ipComp);
		that.modeList.p2mp = new p2mpMode(that.multiScanComp, that.wirelessComp, that.ipComp);
	};

	/**
	 * 检查LAN口IP相关的设置是否合法
	 */
	function checkIpCmpValid(ipEle, gateWayEle, lanIp, lanMask, lanGateway, lanDns1, lanDns2) {
		let checkRes = null;

		//检查LAN IP是否为组播 广播地址
		checkRes = utils.checkIsVoildIpMask(ipEle, lanMask, "IP");
		if (checkRes) {
			$.formMessage(checkRes);
			return false;
		}
		//检查网关是否为组播 广播地址
		checkRes = utils.checkIsVoildIpMask(gateWayEle, lanMask, "Gateway");
		if (checkRes) {
			$.formMessage(checkRes);
			return false;
		}

		//检查ip和网关是否在同一网段  以及是否相同
		if (!checkIpInSameSegment(lanIp, lanMask, lanGateway, lanMask)) {
			$.formMessage(_("IP与网关必须在同一网段"));
			return false;
		} else {
			if (lanIp == lanGateway) {
				$.formMessage(_("IP与网关不能相同"));
				return false;
			}
		}
		//检查DNS是否一样
		if (lanDns1 == lanDns2) {
			$.formMessage(_("首选DNS与备用DNS不能相同"));
			return false;
		}
		return true;
	}

	function changeWepSecType() {
		let id = this.$element.attr("id");
		let index = id[id.length - 1];

		let selector = "remoteWepKey" + index;
		let keyX = that.wirelessComp.getComponent(selector);
		keyX.option.dataOptions = [{ "type": "wep." + this.value }];
	}

	/**
	 * 获取wifi扫描信息并生产表格
	 */
	function getScanList() {
		var ii;
		$("#loading").removeClass("none");
		if (!scaning) {
			scaning = true;
			$.post(url.scanUrl, function (obj) {
				setTimeout(function () {
					that.scanComp.$scanTable.show();
					$("#loading").addClass("none");
					obj = JSON.parse(obj);
					obj = obj.ssidList;
					for (ii = 0; ii < obj.length; ii++) {
						//信道要变成整形   因为组件暂时只支持字符串排序
						obj[ii].channel = parseInt(obj[ii].channel);
					}
					that.pageData.scanData = obj;
					that.scanComp.$scanTable.reLoad(obj);
					//避免多次点击扫描按钮
					that.scanComp.getComponent("scanBtn").setValue("1");
					scaning = false;
				}, 1000);
			});
		}
	}
	/**
	 * 获取wifi扫描信息并生产表格
	 */
	function getMultiScanList() {
		$("#loading1").removeClass("none");
		var ii;
		if (!scaning) {
			scaning = true;
			$.post(url.scanUrl, function (obj) {
				setTimeout(function () {
					that.multiScanComp.$multiScanTable.show();
					$("#loading1").addClass("none");
					obj = JSON.parse(obj);
					obj = obj.ssidList;
					for (ii = 0; ii < obj.length; ii++) {
						//信道要变成整形   因为组件暂时只支持字符串排序
						obj[ii].channel = parseInt(obj[ii].channel);
					}
					that.pageData.scanData = obj;
					that.multiScanComp.$multiScanTable.reLoad(obj);
					//避免多次点击扫描按钮
					that.multiScanComp.getComponent("multiScanBtn").setValue("1");
					scaning = false;
				}, 1000);
			});
		}
	}
	/**
	 * 切换ap加密模式时  若加密模式为不加密隐藏密码及加密方式   若为WPA-PSK  AES&TKIP需要变为不可选   @added by zy
	 */
	function changeApSecType() {
		let comp = that.apWirelessComp;
		let $encType = comp.getComponent("apWpaAuth");
		let $secType = comp.getComponent("apSecType");
		let $password = comp.getComponent("apPassword");

		//除了WPA模式下混合加密都是允许的
		$("#apWpaAuth").find("input").eq(2).removeAttr("disabled");
		switch ($secType.getValue()) {
			case "none": {
				$encType.hide();
				$password.hide();
			} break;
			case "wpa-psk": {
				$encType.show();
				$password.show();
				if ($encType.getValue() == "aes+tkip") {
					$encType.setValue("aes");
				}
				$("#apWpaAuth").find("input").eq(2).attr("disabled", "disabled");
			} break;
			case "wpa2-psk":
			case "mixed wpa/wpa2-psk": {
				$encType.show();
				$password.show();
			} break;
		}
	}

	/**
	 * 切换上级加密模式时  若加密模式为不加密隐藏密码及加密方式   若为WPA-PSK  AES&TKIP需要变为不可选   @added by zy
	 */
	function changeSecType() {
		let comp = that.wirelessComp;
		let $encType = comp.getComponent("remoteWpaAuth");
		let $secType = comp.getComponent("remoteSecType");
		let $password = comp.getComponent("remoteWpaPassword");
		let $wepPassword1 = comp.getComponent("remoteWepKey1");
		let $wepPassword2 = comp.getComponent("remoteWepKey2");
		let $wepPassword3 = comp.getComponent("remoteWepKey3");
		let $wepPassword4 = comp.getComponent("remoteWepKey4");

		//隐藏这个是为了不让验证函数去验证
		$wepPassword1.hide();
		$wepPassword2.hide();
		$wepPassword3.hide();
		$wepPassword4.hide();

		//除了WPA模式下混合加密都是允许的
		$("#wireless-enctype").find("input").eq(2).removeAttr("disabled");
		switch ($secType.getValue()) {
			case "none": {
				$encType.hide();
				$password.hide();
				$(".wep-wrap").addClass("none");
			} break;
			case "wep": {
				$wepPassword1.show();
				$wepPassword2.show();
				$wepPassword3.show();
				$wepPassword4.show();
				$encType.hide();
				$password.hide();
				$(".wep-wrap").removeClass("none");
			} break;
			case "wpa-psk": {
				$encType.show();
				$password.show();
				$(".wep-wrap").addClass("none");
				if ($encType.getValue() == "aes+tkip") {
					$encType.setValue("aes");
				}
				$("#wireless-enctype").find("input").eq(2).attr("disabled", "disabled");
			} break;
			case "wpa2-psk":
			case "mixed wpa/wpa2-psk": {
				$encType.show();
				$password.show();
				$(".wep-wrap").addClass("none");
			} break;
		}
	}

	/**
	 * 切换接入方式  pppoe dhcp static
	 */
	function changeConnectType() {
		let comp = that.connectComp,
			$wanType = comp.getComponent("wanType"),
			$pppoeUser = comp.getComponent("pppoeUser"),
			$pppoePassword = comp.getComponent("pppoePassword");
			
		switch ($wanType.getValue()) {
			case "dhcp": {
				for (var prop in comp.components) {
					if (comp.components.hasOwnProperty(prop)) {
						//除了这两个属性都要隐藏
						if (prop != "wanType" && prop != "isSingle") {
							comp.components[prop].hide();
						}
					}
				}
			} break;
			case "static": {
				//将pppoe的两个隐藏
				$pppoeUser.hide();
				$pppoePassword.hide();
				for (var prop in comp.components) {
					if (comp.components.hasOwnProperty(prop)) {
						//除了这两个属性都要show
						if (prop != "wanType" && prop != "isSingle" && prop != "pppoePassword" && prop != "pppoeUser") {
							comp.components[prop].show();
						}
					}
				}
			} break;
			case "pppoe": {
				for (var prop in comp.components) {
					if (comp.components.hasOwnProperty(prop)) {
						//除了这两个属性都要隐藏
						if (prop != "wanType" && prop != "isSingle") {
							comp.components[prop].hide();
						}
					}
				}
				$pppoeUser.show();
				$pppoePassword.show();
			} break;

		}
	}

	function spanWrap(str) {
		return '&nbsp;&nbsp;&nbsp;<span class="help-block controls-text">' + str + '</span>';
	}
}
module.exports = new ModuleLogic();