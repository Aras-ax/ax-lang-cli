'use strict';
import $ from 'jquery';
import '../../../common/component/FormList.js';
import '../../../common/component/FormTab.js';
import '../../../common/component/FormTable.js';
import '../../../common/component/FormHelpText.js';

function ModuleLogic(argument) {
	var that = this,
		sysStatusCmp,
		sysTabCmp,
		wlanChart,
		lanChart,
		tableCmp = {
			"1": null,
			"2": null,
			"3": null,
			"4": null,
			"5": null
		},
		befTab = "1",
		timer,
		statusTimer,
		url = {
			"sysStatusUrl": "/goform/getSysStatusInfo",
			"1": "goform/getStaticsInfo",
			"2": "goform/getClientList",
			"3": "goform/getInterfaceInfo",
			"4": "goform/getArpTableList",
			"5": "goform/getRouterTableList"
		};
	//有些数据后台传过来的不是我们想展示的，做一下转换
	var worModeMap = {
		"ap": _("AP模式"),
		"station": _("客户端模式"),
		"universalrepeater": _("万能中继模式"),
		"wisp": _("无线WAN模式"),
		"repeater": _("中继模式"),
		"p2mp": _("P2MP模式"),
		"router": _("路由模式")
	}, secTypeMap = {
		"none": _("不加密"),
		"wep": _("WEP"),
		"wpa-psk": _("WPA"),
		"wpa2-psk": _("WPA2-PSK"),
		"mixed wpa/wpa2-psk": _("Mixed WPA/WPA2-PSK")
	}, wanStatusMap = {
		"0": _("未连接"),
		"1": _("连接中"),
		"2": _("已连接")
	}, wanTypeMap = {
		"dhcp": _("DHCP(自动获取)"),
		"pppoe": _("PPPoE"),
		"static": _("静态接入")
	}, speedMap = {
		"0": _("未连接"),
		"1": _("已连接"),
		"-10": _("10M半双工"),
		"10": _("10M全双工"),
		"-100": _("100M半双工"),
		"100": _("100M全双工")
	}, hideMap = [".data-field-wanIp", ".data-field-wanGw", ".data-field-wanDns1", ".data-field-wanDns2", ".data-field-wanStatus", ".data-field-wanType"];

	//两个表格的数据
	var wlanData = [{
		"name": "RX",
		"data": new Array(10)
	}, {
		"name": "TX",
		"data": new Array(10)
	}
	], lanData = [
		{
			"name": "RX",
			"data": new Array(10)
		},
		{
			"name": "TX",
			"data": new Array(10)
		}
	];
	//假数据  渲染组件时需要这些
	var tpData = {
		"sysStatus": {
			"runTime": null, //运行时间，单位s1
			"devName": null,//设备名称
			"fireversion": null, //软件版本
			"sysTime": null,  //系统时间
			"hwVersion": null,     //硬件版本
			"lanIp": null,     //Lan口IP
			"lanMac": null,   //LAN Mac
			"lan1Mac": null,   //LAN1 Mac
			"lanSpeed": null,              //LAN口速率
			"wrlMac": null,   //WLAN Mac
			"wanStatus": null,
			"wanType": null,
			"wanIp": null,
			"wanGw": null,
			"wanDns1": null,
			"wanDns2": null,
			"devMode": null,
			"devDist": null
		},
		"wrlStatus": {
			"workMode": null,
			"wifiEn": null,
			"txLink": null,
			"channelBand": null,
			"wrlClient": null,
			"ssid": null,
			"secType": null,
			"encryptType": null,
			"connStatus": null,
			"remoteApMac": null,
			"txSpeed": null,
			"signal": null,
			"noise": null
		}
	};

	this.init = function () {
		this.moduleTimer = {};
		befTab = "1";
		_initHelpText();
		_registerComponents();
		_initEvent();
		_getData();
	};

	let _initHelpText = function () {
		$("#status-help-text").FormHelpText({
			"text": [
				{"title":_("系统状态")},
				{ "title": _("Device Name:"), "text": _("name of this device. If this device is not the only one of its kind in the network, this name helps you identify the device.") + _("You can change the name of this device on the Network > LAN Setup page.") },
				{ "title": _("Uptime:"), "text": _("time during which this device is operating.") },
				{ "title": _("System Time:"), "text": _("current system time of this device.") + _("Format of system time: YYYY-MM-DD hh:mm:ss.") },
				{ "title": _("Firmware Version:"), "text": _("system software version number of this device.") },
				{ "title": _("Hardware Version:"), "text": _("hardware version of this device.") },
				{ "title": _("Connection Status:"), "text": _("connection status of WAN port of this device in WISP  or Router mode.") },
				{ "title": _("Internet Connection Type:"), "text": _("internet connection type of this device in WISP or Router mode.") },
				{ "title": _("LAN MAC Address:"), "text": _("MAC address of LAN port of this device.") },
				{ "title": _("WLAN MAC Address:"), "text": _("MAC address of the wireless network of this device.") },
				{ "title": _("PoE LAN/LAN Speed:"), "text": _("connection status of PoE LAN/LAN port. It includes connection rate and duplex mode.") },
				{ "title": _("LAN IP Address:"), "text": _("IP address (also called management IP address) of this device. By default, it is 192.168.2.1. You can access the web UI of this device using this IP address.") },
				{ "title": _("WAN IP Address:"), "text": _("IP address of WAN port of this device in WISP or Router mode.") },
				{ "title": _("Default Gateway:"), "text": _("default gateway IP address of this device in WISP or Router mode.") },
				{ "title": _("Primary DNS Server:"), "text": _("IP address of primary DNS server of this device in WISP or Router mode.") },
				{ "title": _("Secondary DNS Server:"), "text": _("IP address of secondary DNS server of this device in WISP or Router mode.") },
				{"title":_("无线状态")},
				{ "title": _("Working Mode:"), "text": _("working mode the device operates.") },
				{ "title": _("SSID:"), "text": _("wireless network name of this device.") },
				{ "title": _("Security Mode:"), "text": _("security mode of the wireless network of this device.") },
				{ "title": _("Channel/Radio Band:"), "text": _("channel and radio band used by this device to transmit radio signals.") },
				{ "title": _("No. of Wireless Client:"), "text": _("number of wireless clients connected to this device.") },
				{ "title": _("MAC Address of Peer AP:"), "text": _("it displays \"No Peer AP\" if the device works in AP or Router mode. And in other modes, it displays the MAC address of peer AP that this device bridged.") },
				{ "title": _("Signal Strength:"), "text": _("it displays the signal strength of the first device connected to the wireless network of the device when it works in AP or Router mode.") + _("it displays the received signal strength from peer AP when the device works in Client, Universal Repeater, WISP, Repeater or P2MP mode.") },
				{ "title": _("Background Noise:"), "text": _("strength of radio interference signals in the ambient environment that interfere with the channel of this device. Larger absolute number indicates less interference.") },
				{ "title": _("TX/RX Link:"), "text": _("number of spatial streams the device is transmitting or receiving.") },
				{ "title": _("Transmit/Receive Rate:"), "text": _("transmit/receive rate of the first device connected to the wireless network of this device when it works in AP or Router mode.") + _("transmit/receive rate of the device in Client, Universal Repeater, WISP, Repeater, or P2MP mode.") },
				{"title":_("统计")},
				{ "title": _("Throughput:"), "text": _("data throughput of the device through LAN ports or WLAN.") },
				{ "title": _("Peer AP:"), "text": _("Information of current APs connected to this device when the device works in Client, Universal Repeater, or WISP mode.") },
				{ "title": _("Wireless Client:"), "text": _("Information of current wireless clients connected to this device when the device works in AP, Repeater, P2MP or Router mode.") },
				{ "title": _("Interface:"), "text": _("IP address, MAC address and throughput information of device's interfaces.") },
				{ "title": _("ARP Table:"), "text": _("the current ARP table of this device.") },
				{ "title": _("Routing Table:"), "text": _("routing information of this device.") }
			]
		});
	};

	let _registerComponents = function () {
		let forData = {
			"css": "formlist-wrap",
			"dataObj": tpData,
			"titleObj": [
				{
					"field": "sysStatus",
					"title": _("系统状态"),
					"items": [
						{
							"field": "devName", "title": _("设备名称")
						},
						{
							"field": "lanMac", "title": _("LAN MAC")
						},
						{
							"field": "runTime", "title": _("运行时间")
						},
						{
							"field": "wrlMac", "title": _("WLAN MAC")
						},
						{
							"field": "sysTime", "title": _("系统时间")
						},
						{
							"field": "lanSpeed", "title": _("Poe LAN/LAN口速率")
						},
						{
							"field": "fireversion", "title": _("软件版本")
						},
						{
							"field": "lanIp", "title": _("LAN IP")
						},
						{
							"field": "hwVersion", "title": _("硬件版本")
						},
						{
							"field": "wanIp", "title": _("WAN IP")
						},
						// { to show 这个版本没有距离
						// 	field: "devDist", title: _("距离")
						// },
						{
							"field": "wanGw", "title": _("默认网关")
						},
						{
							"field": "wanStatus", "title": _("连接状态")
						},
						{
							"field": "wanDns1", "title": _("首选DNS服务器")
						},
						{
							"field": "wanType", "title": _("联网方式")
						},
						{
							"field": "wanDns2", "title": _("备用DNS服务器")
						}
					]
				}, {
					"field": "wrlStatus",
					"title": _("无线状态"),
					"items": [
						{
							"field": "workMode", "title": _("工作模式")
						}, {
							"field": "remoteApMac", "title": _("上级AP的MAC")
						}, {
							"field": "ssid", "title": _("SSID")
						}, {
							"field": "signal", "title": _("信号强度")
						}, {
							"field": "secType", "title": _("安全模式")
						}, {
							"field": "noise", "title": _("背景噪声")
						}, {
							"field": "channelBand", "title": _("信道/频段")
						}, {
							"field": "txLink", "title": _("TX/RX链路")
						}, {
							"field": "wrlClient", "title": _("无线客户端个数")
						}, {
							"field": "txSpeed", "title": _("发送/接收速率")
						}
					]
				}
			]
		};
		sysStatusCmp = $("#systemStatus").FormList(forData);
		sysTabCmp = $("#statusTab").Rcomponent({
			"selectArray": {
				"1": _("吞吐量"),
				"2": _("无线客户端"),
				"3": _("接口"),
				"4": _("ARP表"),
				"5": _("静态路由表")
			},
			"theme": "bg-theme",
			"defaultValue": 1, //默认选中的按钮项
			"changeCallBack": function () {
				let index = this.value;
				//点击的还是原来的tab时不做处理
				if (befTab == index) {
					return;
				} else {
					//隐藏上一个tab的内容
					$("#tab" + befTab).addClass("none");
					befTab = index;
				}

				if (index == "1") {//吞吐量信息为图表
					clearTimeout(timer);
					$.post(url[index], (res) => {
						drawGrid(res);
					});
				} else {//其余为表格
					//清除之前的timer
					clearTimeout(timer);
					$.post(url[index], function (res) {
						res = JSON.parse(res).list;
						tableCmp[index].reLoad(res);
						timer = setTimeout(function () {
							getTableData(index);
						}, 5000);

						//把timer放入moduleTimer里以便切换菜单时清除所有timer
						that.moduleTimer.statusTableTimer = timer;
					});

				}

				$("#tab" + index).removeClass("none");

			},
			"renderedCallBack": function () {
				$.post(url["1"], (res) => {
					drawGrid(res);
				});
			}

		});

		//统计信息表格组件
		//无线客户端表格
		tableCmp["2"] = $("#statusTable2").TablePage({
			"columns": [
				{ "title": _("IP地址"), "field": "ip" },
				{ "title": _("MAC地址"), "field": "mac" },
				{ "title": _("信号/噪声"), "field": "sign" },
				{ "title": _("发送/接收"), "field": "tx" },
				{ "title": _("CCQ"), "field": "cqq" },
				{ "title": _("连接时间"), "field": "connectTime", "format": function (data) { return timeToDate(data); } }
			], "showStyle": 2
		});
		//接口表格
		tableCmp["3"] = $("#statusTable3").TablePage({
			"columns": [
				{ "title": _("接口"), "field": "interface" },
				{ "title": _("IP地址"), "field": "ip" },
				{ "title": _("MAC地址"), "field": "mac" },
				{ "title": _("接收数据包"), "field": "rx" },
				{ "title": _("接收错误"), "field": "rxErr" },
				{ "title": _("发送数据包"), "field": "tx" },
				{ "title": _("发送错误"), "field": "txErr" }
			], "showStyle": 2
		});
		//ARP表
		tableCmp["4"] = $("#statusTable4").TablePage({
			"columns": [
				{ "title": _("IP地址"), "field": "ip" },
				{ "title": _("MAC地址"), "field": "mac" },
				{ "title": _("接口"), "field": "interface" }
			], "showStyle": 2
		});
		//路由表
		tableCmp["5"] = $("#statusTable5").TablePage({
			"columns": [
				{ "title": _("目标网络"), "field": "ip" },
				{ "title": _("子网掩码"), "field": "mask" },
				{ "title": _("下一跳"), "field": "next" },
				{ "title": _("接口"), "field": "interface" }
			], "showStyle": 2
		});
		//highcharts折线图基础配置
		let baseCfg = {
			"colors": ["#ff6600", "#7ed321"],
			"height": 400,
			"credits": { //屏蔽版权信息
				"enabled": false
			}, "legend": {//标题位置
				"layout": 'vertical',
				"align": 'center',
				"verticalAlign": 'top'
			},
			"yAxis": {
				"label": {
					"align": "left",
					"Enabled": true,
				},
				"min": 0,
				"minRange": 1,
				"lineColor": "#ccc",
				"title": {
					"text": null
				},
				"showFirstLabel": false
			},
			"xAxis": {
				"labels": true,
				"step": 1,
				"lineColor": "#ccc",
				"lineWidth": 0,
				"showFirstLabel": false,
				"type": "linear"
			},
			"plotOptions": {
				"series": {
					"label": {
						"connectorAllowed": false
					},
					"pointStart": 0,
					"lineWidth": 1
				}
			},
			"tooltip": {
				"shared": true,
				"useHTML": true,
				"headerFormat": '<table>',
				"pointFormat": '<tr><td style="color: {series.color}">{series.name}: </td>' +
				'<td style="text-align: right"><b> {point.y}/Kbps</b></td></tr>',
				"footerFormat": '</table>',
				"valueDecimals": 2,
				"crosshairs": [true, true]  // 同时启用竖直及水平准星线
			}
		};

		wlanChart = $.extend({ "series": [{ "name": 'TX', "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, { "name": 'RX', "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }], "title": { "text": "WLAN", "align": "left", "verticalAlign": "top" } }, baseCfg);
		lanChart = $.extend({ "series": [{ "name": 'TX', "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, { "name": 'RX', "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }], "title": { "text": "LAN", "align": "left", "verticalAlign": "top" } }, baseCfg);
	};

	/**
	 * 更新折线图数据
	 * 绘制折线图
	 * 更新定时器
	 * @param {*折线图图表数据} res 
	 */
	function drawGrid(res) {
		let data = JSON.parse(res);
		wlanChart.series[0].data.shift();//移除数组最左边的，保证只显示10个数据
		wlanChart.series[0].data.push(parseFloat(data.wireless.rx));//再向末尾添加数据
		wlanChart.series[1].data.shift();
		wlanChart.series[1].data.push(parseFloat(data.wireless.tx));
		lanChart.series[0].data.shift();
		lanChart.series[0].data.push(parseFloat(data.lan.rx));
		lanChart.series[1].data.shift();
		lanChart.series[1].data.push(parseFloat(data.lan.tx));

		let wlan = Highcharts.chart('chart1', wlanChart);
		let lan = Highcharts.chart('chart2', lanChart);

		timer = setTimeout(function () {
			$.post(url["1"], (res) => {
				drawGrid(res);
			});
		}, 5000);
		that.moduleTimer.statusTableTimer = timer;
	}

	let _initEvent = function () {

	};

	let _getData = function () {

		$.post(url.sysStatusUrl, (res) => {
			let data = JSON.parse(res);
			sysStatusCmp.reload(formatData(data));
			//如果不是wisp模式或者路由模式   
			//WAN IP地址  WAN口网关 首选DNS服务器 备用DNS服务器 连接状态 联网方式 都不要显示
			for (var i = 0; i < hideMap.length; i++) {
				if (!(data.wrlStatus.workMode == "wisp" || data.wrlStatus.workMode == "router")) {
					$(hideMap[i]).addClass("none");
				} else {
					$(hideMap[i]).removeClass("none");
				}
			}
			statusTimer = setTimeout(function () {
				_getData();
			}, 5000);
			that.moduleTimer.statusTimer = statusTimer;
		});
	};

	/**
	 * 有些数据格式不是我们想要的，需要做一下转换
	 * @param {*格式化之前的数据} befData 
	 * @return {*格式化之后的数据} afterData
	 */
	function formatData(befData) {
		let afterData = {};
		let sysData = $.extend({}, befData.sysStatus);
		let wrlData = $.extend({}, befData.wrlStatus);

		//转换系统状态数据
		//把时间由s转换为时分秒
		let time = parseInt(sysData.runTime);
		sysData.runTime = timeToDate(time);
		//把LAN口速率转换为中文	
		sysData.lanSpeed = speedMap[befData.sysStatus.lanSpeed.split("/")[0]] + "/" + speedMap[befData.sysStatus.lanSpeed.split("/")[1]];
		//把接入状态转换成中文
		sysData.wanStatus = wanStatusMap[befData.sysStatus.wanStatus];



		//把接入方式转换成中文
		sysData.wanType = befData.sysStatus.wanType;
		//转换无线状态数据
		wrlData.workMode = worModeMap[wrlData.workMode];//翻译
		wrlData.secType = secTypeMap[wrlData.secType];

		if (wrlData.signal != "N/A") {
			//把两个数据转换成有图行长度的显示
			wrlData.signal = '<span style="width: 100px;height: 10px;background: #fff;border: 1px solid #ccc;margin-top: 5px;display:inline-block;">' +
				'<div id="signalLength" style="height: 10px;background: skyblue;width:' + (99 + parseInt(wrlData.signal, 10)) + 'px"> </div> </span>' + '<span id="signal"> ' + wrlData.signal + 'dBm</span>';
		}
		if (wrlData.noise != "N/A") {
			wrlData.noise = '<span style="width: 100px;height: 10px;background: #fff;border: 1px solid #ccc;margin-top: 5px;display:inline-block;">' +
				'<div id="signalLength" style="height: 10px;background: skyblue;width:' + (99 + parseInt(wrlData.noise, 10)) + 'px"> </div> </span>' + '<span id="signal"> ' + wrlData.noise + 'dBm</span>';
		}
		if (wrlData.channelBand != "N/A") {
			//信道加上频段
			wrlData.channelBand = wrlData.channelBand + "/" + (parseInt(wrlData.channelBand) * 5 + 2407).toString();
		}

		afterData.sysStatus = sysData;
		afterData.wrlStatus = wrlData;
		return afterData;
	}

	/**
	 * 获取统计信息里的表格数据
	 * @param {*表示第几个表格} index 
	 */
	function getTableData(index) {
		$.post(url[index], function (res) {
			res = JSON.parse(res).list;
			tableCmp[index].reLoad(res);
			timer = setTimeout(function () {
				getTableData(index);
			}, 5000);
			that.moduleTimer.statusTableTimer = timer;
		});
	}

	/**
	 * 将秒转换成x天x小时x分x秒的格式
	 * @param {*时间  单位s} time 
	 */
	function timeToDate(time) {
		let date = "";
		time = parseInt(time);
		date += Math.floor(time / 86400) > 0 ? Math.floor(time / 86400) + _("天") : "";
		date += Math.floor(time / 3600 % 24) > 0 ? Math.floor(time / 3600 % 24) + _("小时") : "";
		date += Math.floor(time / 60 % 60) > 0 ? Math.floor(time / 60 % 60) + _("分") : "";
		date += Math.floor(time % 60) + _("秒");
		return date;
	}
}

module.exports = new ModuleLogic();