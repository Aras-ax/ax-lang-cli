'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput.js';
import '../../../common/component/FormCheckBox.js';
import '../../../common/component/FormRadioList.js';
import '../../../common/component/FormPercent.js';
import '../../../common/component/FormHelpText.js';

function ModuleLogic() {
	var data, cmp;

	this.init = function () {
		_initHelpText();
		_registComponent();
		_initEvent();
		_getData();
	};

	let _initHelpText = function () {
		$("#wrl_basic-help-text").FormHelpText({
			"text": [
				{ "title": _("Enable Wireless:"), "text": _("whether to enable the wireless function of this device.") },
				{ "title": _("Country/Region:"), "text": _("country or region where this device is located. You can select the country or region to ensure that this device complies with the channel regulations of the country or region.") },
				{ "title": _("SSID:"), "text": _("Wireless network name.") },
				{ "title": _("Broadcast SSID:"), "text": _("whether to broadcast the SSID. Enable indicates that the SSID is broadcast and nearby wireless devices can find the SSID. Disable indicates that the SSID is not broadcast and nearby wireless devices cannot find the SSID.") },
				{ "title": _("Network Mode:"), "text": _("network mode of this device. The available options include 11b/g, 11b, 11g, and 11 b/g/n.") },
				{ "title": _("Channel:"), "text": _("channel in which this device operates. Auto indicates that this device automatically changes to a channel rarely used in the ambient environment to prevent interference.") },
				{ "title": _("Transmit Power:"), "text": _("transmit power of this device.") },
				{ "title": _("Channel Bandwidth:"), "text": _("width of the frequency band of the channel of this device.") },
				{ "title": _("Extension Channel:"), "text": _("used to determine the operating frequency band of this device when it uses the 40 MHz channel bandwidth in 11n mode.") },
				{ "title": _("Transmit Rate:"), "text": _("Specify wireless transmission rate of the device.") + _("If the channel bandwidth is set to 40 MHz, the maximum transmission rate is MCS7 (135 Mbps).") + _("If the channel bandwidth is set to 20 MHz, this device uses lower transmission rate. And the maximum transmission rate is MCS7 (65 Mbps).") },
				{ "title": _("Security Mode:"), "text": _("security mode of the wireless network of this device. The available modes include none, WEP, WPA-PSK, WPA2-PSK, Mixed WPA/WPA2-PSK, WPA and WPA2.") },
				{ "title": _("(1) WEP:"), "text": _("Wired Equivalent Privacy algorithm.") },
				{ "title": _("Authentication Type:"), "text": _("Open (use open system), Shared (use shared key), and 802.1x (use RADIUS server for authentication). If the Open or Shared option is used, enter one to four WEP keys, each of which consists of 5 or 13 ASCII characters or 10 or 26 hexadecimal characters. Only the default key is effective. If the 802.1x option is used, enter the IP address, port number, and key which consists of 1 to 64 ASCII characters of the RADIUS server.") },
				{ "title": _("(2) WPA/WPA2-PSK:"), "text": _("security modes implemented based on a shared key, including WPA and WPA2.") },
				{ "title": _("Encryption Algorithm:"), "text": _("algorithm for WPA encryption.") },
				{ "title": _("Key:"), "text": _("preshared WPA key. It consists of 8 to 63 ASCII characters or 8 to 64 hexadecimal characters.") },
				{ "title": _("Key Update Interval:"), "text": _("Key Update Interval: interval at which a WPA key is updated. A shorter interval leads to higher security. The value 0 indicates that no key update is performed.") },
				{ "title": _("(3) WPA/WPA2:"), "text": _("security modes implemented based on RADIUS server authentication to obtain a key, including WPA and WPA2.") },
				{ "title": _("RADIUS Server:"), "text": _("IP address of the RADIUS server") },
				{ "title": _("RADIUS Port:"), "text": _("authentication port of the RADIUS server. The default port number is 1812.") },
				{ "title": _("Encryption Algorithm:"), "text": _("algorithm for WPA encryption.") },
				{ "title": _("RADIUS Password:"), "text": _("shared password of the RADIUS server. It consists of 1 to 64 ASCII characters.") },
				{ "title": _("Isolate Client:"), "text": _("with this function enabled, devices connected to this SSID cannot communicate with each other, improving the security of the wireless network.") },
				{ "title": _("Max. Number of Clients:"), "text": _("maximum number of wireless clients that can be connected to the wireless network with the SSID.") }
			]
		});
	};

	let _getData = function () {
		$.post("goform/getWrlBasicInfo", function (str) {
			var tpData = JSON.parse(str);
			data = $.extend({}, tpData.basic, tpData.security);
			//有些数据的格式不是我们想要的，转换一下
			dataFormat();
			cmp.updateComponents(data);
		});
	};

	let _registComponent = function () {
		//信道和扩展信道的select选项
		let tempSelect = {};
		tempSelect["0"] = _("自动");
		for (let i = 1; i <= 13; i++) {
			tempSelect[i] = (i + "(" + (2007 + i * 5) + ")");
		}


		cmp = $.componentManager({
			"submitUrl": "/goform/setWrlBasicInfo",
			"showSubmitBar": true,
			"container": "#component-wrap",
			"beforeSubmit": function (data) {
				if (G.userType !== 'admin') {
					$.formMessage({
						'message': _('You must log in as an administrator to make any change.'),
						'displayTime': 1500
					});
					return false;
				} 
				data.wifiEn = data.wifiEn ? "1" : "0";
				data.tranSpeed = (parseInt(data.tranSpeed) - 1).toString();
				return data;
			},
			"afterSubmit": function (data) {
				data = JSON.parse(data);
				if (data.errCode == "0") {
					$.formMessage(_("保存成功"));
				} else if (data.errCode == "-1") {
					$.formMessage(_("保存失败"));
				}
			},
			"formCfg": {
				"wifiEn": {
				},
				"country": {
					"selectArray": {
						"AR": _("Argentina"),
						"BR": _("Brazil"),
						"CA": _("Canada"),
						"CN": _("China"),
						"CO": _("Colombia"),
						"CZ": _("Czech Republic"),
						"EG": _("Egypt"),
						"GB": _("UK"),
						"FR": _("France"),
						"DE": _("Germany"),
						"HK": _("Hong Kong"),
						"IN": _("India"),
						"ID": _("Indonesia"),
						"IR": _("Iran"),
						"IQ": _("Iraq"),
						"MX": _("Mexico"),
						"AU": _("Australia"),
						"TW": _("Taiwan"),
						"MY": _("Malaysia"),
						"PE": _("Peru"),
						"PK": _("Pakistan"),
						"PH": _("Philippines"),
						"PL": _("Poland"),
						"RO": _("Romania"),
						"RU": _("Russia"),
						"SA": _("Saudi Arabia"),
						"ZA": _("South Africa"),
						"ES": _("Spain"),
						"TH": _("Thailand"),
						"TR": _("Turkey"),
						"AE": _("United Arab Emirates"),
						"US": _("United States"),
						"UA": _("Ukraine"),
						"VE": _("Venezuela"),
						"VN": _("Vietnam")
					},
					"defaultValue": "CN",
					"changeCallBack": function () {
						let channel = cmp.getComponent("channel");
						if (this.value == "US" || this.value == "TW" || this.value == "MX" || this.value == "CA") {
							channel.removeItem("12");
							channel.removeItem("13");
						} else {
							channel.addItem({ "12": "12(2467)" });
							channel.addItem({ "13": "13(2472)" });
						}
						channel.setValue("0", true);
					}
				},
				"ssid": {
					"dataOptions": [{ "type": "ssid" }],
					"maxLength": 32
				},
				"broadcastSsid": {
					"selectArray": {
						"0": _("关闭"),
						"1": _("开启")
					}
				},
				"netMode": {
					"selectArray": {
						"bgn": "11b/g/n",
						"bg": "11b/g",
						"g": "11g",
						"b": "11b"
					},
					"changeCallBack": changeNetMode
				},
				"channel": {
					"selectArray": tempSelect,
					"defaultValue": "0",
					"changeCallBack": changeChannel
				},
				"power": {
					"start": 1,
					"end": 29,
					"fixed": 0,
					"defaultValue": 8
				},
				"bandwidth": {
					"selectArray": {

						// to show 这一版暂时不要这些特殊带宽
						// "5": "5MHz",
						// "10": "10MHz",
						"20": "20MHz",
						// "30": "30MHz",
						"40": "40MHz",
						"0": _("自动")
					},
					"defaultValue": "0"
				},
				"extChannel": {
					"selectArray": tempSelect,
					"defaultValue": "0"
				},
				"channelOffset": {
					"selectArray": {
						"0": _("关闭"),
						"1": _("开启")
					}
				},
				"tranSpeed": {
					"selectArray": (() => {
						let speed = ["", "13.5", "27", "40.5", "54", "81", "108", "121.5", "135"],
							tranSpeedArray = {};
						tranSpeedArray["0"] = _("自动");
						for (let i = 1; i <= 8; i++) {
							tranSpeedArray[i] = "MSC" + parseInt(i - 1) + "-" + speed[i] + "Mbps";
						}
						return tranSpeedArray;
					})(),
					"defaultValue": "0"
				},
				"secType": {
					"selectArray": {
						"none": _("不加密"),
						"wep": "WEP",
						"wpa-psk": "WPA-PSK",
						"wpa2-psk": "WPA2-PSK",
						"mixed wpa/wpa2-psk": "Mixed WPA/WPA2-PSK",
						"wpa": "WPA",
						"wpa2": "WPA2"
					},
					"defaultValue": "none",
					"changeCallBack": changeSecType
				},
				"radiusIp": {
					"dataOptions": [{ "type": "ip.all" }],
					"renderedCallBack": function () { this.hide(); }
				},
				"radiusPort": {
					"dataOptions": [{ "type": "num", "args": [1025, 65535] }],
					"defaultValue": "1812",
					"renderedCallBack": function () { this.hide(); }
				},
				"radiusKey": {
					"hasEyes": true,
					"dataOptions": [{ "type": "ssidPassword" }],
					"maxLength": 64,
					"renderedCallBack": function () { this.hide(); }
				},
				"pwdInterval": {
					"dataOptions": [{ "type": "num0", "args": [60, 9999] }],
					"description": _("s（范围：60~9999，0表示不更新）"),
					"defaultValue": "0",
					"renderedCallBack": function () { this.hide(); }
				},
				"wpaAuth": {
					"selectArray": {
						"aes": "AES",
						"tkip": "TKIP",
						"aes+tkip": "TKIP&AES"
					},
					"defaultValue": "aes",
					"renderedCallBack": function () { this.hide(); }
				},
				"wpaPassword": {
					"hasEyes": true,
					"dataOptions": [{ "type": "ssidPassword" }],
					"maxLength": 64,
					"renderedCallBack": function () { this.hide(); }
				},
				"wepAuth": {
					"selectArray": {
						"open": "Open",
						"shared": "Shared"
					},
					"defaultValue": "open",
					"renderedCallBack": function () { this.hide(); }
				},
				"defaultkey": {
					"selectArray": {
						"1": _("密钥1"),
						"2": _("密钥2"),
						"3": _("密钥3"),
						"4": _("密钥4")
					},
					"defaultValue": "1",
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKey1": {
					"dataOptions": [{ "type": "wep.ascii" }],
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKeyType1": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepType,
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKey2": {
					"dataOptions": [{ "type": "wep.ascii" }],
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKeyType2": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepType,
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKey3": {
					"dataOptions": [{ "type": "wep.ascii" }],
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKeyType3": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepType,
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKey4": {
					"dataOptions": [{ "type": "wep.ascii" }],
					"renderedCallBack": function () { this.hide(); }
				},
				"wepKeyType4": {
					"css": "wep-select",
					"selectArray": {
						"ascii": "ASCII",
						"hex": "HEX"
					},
					"defaultValue": "ascii",
					"changeCallBack": changeWepType,
					"renderedCallBack": function () { this.hide(); }
				},
				"isolationEn": {
					"selectArray": {
						"0": _("关闭"),
						"1": _("开启")
					}
				},
				"maxClient": {
					"description": _("(范围: %s~%s)", ["1", "128"]),
					"dataOptions": [{ "type": "num", "args": [1, 128] }],
					"maxLength": 3
				}
			}
		});

	};

	let _initEvent = function () { };

	function dataFormat() {
		//防止后台传空值过来
		if (!data.country) {
			data.country = "CN";
		}
		if (!data.ssidEn) {
			data.ssidEn = "1";
		}
		if (!data.channel) {
			data.channel = "1";
		}
		if (!data.netMode) {
			data.netMode = "bgn";
		}
		if (!data.bandwidth) {
			data.bandwidth = "auto";
		}
		if (!data.extChannel) {
			data.extChannel = "0";
		}
		if (!data.isolationEn) {
			data.isolationEn = "0";
		}
		if (!data.secType) {
			data.secType = "none";
		}
		if (!data.wepAuth) {
			data.wepAuth = "open";
		}
		if (!data.defaultkey) {
			data.defaultkey = "1";
		}
		if (!data.wepKeyType1) {
			data.wepKeyType1 = "ascii";
		}
		if (!data.wepKeyType2) {
			data.wepKeyType2 = "ascii";
		}
		if (!data.wepKeyType3) {
			data.wepKeyType3 = "ascii";
		}
		if (!data.wepKeyType4) {
			data.wepKeyType4 = "ascii";
		}

		// 传输速率这个组件，因为组件设计原因不能按顺序显示 所以需要处理一下 由-1~7 =》 0~8  @added by zy    
		data.tranSpeed = (parseInt(data.tranSpeed) + 1).toString();

	}

	/**
	 * 隐藏或者显示模块
	 * @param (obj,操作的组件群对象)
	 * @param (option,操作) hide 隐藏 show 显示
	 */
	function toggleCmps(obj, option) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop) && option === "hide" && (typeof obj[prop].hide === "function")) {
				obj[prop].hide();
			}
			if (obj.hasOwnProperty(prop) && option === "show" && (typeof obj[prop].show === "function")) {
				obj[prop].show();
			}
		}
	}

	/**
	 * wep密码改变时校验
	 */
	function changeWepType() {
		let id = this.$element.attr("id");
		let index = id[id.length - 1];

		let selector = "wepKey" + index;
		let keyX = cmp.getComponent(selector);
		keyX.option.dataOptions = [{ "type": "wep." + this.value }];
	}

	/**
	 * 改变加密模式
	 */
	function changeSecType() {
		let wpaPskCmps = {
			"$wpaAuth": cmp.getComponent("wpaAuth"),
			"$wpaPassword": cmp.getComponent("wpaPassword"),
			"$pwdInterval": cmp.getComponent("pwdInterval")
		};
		let wepCmps = {
			"$wepAuth": cmp.getComponent("wepAuth"),
			"$defaultkey": cmp.getComponent("defaultkey"),
			"$wepKey1": cmp.getComponent("wepKey1"),
			"$wepKeyType1": cmp.getComponent("wepKeyType1"),
			"$wepKey2": cmp.getComponent("wepKey2"),
			"$wepKeyType2": cmp.getComponent("wepKeyType2"),
			"$wepKey3": cmp.getComponent("wepKey3"),
			"$wepKeyType3": cmp.getComponent("wepKeyType3"),
			"$wepKey4": cmp.getComponent("wepKey4"),
			"$wepKeyType4": cmp.getComponent("wepKeyType4")
		};
		let wpaCmps = {
			"$wpaAuth": cmp.getComponent("wpaAuth"),
			"$wpaPassword": cmp.getComponent("wpaAuth"),
			"$radiusIp": cmp.getComponent("radiusIp"),
			"$radiusPort": cmp.getComponent("radiusPort"),
			"$radiusKey": cmp.getComponent("radiusKey"),
			"$pwdInterval": cmp.getComponent("pwdInterval")
		};
		switch (cmp.getComponent("secType").getValue()) {
			case "none": {
				toggleCmps(wpaPskCmps, "hide");
				toggleCmps(wepCmps, "hide");
				toggleCmps(wpaCmps, "hide");
			} break;
			case "wep": {
				toggleCmps(wpaPskCmps, "hide");
				toggleCmps(wpaCmps, "hide");
				toggleCmps(wepCmps, "show");
			} break;
			case "wpa-psk":
			case "wpa2-psk":
			case "mixed wpa/wpa2-psk": {
				toggleCmps(wepCmps, "hide");
				toggleCmps(wpaCmps, "hide");
				toggleCmps(wpaPskCmps, "show");
			} break;
			case "wpa":
			case "wpa2": {
				toggleCmps(wpaPskCmps, "hide");
				toggleCmps(wepCmps, "hide");
				toggleCmps(wpaCmps, "show");
			} break;
		}
	}

	/**
	 * 改变网络模式
	 */
	function changeNetMode() {
		//to show 如果加上了 5mhz 和 10mhz  需要修改这个地方
		//在bgn模式下才能配置所有带宽
		//在bgn模式下才能配置传输速率
		//在bgn模式下才能配置扩展信道
		let bandwidth = cmp.getComponent("bandwidth");
		if (this.value == "bgn") {
			bandwidth.addItem({ "0": _("自动"), "40": "40MHz" });
			cmp.getComponent("tranSpeed").show();
			cmp.getComponent("extChannel").show();
		} else {
			bandwidth.removeItem("0");
			bandwidth.removeItem("40");
			cmp.getComponent("tranSpeed").hide();
			cmp.getComponent("extChannel").hide();
		}
		bandwidth.setValue("20");
	}

	/**
	 * 改变信道后
	 */
	function changeChannel() {
		var chn = cmp.getComponent("channel").getValue();
		var extChn = cmp.getComponent("extChannel");
		var upper = chn > 4 ? parseInt(chn) - 4 : null;
		var lower = chn < 10 ? parseInt(chn) + 4 : null;
		let tpArray = {};
		if (chn == 0) {
			tpArray = {
				"0": _("自动")
			};
		} else {
			if (!!upper) {
				tpArray.upper = _("信道 %s", [upper]);
			}
			if (!!lower) {
				tpArray.lower = _("信道 %s", [lower]);
			}
		}
		extChn.option.selectArray = tpArray;
		extChn.update();

	}
}

module.exports = new ModuleLogic();