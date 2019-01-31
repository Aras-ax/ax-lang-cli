'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput.js';
import '../../../common/component/FormCheckBox.js';
import '../../../common/component/FormRadioList.js';
import '../../../common/component/FormHelpText.js';

function ModuleLogic() {

	var data, cmp;

	this.init = function () {
		_initHelpText();
		_registComponent();
		_getData();
	};

	let _initHelpText = function () {
		$("#wrl_advance-help-text").FormHelpText({
			"text": [
				{ "title": _("WMM:"), "text": _("WMM is a wireless QoS protocol ensuring that packets with higher priorities are transmitted earlier. This ensures better QoS of voice and video applications over wireless networks.") },
				{ "title": _("APSD:"), "text": _("Automatic Power Save Delivery. If it is enabled, the power consumption of this device is reduced after a specified period during which no traffic is transmitted or received. By default, it is disabled.") },
				{ "title": _("Minimum RSSI Threshold:"), "text": _("it specifies the minimum strength of received signals acceptable to this device.") + _("If the strength of the signals transmitted by a wireless device is weaker than this threshold, the wireless device cannot connect to this device.") },
				{ "title": _("Preamble"), "text": _("a group of bits located at the beginning of a packet to enable a receiver of the packet to perform synchronization and prepare for receiving data. By default, the Long Preamble option is selected for compatibility with old network adapters installed on wireless clients. To achieve better synchronization performance of networks, you can select the Short Preamble option.") },
				{ "title": _("Signal Reception Level"), "text": _("used to adjust the signal reception level. A higher level leads to better signal reception capability, but lower throughput.") },
				{ "title": _("Transmission Distance"), "text": _("wireless transmission distance of this device. You can set it based on the actual installation distance.") },
				{ "title": _("Beacon Interval:"), "text": _("interval at which this device sends Beacon frames.") + _("Beacon frames are sent at the interval to announce the existence of a wireless network. Generally, a smaller interval allows wireless clients to connect to this device sooner, while a larger interval allows the wireless network to transmit data quicker.") },
				{ "title": _("Fragment Threshold:"), "text": _("threshold of a fragment. The unit is byte.") + _("Fragmenting is a process that divides a frame into several fragments, which are transmitted and acknowledged separately. If the size of a frame exceeds this threshold, the frame is fragmented. In case of a high error rate, you can reduce the threshold to enable this device to resend only the fragments that have not been sent successfully, so as to increase the frame throughput. In an environment with little interference, you can increase the threshold to reduce the number of frames, so as to increase the frame throughput.") + _("frame length threshold for triggering the RTS/CTS mechanism. If a frame exceeds this threshold, the RTS/CTS mechanism is triggered to reduce conflicts. The unit is byte.") + _("Set the RTS threshold based on the actual situation. An excessively small value increases the RTS frame transmission frequency and bandwidth requirement. A higher RTS frame transmission frequency enables a wireless network to recover from conflicts quicker. For a wireless network with high user density, you can reduce this threshold for reducing conflicts.") + _("The RTS mechanism requires some network bandwidth. Therefore, it is triggered only when frames exceed this threshold.") },
				{ "title": _("DTIM Interval:"), "text": _("countdown before this device transmits broadcast and multicast frames in its cache. The unit is Beacon interval. For example, if DTIM Interval is set to 1, this device transmits all cached frames at one Beacon interval.") },
				{ "title": _("LED1/2/3 Signal Indicator Threshold:"), "text": _("used to edit the threshold value determining whether WiFi signal LEDs light up. Corresponding LED will be triggered to light up when the received WiFi signal strength reaches the threshold.") + _("For example, the default threshold of LED1, LED2 and LED3 are -90 dBm, -80 dBm and -70 dBm respectively. If the wireless signal strength received by this device is -63 dBm, all LEDs light up.  If the wireless signal strength received by this device is -73 dBm, only LED1 and LED2 light up. Default value is optimum. Do not change it if unnecessary.") }
			]
		});
	};

	let _getData = function () {
		$.post("goform/getWrlAdvanceInfo", function (res) {
			data = JSON.parse(res);
			cmp.updateComponents(data);
		});
	};

	let _registComponent = function () {
		cmp = $.componentManager({
			"submitUrl": "/goform/setWrlAdvanceInfo",
			"showSubmitBar": true,
			"container": "#adv-wrap",
			"formCfg": {
				"wmmEn": {
					"selectArray": {
						"1": _("启用"),
						"0": _("禁用")
					},
					"defaultValue": "1"
				}, "apsdEn": {
					"selectArray": {
						"1": _("启用"),
						"0": _("禁用")
					},
					"defaultValue": "1"
				}, "sensitivityEn": {
					"selectArray": {
						"1": _("启用"),
						"0": _("禁用")
					},
					"defaultValue": "1",
					"changeCallBack": changeSensitivity
				}, "sensitivity": {
					"css": "form-radio-tail",
					"dataOptions": [{ "type": "num", "args": [-99, -60] }],
					"description": _("dBm（范围：%s~%s, 默认：%s）", ["-99", "-60", "-96"])
				}, "preamble": {
					"selectArray": {
						"short": _("短前导码"),
						"long": _("长前导码")
					},
					"defaultValue": "short"
				}, "tdmaEn": {
					"selectArray": {
						"1": _("启用"),
						"0": _("禁用")
					},
					"defaultValue": "1"
				}, "interference": {
					"selectArray": {
						"1": _("城区"),
						"2": _("郊区")
					},
					"defaultValue": "1"
				}, "penetration": {
					"selectArray": {
						"0": _("高密度"),
						"1": _("高覆盖")
					},
					"defaultValue": "0"
				}, "recieverMode": {
					"selectArray": {
						"0": _("自动"),
						"1": _("级别1"),
						"2": _("级别2"),
						"3": _("级别3"),
						"4": _("级别4"),
						"5": _("级别5"),
						"6": _("级别6")
					},
					"defaultValue": "-76"
				}, "transmission": {
					"description": _("km（范围：%s~%s, 默认：%s）", ["0.1", "20", "3"]),
					"dataOptions": [{ "type": "float", "args": [0.1, 20] }],
					"defaultValue": "3",
					"maxLength": 3
				}, "autoAdjust": {
					"css": "form-input-tail",
					"selectArray": {
						"1": _("自动调节")
					},
					"defaultValue": "1",
					"required": false
				}, "beacon": {
					"description": _("ms（范围：%s~%s, 默认：%s）", ["20", "999", "100"]),
					"dataOptions": [{ "type": "num", "args": [20, 999] }],
					"defaultValue": "100"
				}, "fragment": {
					"description": _("（范围：%s~%s, 默认：%s）", ["256", "2346", "2346"]),
					"dataOptions": [{ "type": "num", "args": [256, 2346] }],
					"defaultValue": "2346"
				}, "rst": {
					"description": _("（范围：%s~%s, 默认：%s）", ["1", "2347", "2346"]),
					"dataOptions": [{ "type": "num", "args": [1, 2347] }],
					"defaultValue": "2346"
				}, "dtim": {
					"description": _("（范围：%s~%s, 默认：%s）", ["1", "255", "1"]),
					"dataOptions": [{ "type": "num", "args": [1, 255] }],
					"defaultValue": "1"
				}, "LED1": {
					"description": _("dBm（范围：%s~%s, 默认：%s）", ["-99", "0", "-90"]),
					"dataOptions": [{ "type": "num", "args": [-99, 0] }],
					"defaultValue": "-90"
				}, "LED2": {
					"description": _("dBm（范围：%s~%s, 默认：%s）", ["-99", "0", "-80"]),
					"dataOptions": [{ "type": "num", "args": [-99, 0] }],
					"defaultValue": "-80"
				}, "LED3": {
					"description": _("dBm（范围：%s~%s, 默认：%s）", ["-99", "0", "-70"]),
					"dataOptions": [{ "type": "num", "args": [-99, 0] }],
					"defaultValue": "-70"
				}
			},
			"beforeSubmit": function (subData) {
				if (G.userType !== 'admin') {
					$.formMessage({
						'message': _('You must log in as an administrator to make any change.'),
						'displayTime': 1500
					});
					return false;
				} 
				if (subData.autoAdjust == "") {
					subData.autoAdjust = "0";
				}
				return subData;
			},
			"afterSubmit": function (data) {
				data = JSON.parse(data);
				if (data.errCode == "0") {
					$.formMessage(_("保存成功"));
				} else if (data.errCode == "-1") {
					$.formMessage(_("保存失败"));
				}
			}
		});

	};

	function changeSensitivity() {
		let val = cmp.getComponent("sensitivityEn").getValue();
		let sensInput = cmp.getComponent("sensitivity");
		if (val === "1") {
			sensInput.show();
		} else {
			sensInput.hide();
		}
	}

}

module.exports = new ModuleLogic();