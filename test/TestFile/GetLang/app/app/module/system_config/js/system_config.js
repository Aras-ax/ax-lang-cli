'use strict';
import $ from 'jquery';
import '../../../common/component/FormUpload';
import '../../../common/component/FormButton';
import '../../../common/component/ModalDialog';


function ModuleLogic() {
	let componentObj = {};//保存componentManager

	this.init = function() {
		_registComponent();
	};

	let _registComponent = function() {
		componentObj.btnSet = $.componentManager({
			"requestUrl" : 'goform/getSysUpgrade',
			"container": '#maintainDevice',
			"formCfg": {
				"reboot": {
					"dataTitle": _('Reboot Device'),
					"btnText": _('Reboot'),
					"description": _('All connections will disconnect during reboot.'),
					clickCallBack() {
						if(G.userType !== 'admin') {
							$.formMessage({
								'message': _('You must log in as an administrator to make any change.'),
				             	'displayTime': 1500
				         	});
							return false;
						}

		       			$.modalDialog({
		    				"title": _('提示'),
		    				"content": _('Are you sure to reboot it?'),
		    				"buttons":[{
					                    "text": _('确定'),
					                    "theme": 'ok',
					                    "autoHide": true,
					                    "callback": function(){
					                       $.progress({
					                       		"cgi": 'goform/setSysReboot',
					                       		"jumpTo": `${componentObj.btnSet.orignalData.ip}`,
					                       		"msg": _('The system is rebooting,it will take about 2 minutes, please wait…'),
					                       		"duration": 60
					                       	});
					                    }
					                },{
					                    "text": _('取消')
					                }]
						});
					}
				},
				"restore": {
					"dataTitle": _('Reset To Factory Settings'),
					"btnText": _('Reset'),
					"description": _('All confiugrations will restore to default factory setting after reset.'),
					clickCallBack() {
						if(G.userType !== 'admin') {
							$.formMessage({
								'message': _('You must log in as an administrator to make any change.'),
				             	'displayTime': 1500
				         	});
							return false;
						}			
		       			$.modalDialog({
		    				"title": _('提示'),
		    				"content": _('The IP address will be reset to %s. Are you sure to reset it?', [componentObj.btnSet.orignalData.ip]),
		    				"buttons":[{
					                    "text": _('确定'),
					                    "theme": 'ok',
					                    "autoHide": true,
					                    callback() {
					                       $.progress({
					                       		"cgi": 'goform/setSysDefault',
					                       		"msg": _('The system is rebooting,it will take about 2 minutes, please wait…'),
					                       		"duration": 60
					                       	});
					                   	}
					                },{
					                    "text": _('取消')
					                }]
						});
					}
				},
				"upload": {
					"submitUrl": 'cgi-bin/upgrade',
					"dataTitle": _('Upgrade Firmware'),
					"showFileText": false,
					"uploadText": _('Upgrade'),
					"description": '   ',
					beforeUpload() {
						if(G.userType !== 'admin') {
							$.formMessage({
								'message': _('You must log in as an administrator to make any change.'),
				             	'displayTime': 1500
				         	});
							return false;
						}
					},
					success(res) {
						let data = JSON.parse(res);

						switch(data.errCode) {
							case '0': 
								$.progress({
									"msg": _('The system is rebooting,it will take about 2 minutes, please wait…'),
									"duration": 60
								});
								break;
							case '1000':
								$.formMessage(_('无效镜像'));
								break;
							case '1001':
								$.formMessage(_('格式错误'));
								break;
							case '1002':
								$.formMessage(_('校验错误'));
								break;
							case '1003':
								$.formMessage(_('大小错误'));
								break;
							case '1004':
								$.formMessage(_('升级错误'));
								break;
							case '1005':
								$.formMessage(_('内存不足'));
								break;
						}
					}
				},
				"backup": {
					"dataTitle": _('Backup / Restore'),
					"showFileText": false,
					"btnText": _('Backup / Restore'),
					"description": _('Backup current settings or import saved settings to device'),
					clickCallBack() {
		       			if(G.userType !== 'admin') {
		       				$.formMessage({
		       					'message': _('You must log in as an administrator to make any change.'),
		       	             	'displayTime': 1500
		       	         	});
		       				return false;
		       			}
		       			let backupBox = $.modalDialog({
		    				"title": _('Backup / Restore'),
		    				"content": $('#backup'),
		    				"width": 600
						});
						backupBox.show();
					}
				}
			},
			afterUpdate() {
				let msg = _('Current Software %s; Release Date: %s',[componentObj.btnSet.orignalData.version, componentObj.btnSet.orignalData.date]),
					uploadCpnt = this.getComponent('upload').$element.next();
				uploadCpnt.html(msg);
				uploadCpnt.after('<em class="form-description notice">'+_('注意：升级过程中，不能断开本设备电源，否则将导致设备损坏而无法使用！')+ '</em>');
			}
		});

		componentObj.backup = $.componentManager({
			"container": '#backup',
			"formCfg": {
				"backup": {
					"dataTitle": _('Backup configurations'),
					"btnText": _('Backup'),
					"clickCallBack": function() {
						window.location.href = '/cgi-bin/DownloadCfg/APCfm.cfg';
					}
				},
				"recover": {
					"submitUrl": 'cgi-bin/UploadCfg',
					"showFileText": false,
					"dataTitle": _('Import configurations'),
					"uploadText": _('Restore'),
					"success": function(res) {
						let data = JSON.parse(res);
						switch(data.errCode) {
							case '2000':
							   	$.progress({
							   		"msg": _('The system is rebooting,it will take about 2 minutes, please wait…'),
							   		"duration": 60
							   	});
								break;
							case '2001':
								$.formMessage(_('升级配置文件错误'));
								break;
							case '2002':
								$.formMessage(_('升级配置文件无效'));
								break;
						}
					}
				}
			}
		});
	};
}



module.exports = new ModuleLogic();