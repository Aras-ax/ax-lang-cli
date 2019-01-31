'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/FormCheckBox';
import '../../../common/component/ComponentManage';

function ModuleLogic() {
	let componentObj = {};

	let curType = '';	//当前用户类型

	this.init = function(){
		_registComponent();
		_initEvent();
	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl":'goform/setSysPwdInfo',
			    "requestUrl":'goform/getSysPwdInfo',
			    "container":'#accountCfg',
			 	"formCfg":{
			 		"userType": {
			 			
			 		},
			 		"userEn": {
			 			"dataTitle": _('启用'),
			 			"changeCallBack": function() {
			 				//关闭user账户不需要验证
			 				let cpnt = componentObj.components;
			 				if(!this.value) {
			 					for(let item in cpnt) {
			 						if(item !== 'userEn') {
			 							cpnt[item].setIgnore(true).removeValidateText();
			 						}
			 					}
			 				}else {
			 					for(let item in cpnt) {
			 						cpnt[item].setIgnore(false);
			 					}
			 				}
			 			}
			 		},
			 		"oldUser": {
			 			"dataTitle": _('Old User Name')
			 		},
			 		"oldPwd": {
			 			"dataTitle": _('Old Password')
			 		},
			 		"newUser": {
			 			"dataTitle": _('New User Name')
			 		},
			 		"newPwd": {
			 			"dataTitle": _('New Password')
			 		},
			 		"confirmPwd": {
			 			"dataTitle": _('Confirm Password')
			 		}
			 	},
			    beforeUpdate(data) {
			    	if(curType === 'admin') {//如果当前点开的是管理员弹出框
			    		this.getComponent('oldUser').setValue(data.admin);
			    		this.getComponent('userType').setValue('admin');
			    		this.getComponent('userEn').hide();
			    	}else {
			    		this.getComponent('oldUser').setValue(data.user);
			    		this.getComponent('userType').setValue('user');
			    		this.getComponent('userEn').show();
			    	}
		       	},
		       	updateCallback() {
		       	},
		       	beforeSubmit() {
		       		let newPwd = this.getValue('newPwd'),
		       			confirmPwd = this.getValue('confirmPwd');

       				if(G.userType !== 'admin') {
       					$.formMessage({
       						'message': _('You must log in as an administrator to make any change.'),
       		             	'displayTime': 1500
       		         	});
       					return false;
       				}

		       		if(newPwd !== confirmPwd) {
		       			$.formMessage(_('Confirmed password and password mismatched, please check it'));
		       			this.getComponent('confirmPwd').focus();
		       			return false;
		       		}

		       	},
		       	afterSubmit(res) { 
		       		let data = JSON.parse(res);   
		       		if(data.errCode === '0'){
		       			if(curType === 'admin') {
		       				window.location.reload(true);
		       			}else {
		           			$.formMessage(_('保存成功'));
		       			}
		       		}else {
		           		$.formMessage(_('保存失败'));
		       		}
		       	}
			});
	};

	let _initEvent = function(){
		let accountBox;
		$('.edit').on('click',function() {
			let type = $(this).data('usertype'),
				title = type === 'admin' ? _('Administrator') : _('Guest Account');

			curType = type;//保存当前用户类型
			if(accountBox) {
				componentObj.reset();		
				$('.md-title').html(title);
				accountBox.show();
			}else {
				let modalObj = {
					"title": title,
					"width": 570,
					"content": $('#accountCfg'),
					"buttons": [
					    {
					        "text": _('Save'),
					        "theme": 'ok',
					        "autoHide": false,
					        "callback": function(){
					            if(componentObj.submit()){
					                accountBox.hide();
					            }
					            
					        }
					    },
					    {
					        "text": _('Cancel')
					    }
					]
				};
				accountBox = $.modalDialog(modalObj);
			}
			componentObj.updateComponents(componentObj.orignalData);	
		});
	};
}

module.exports = new ModuleLogic();