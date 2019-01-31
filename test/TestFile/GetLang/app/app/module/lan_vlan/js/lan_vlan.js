'use strict';
import $ from 'jquery';
import '../../../common/component/FormList';
import '../../../common/component/FormInput';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
		_initEvent();
	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl":'goform/setVlanConfig',
			    "requestUrl": 'goform/getVlanConfig',
			    "container":'#vlanConfig',
			    "formCfg": {
			       	"vlanEn": {
			       		"dataTitle": _('VLAN设置'),
			       		changeCallBack() {
			       			let cpnt = componentObj.components;
			       			if(this.value) {
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
			       		}
			       	},
			       	"pvid": {
			       		"dataTitle": _('PVID'),
			       		"dataOptions": [{"type": 'num',"args": [1, 4094]}],
			       		"description": _('(范围：1~4094）')
			       	},
			       	"manageVlan": {
			       		"dataTitle": _('管理VLAN'),
			       		"dataOptions": [{"type": 'num',"args": [1, 4094]}],
			       		"description": _('(范围：1~4094）')
			       	},
			       	"wlan": {
			       		"dataTitle": _('WLAN'),
			       		"dataOptions": [{"type": 'num',"args": [1, 4094]}],
			       		"description": _('(范围：1~4094）')
			       	},
			       	"lan": {
			       		"dataTitle": _('LAN'),
			       		"dataOptions": [{"type": 'num',"args": [1, 4094]}],
			       		"description": _('(范围：1~4094）')
			       	}
			    },
		       	beforeSubmit(data) {
		       		if(isSameObj(data, this.orignalData)) {//如果配置没变直接提示保存成功
		       			$.formMessage(_('你的配置未改变'));
		       			return false;
		       		}
		       	},
		       	afterSubmit(res) { 
		       		let data = JSON.parse(res);   
		       		if(data.errCode === '0'){
		           		$.progress({
		           			"msg": _('The system is rebooting,it will take about 2 minutes, please wait…'),
		           			"duration": 120
		           		});
		       		}else {
		           		$.formMessage(_('保存失败'));
		       		}
		       	}
			});
	};

	let _initEvent = function(){
		$('#vlanSubmit').on('click', function() {
			let vlanEn = componentObj.getValue('vlanEn');

			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             	'displayTime': 1500
	         	});
				return false;
			}
					
			if(vlanEn ==='0' && componentObj.orignalData.vlanEn === '0') {
				$.formMessage(_('The VLAN feature is disabled,  please check the settings'));
				return false;
			}else {
       			$.modalDialog({
    				"title": _('提示'),
    				"content": _('Need a reboot to activate configurations.Reboot or not?'),
    				"buttons":[
			                {
			                    "text": _('确定'),
			                    "theme": 'ok',
			                    "autoHide": true,
			                    "callback": function(){
			                       componentObj.submit();
			                    }
			                },
			                {
			                    "text": _('取消')
			                }
			            ]
				});
			}
		});

		//点击取消
		$('#vlanReset').on('click', function() {
			componentObj.reset();
		});
	};

	function isSameObj(obj1, obj2) {
		for(let item in obj2) {
   			if(obj2[item] !== obj1[item]) {
   				return false;
   			}
   		}
   		return true;
	}
}

module.exports = new ModuleLogic();