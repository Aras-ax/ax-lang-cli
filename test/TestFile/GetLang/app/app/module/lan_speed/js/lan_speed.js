'use strict';
import $ from 'jquery';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
		_initEvent();
		_getValue();
	};

	let _getValue = function(){
		$.get('goform/getLanRate', function(data){
			var data = JSON.parse(data);
			componentObj.updateComponents(data);
		});
	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl":'goform/setLanRate',
			    "container":'#lanSpeed',
			    "showSubmitBar":true,
			    "formCfg":{
			        "poeRate":{
			        		"dataTitle":_('PoE/LAN口速率'),
			        		"selectArray":{
			        			'0': _('自动协商'), 
			        			'100': _('100Mbps全双工'), 
			        			'10': _('10Mbps全双工'),
			        			'-100': _('100Mbps半双工'), 
			        			'-10': _('10Mbps半双工')
			        		},
			        		"defaultValue": '100'
			        	},
			        "lanRate":{
			        		"dataTitle":_('LAN口速率'),
			        		"selectArray":{
			        			'0': _('自动协商'), 
			        			'100': _('100Mbps全双工'), 
			        			'-100': _('100Mbps半双工'), 
			        			'10': _('10Mbps全双工'), 
			        			'-10': _('10Mbps半双工')
			        		},
			        		"defaultValue": '-10'
			        	}
			    },
			    beforeUpdate(data) {
			           return data;
		       	},
		       	updateCallback() {
		           
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
		       		let res = JSON.parse(res);   
		       		if(res.errCode === '0'){
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