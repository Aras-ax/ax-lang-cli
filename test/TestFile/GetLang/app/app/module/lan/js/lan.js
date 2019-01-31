'use strict';
import $ from 'jquery';
import '../../../common/component/FormList';
import '../../../common/component/FormInput';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';

import {checkIsVoildIpMask, checkIpInSameSegment} from '../../../common/libs/common';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
		_initEvent();

	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl":'goform/setLanConfig',
			    "requestUrl": 'goform/getLanConfig',
			    "container":'#lanConfig',
			    "showSubmitBar":true,
			    "formCfg": {
			       	"mac": {
			       		"dataTitle": _('MAC地址')
			       	},
			       	"lanType": {
			       		"dataTitle": _('IP获取方式'),
			       		"selectArray": {
			       			'dhcp': _('DHCP动态获取'),
			       			'static': _('静态IP')
			       		},
			       		changeCallBack() {
			       			let cpnt = componentObj.components;
			       			if(this.value === 'dhcp') {
			       				for(let item in cpnt) {
			       					if(item !== 'mac' && item !== 'lanType' && item !== 'deviceName') {
			       						cpnt[item].setEditable(false);
			       					}
			       				}
			       			}else {
			       				for(let item in cpnt) {
			       					cpnt[item].setEditable(true);
			       				}
			       			}
			       		}
			       	},
			       	"ip": {
			       		"dataTitle": _('IP地址'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"mask": {
			       		"dataTitle": _('子网掩码'),
			       		"dataOptions": [{"type": 'mask'}]
			       	},
			       	"gateway": {
			       		"dataTitle": _('默认网关'),
			       		"dataOptions": [{"type": 'gateWay'}]
			       	},
			       	"preDNS": {
			       		"dataTitle": _('首选DNS服务器'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"altDNS": {
			       		"dataTitle": _('备用DNS服务器'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"deviceName": {
			       		"dataTitle": _('设备名称'),
			       		"dataOptions": [{"type": 'ssid'}]
			       	}
			    },
			    "showSubmitbar": true,
		       	beforeSubmit() {
		       		let isStatic = this.getValue('lanType') === 'static',
		       			lanIP = this.getValue('ip'),
		       			gateway = this.getValue('gateway'),
		       			mask = this.getValue('mask'),
		       			preDNS = this.getValue('preDNS'),
		       			altDNS = this.getValue('altDNS'),
		       			msg = '';
		       			
		    		if(G.userType !== 'admin') {
		    			$.formMessage({
		    				'message': _('You must log in as an administrator to make any change.'),
		                 	'displayTime': 1500
		             	});
		    			return false;
		    		}

		       		if(isStatic) {

		       			if(!checkIpInSameSegment(lanIP, mask, gateway, mask)) {
		       				this.getComponent('gateway').focus();
		       				$.formMessage("Gateway and the IP address must be on the same network segment.");
		       				return false;	
		       			}

		       			if(preDNS === lanIP || altDNS === lanIP) {
		       				this.getComponent('ip').focus();
		       				$.formMessage("Preferred DNS server and alternate DNS server can't be the same with IP address.");
		       				return false;
		       			}

		       			if(preDNS && preDNS === altDNS) {
		       				this.getComponent('altDNS').focus();
		       				$.formMessage("Preferred DNS server and alternate DNS server can't be the same.");
		       				return false;
		       			}
		       			//无线WAN模式下，LAN IP不能与wan ip同网段todo
		       		} 
		       	},
		       	afterSubmit(res) { 
		       		let data = JSON.parse(res);   
		       		if(data.errCode === '0'){
		           		$.formMessage(_('保存成功'));
		       		}else {
		           		$.formMessage(_('保存失败'));
		       		}
		       	}
			});
	};

	let _initEvent = function(){
	};
}

module.exports = new ModuleLogic();