'use strict';
import $ from 'jquery';
import '../../../common/component/FormMultiInput';
import '../../../common/component/ComponentManage';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
		_initEvent();
	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			"container": '#macClone',
			"submitUrl": 'goform/setMacClone',
			"requestUrl": 'goform/getMacClone',
			"formCfg": {
				"mac": {
					"dataTitle": _('MAC 地址'),
					"inputCfg": [
					    { "maxLength": '2', "required": false, "dataOptions": { "type": 'mac1.all' } },
					    { "maxLength": '2', "required": false, "dataOptions": { "type": 'mac1.specific' } },
					    { "maxLength": '2', "required": false, "dataOptions": { "type": 'mac1.specific' } },
					    { "maxLength": '2', "required": false, "dataOptions": { "type": 'mac1.specific' } },
					    { "maxLength": '2', "required": false, "dataOptions": { "type": 'mac1.specific' } },
					    { "maxLength": '2', "required": false, "dataOptions": { "type": 'mac1.specific' } }
					],
					"autoValidate": false,
					"css": 'mac-wrap',
					"inputCount": 6,
					"joiner": ':',
					changeCallBack() {

					}
				}
			},
			"showSubmitBar": true,
			beforeSubmit(data) {
				if(G.userType !== 'admin') {
					$.formMessage({
						'message': _('You must log in as an administrator to make any change.'),
		             	'displayTime': 1500
		         	});
					return false;
				}
			},
			afterSubmit(res) {
				let data = JSON.parse(res);
				if(data.errCode === '0') {
					$.formMessage(_('保存成功'));
				}else {
					$.formMessage(_('保存失败'));
				}
			}
		});		
	};

	let _initEvent = function(){
		$('#cloneMac').on('click', function() {
			let localMac = componentObj.orignalData.localMac; 
			componentObj.components.mac.setValue(localMac);
		});
		$('#recoverMac').on('click', function() {
			let defaultMac = componentObj.orignalData.defaultMac; 
			componentObj.components.mac.setValue(defaultMac);
		});
	};
}

module.exports = new ModuleLogic();