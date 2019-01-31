'use strict';
import $ from 'jquery';
import '../../../common/component/FormCheckBox';
import '../../../common/component/FormInput';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';

import {checkIpInSameSegment, checkIfLegalIpRange} from '../../../common/libs/common';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
		_initEvent();

	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl":'goform/setDhcpConfig',
			    "requestUrl": 'goform/getDhcpConfig',
			    "container":'#dhcpConfig',
			    "showSubmitBar": true,
			    "formCfg": {
			       	"dhcpEn": {
			       		"dataTitle": _('DHCP 服务器'),
			       		changeCallBack() {
			       			let cpnt = componentObj.components;	
			       			if(!this.value) {
			       				for(let item in cpnt) {
			       					cpnt[item].setIgnore(true).removeValidateText();
			       					cpnt[item].option.autoValidate = false;
			       				}
			       			}else {
			       				for(let item in cpnt) {
			       					cpnt[item].setIgnore(false).removeValidateText();
			       					cpnt[item].option.autoValidate = true;
			       				}
			       			}
			       		}
			       	},
			       	"startIP": {
			       		"dataTitle": _('起始IP地址'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"endIP": {
			       		"dataTitle": _('结束IP地址'),
			       		"dataOptions": [{"type": 'ip.all'}]
			       	},
			       	"mask": {
			       		"dataTitle": _('子网掩码'),
			       		"dataOptions": [{"type": 'mask'}]
			       	},
			       	"gateway": {
			       		"dataTitle": _('网关地址'),
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
			       	"lease": {
			       		"dataTitle": _('租约时间'),
			       		"selectArray": {
			       			'0.5': _('30分钟'),
			       			'1.0': _('1小时'),
			       			'6.0': _('6小时'),
			       			'12.0': _('12小时'),
			       			'24.0': _('一天'),
			       			'72.0': _('3天'),
			       			'168.0': _('一周')
			       		},
			       		"changeCallBack": function() {

			       		}
			       	}
			    },
			    beforeUpdate(data) {
			           return data;
		       	},
		       	updateCallback() {
		           
		       	},
		       	beforeSubmit() {
		       		let lanIP = this.orignalData.lanIP,
		       			lanMask = this.orignalData.lanMask,
		       			startIP = this.getValue('startIP'),
		       			endIP = this.getValue('endIP'),
		       			mask = this.getValue('mask'),
		       			gateway = this.getValue('gateway'),
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

		       		if(this.getValue('dhcpEn') === '1') {
			       		//起始IP地址必须和LAN口IP在同一网段
			       		msg = checkIpInSameSegment(lanIP, lanMask, startIP, mask);
			       		if(!msg) {
			       			$.formMessage({
			       				"message": _('起始IP地址必须和LAN口IP在同一网段'),
	                        	"displayTime": 2000
			       			});
			       			this.getComponent('startIP').focus();
			       			return false;
			       		}
			       		//结束IP地址必须和起始IP地址在同一网段
			       		msg = checkIpInSameSegment(startIP, mask, endIP, mask);
			       		if(!msg) {
			       			$.formMessage({
			       				"message": _('结束IP地址必须和起始IP地址在同一网段'),
	                        	"displayTime": 2000
			       			});
			       			this.getComponent('endIP').focus();
			       			return false;
			       		}
			       		//结束IP地址必须大于起始IP地址
			       		msg = checkIfLegalIpRange(startIP, endIP);
			       		if(!msg) {
			       			$.formMessage({
			       				"message": _('结束IP地址必须大于起始IP地址'),
	                        	"displayTime": 2000
			       			});
			       			this.getComponent('endIP').focus();
			       			return false;
			       		}

			       		//dhcp mask必须大于lan mask
			       		if(mask < this.orignalData.lanMask) {
			       			this.getComponent('mask').focus();
			       			$.formMessage(_("The network ID bits of this subnet mask must be equal to or longer than the network ID bits in the LAN port subnet mask."));
			       			return false;
			       		}

			       		//网关地址必须和LAN IP在同一网段
			       		msg = checkIpInSameSegment(lanIP, mask, gateway, mask);
			       		if(!msg) {
			       			this.getComponent('gateway').focus();
			       			$.formMessage(_("Default gateway and LAN IP %s must be  on the same network segment!", [lanIP]));
			       			return false;
			       		}

			       		//DNS不能相等
			       		if(preDNS === altDNS) {
			       			this.getComponent('altDNS');
			       			$.formMessage(_("Preferred DNS server and alternate DNS server can't be the same."));	
			       			return false;
			       		}
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