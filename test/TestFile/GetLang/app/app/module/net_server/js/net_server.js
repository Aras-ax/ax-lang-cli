'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/FormCheckBox';
import '../../../common/component/FormRadioList';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';
import '../../../common/component/FormCheckList';

function ModuleLogic() {
	let componentObj = {};//保存componentManager

	let ddnsCpnt = {};

	let remoteCpnt = {};

	let timeRebootCpnt ={};

	let SNMPcpnt = {};

	let pingWatchCpnt = {};

	this.init = function(){
		_registComponent();
		_storeCpnt();
		_initEvent();
		_callMacro();
	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl": 'goform/setNetworkService',
			    "requestUrl": 'goform/getNetworkService',
			    "container": '#netService',
			    "showSubmitBar": true,
			    "formCfg": {
			       	"ddnsEn": {//DDNS
			       		"dataTitle": _('动态DNS'),
			       		changeCallBack() {
							_toggleCpntValidable.call(this, ddnsCpnt);
						}
			       	},
			       	"ddnsP": {//DNS服务提供商
			       		"dataTitle": _('服务提供商'),
			       		"selectArray":{
			       			'dyn.com': 'Dyndns',
			       			'no-ip.com': 'No-ip.com',
			       			'pubyun.com': '3322.org'
			       		},
						changeCallBack(){
							$('.goRegist').attr('href', `http://www.${this.value}`);
						},
						"description": '<a class="goRegist" target="_blank" href="http://www.dyndns.com">' + _('去注册') + '</a>'
			       	},
			       	"username": {//DNS用户名
			       		"dataTitle": _('用户名'),
			       		"dataOptions": [{"type": 'pwd'}]
			       	},
			       	"password": {//DNS密码
			       		"dataTitle": _('密码'),
			       		"dataOptions": [{"type": 'pwd'}]
			       	},
			       	"domain": {//DNS域名
			       		"dataTitle": _('域名'),
			       		"dataOptions": [{"type": 'domainName'}]

			       	},
			       	"remoteEn": {	//远程web管理
			       		"dataTitle": _('远程web管理'),
			       		changeCallBack() {
			       			_toggleCpntValidable.call(this, remoteCpnt);
			       		}
			       	},
			       	"remoteIPtype": {	//IP地址
			       		"dataTitle": _('IP地址'),
			       		"selectArray": {
			       			'all': _('全部IP地址'),
			       			'manual': _('手动设置')
			       		},
			       		"dataOptions":[{"type":'ip'}],
						changeCallBack() {
							if(this.value === 'all') {
								componentObj.components.remoteIp.hide();
							}else {
								componentObj.components.remoteIp.show();
							}
						}
			       	},
			       	"remoteIp": {	//远程IP地址
			       		"dataTitle": _('输入IP地址'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},	
			       	"remotePort": {	//远程端口
			       		"dataTitle": _('端口'),
			       		"dataOptions": [{"type": 'num', "args": [1,65535]}]
			       	},
			       	"timeRebootEn": {	//定时重启
			       		"dataTitle": _('定时重启'),
			       		changeCallBack() {
			       			_toggleCpntValidable.call(this, timeRebootCpnt);
			       		}

			       	},
			       	"rebootTime": {	//重启时间
			       		"dataTitle": _('时间'),
			       		"dataOptions": [{"type": 'clockTime'}]
			       	},
			       	"week": {	//日期
			       		"dataTitle": _('日期'),
			       		"selectArray": {
			       			'1': _('星期一'), 
			       			'2': _('星期二'),
			       			'3': _('星期三'), 
			       			'4': _('星期四'),
			       			'5': _('星期五'),
			       			'6': _('星期六'),
			       			'7': _('星期日'),
			       			'8': _('每天')
			       		}

			       	},
			       	"webTimeout": {	//web闲置超时时间
			       		"dataTitle": _('web闲置超时时间'),
			       		"defaultValue": 5,
			       		"dataOptions": [{"type": 'num',"args": [1,60]}]
			       	},
			       	"snmpEn": {	//snmp
			       		"dataTitle": _('SNMP代理'),
			       		changeCallBack() {
			       			_toggleCpntValidable.call(this, SNMPcpnt);
			       		}

			       	},
			       	"deviceName": {	//设备名称
			       		"dataTitle": _('设备名称'),
			       		"dataOptions": [{"type": 'ssid'}]
			       	},
			       	"Rcommunity": {	//读社区
			       		"dataTitle": _('读Community'),
			       		"dataOptions": [{"type": 'ssid'}]
			       	},
			       	"RWcommunity": {	//读写社区
			       		"dataTitle": _('读/写Community'),
			       		"dataOptions": [{"type": 'ssid'}]
			       	},
			       	"location": {	//位置
			       		"dataTitle": _('位置'),
			       		"dataOptions": [{"type": 'ssid'}]
			       	},
			       	"pingWatchDogEn": {	//ping看门狗
			       		"dataTitle": _('Ping看门狗'),
			       		changeCallBack() {
			       			_toggleCpntValidable.call(this, pingWatchCpnt);
			       		}
			       	},
			       	"pingIp": {
			       		"dataTitle": _('IP地址'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"pingInterval": {	//ping间隔
			       		"dataTitle": _('Ping间隔'),
			       		"defaultValue": 300,
			       		"dataOptions": [{"type": 'num',"args": [20,86400]}]
			       	},
			       	"startDelay": {	//启动延迟
			       		"dataTitle": _('启动延迟'),
			       		"defaultValue": 300,
			       		"dataOptions": [{"type": 'num',"args": [180,86400]}]
			       	},
			       	"packetsNum": {	//丢包个数
			       		"dataTitle": _('触发重启丢包个数'),
			       		"dataOptions": [{"type": 'num',"args": [1,100]}]
			       	},
			       	"DMZEn": {	//DMZ主机
			       		"dataTitle": _('DMZ主机'),
			       		changeCallBack() {
			       			if(this.value){
			       				componentObj.components.DMZIp.show();
			       			}else {
			       				componentObj.components.DMZIp.hide();
			       			}
			       		}
			       	},
			       	"DMZIp": {	//DMZ主机IP
			       		"dataTitle": _('DMZ主机IP地址'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"telnetEn": {	//telnet
			       		"dataTitle": _('Telnet服务')
			       	},
			       	"upnpEn": {
			       		"dataTitle": _('UPnP')
			       	},
			       	"watchDogEn": {	//硬件看门狗
			       		"dataTitle": _('硬件看门狗')
			       	}

			    },
			    beforeSubmit(data) {
	    			if(G.userType !== 'admin') {
	    				$.formMessage({
	    					'message': _('You must log in as an administrator to make any change.'),
	    	             	'displayTime': 1500
	    	         	});
	    				return false;
	    			}
			    },
		       	afterSubmit(data) { 
		       		let res = JSON.parse(data);   
		       		if(res.errCode === '0'){
		           		$.formMessage(_('保存成功'));
		       		}else {
		           		$.formMessage(_('保存失败'));
		       		}
		       	}
			});
	};

	let _initEvent = function(){
		//点击时间
		$('#week').on('click', 'label', function() {
			let elem = $(this).find('input'),
				oDate = elem.attr('id'),
				originVal = componentObj.getValue('week'),
				cpntWeek = componentObj.getComponent('week');

			if(oDate === 'week8') {
				if(elem[0].checked) {
					cpntWeek.setValue('1;2;3;4;5;6;7;8');
				}else {
					cpntWeek.setValue('');
				}
			}else {
				if(originVal === '1;2;3;4;5;6;7') {
					cpntWeek.setValue('1;2;3;4;5;6;7;8');
				}else {
					if(originVal.indexOf('8') > -1) {
						cpntWeek.setValue(originVal.replace(/;8/, ''));
					}
				}
			}

		});
	
	};

	let _callMacro = function() {	//调用宏控
		if(G.workMode === 'wisp' || G.workMode === 'router') {
			$('.dmz, .remote-ip, .ddns').addClass('none');
		}else {
			$('.dmz, .remote-ip, .ddns').removeClass('none');
		} 
	};

	let _storeCpnt = function() {

		ddnsCpnt = {	//保存ddns功能组件
			"username" : componentObj.components.username,
			"password": componentObj.components.password,
			"domain": componentObj.components.domain
		};

		remoteCpnt = {	//保存远程web管理组件
			"remoteIp" : componentObj.components.remoteIp,
			"remotePort": componentObj.components.remotePort
		};

		timeRebootCpnt = {	//保存定时重启组件
			"rebootTime": componentObj.components.rebootTime,
			"week": componentObj.components.week
		};

		SNMPcpnt = {	//保存SNMP功能组件
			"deviceName": componentObj.components.deviceName,
			"Rcommunity": componentObj.components.Rcommunity,
			"RWcommunity": componentObj.components.RWcommunity,
			"location": componentObj.components.location
		};

		pingWatchCpnt = {	//保存ping看门狗组件
			"pingIp": componentObj.components.pingIp,
			"pingInterval": componentObj.components.pingInterval,
			"startDelay": componentObj.components.startDelay,
			"packetsNum": componentObj.components.packetsNum
		};
	};

	//切换组件可验证性
	let _toggleCpntValidable = function(cpnt) {
		if(this.value) {	//开启功能则验证功能对应配置
			for(let item in cpnt) {
				cpnt[item].setIgnore(false).removeValidateText();
				cpnt[item].option.autoValidate = true;
			}
		}else {
			for(let item in cpnt) {
				cpnt[item].setIgnore(true).removeValidateText();
				cpnt[item].option.autoValidate = false;
			}
		}
	};
}

module.exports = new ModuleLogic();