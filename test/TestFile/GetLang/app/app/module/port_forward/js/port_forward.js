'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';
import '../../../common/component/FormTable';

function ModuleLogic() {

	let componentObj = {};

	this.moduleTimer = {};

	this.init = function() {
		_registComponent();
		_initEvent();
	};

	let _registComponent = function() {
		componentObj.forwardCfg = $.componentManager({
			"submitUrl": 'goform/setPortForward',
			"container": '#portForward',
			"formCfg": {
				"ip": {
					"dataTitle": _('内网IP地址'),
					"dataOptions": [{"type":'ip.all'}]
				},
				"localPort": {
					"dataTitle": _('内网端口'),
					"dataOptions": [{"type":'num',"args": [0, 65535]}]
				},
				"publicPort": {
					"dataTitle": _('外网端口'),
					"dataOptions": [{"type":'num',"args": [0, 65535]}]
				},
				"protocol": {
					"dataTitle": _('协议'),
					"selectArray": ['TCP&UDP','TCP','UDP']
				},
				"app": {
					"dataTitle": _('应用'),
					"selectArray": ['Telnet','SMTP','IMAP','DNS','PPTP','PoP3','FTP','HTTP','SOCK']
				}
			},
			beforeSubmit(data) {
				let curList = componentObj.ruleList.data,
					len = curList.length;

				if(len > 15) {
					$.formMessage(_('Only 16 rules is supported!'));
					return false;
				}
				for(let i = 0;i < len; i++){
					if(curList[i].ip === data.ip) {
						if(curList[i].localPort === data.localPort) {
							$.formMessage(_('添加的内网端口号与已添加的冲突！'));
							this.getComponent('localPort').focus();
							return false;
						}else if(curList[i].publicPort === data.publicPort) {
							$.formMessage(_('添加的外网端口号与已添加的冲突！'));
							this.getComponent('publicPort').focus();
							return false;
						}

					}
				}
			},
			afterSubmit(res) {
				let data = JSON.parse(res);

				if(data.errCode === '0') {
					let rowData = this.getValue();
						rowData.status = '1';

					componentObj.ruleList.addRow(rowData);
					this.reset();
					$.formMessage(_('添加成功'));

				}else {
					$.formMessage(_('添加失败'));
				}
			}

		});

		componentObj.ruleList = $('#portFwdOperate').FormTable({
			"requestUrl": 'goform/getForwardList',
			"dataTarget": 'ruleList',
		    "columns":[
		        {"title": _('内网IP地址'), "field": 'ip'},
		        {"title": _('内网端口'), "field": 'localPort'},
		        {"title": _('外网端口'), "field": 'publicPort'},
		        {"title": _('协议'), "field": 'protocol'},
		        {"title": _('应用'), "field": 'app'},
		        {
		        	"title": _('状态'), 
		        	"field": 'status', 
		        	"format": function(data, dataField, rowData) {
						if(data === '1') {
							return `<label><input type="checkbox" checked value="${rowData.ip}" class="ruleEn"><span>启用</span></label>`;
						}else {
							return `<label><input type="checkbox" value="${rowData.ip}" class="ruleEn"><span>启用</span></label>`;
						}
					}
		        }
		    ],
		    "actionColumn":{
	            "columnName": _('操作'),
	            "actions": [{
                    "type": 'delete',
                    "text": _('删除'),
                    "callback": function(index){
                    	let data = componentObj.ruleList.data[index];

            			if(G.userType !== 'admin') {
            				$.formMessage({
            					'message': _('You must log in as an administrator to make any change.'),
            	             	'displayTime': 1500
            	         	});
            				return false;
            			}
            			
                        componentObj.ruleList.deleteRow([index]);
                        $.formMessage(_('删除成功'));
                        data.action = 'delete';
                        $.post('goform/operateForwardRule',data);
                    }
	            }]
	        },
		    "showIndex": true
		});
	};

	let _initEvent = function() {
		$('#addRule').on('click',function() {
			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             	'displayTime': 1500
	         	});
				return false;
			}

			componentObj.forwardCfg.submit();
		});

		//启用禁用规则
		$('#portFwdOperate').on('click','.ruleEn', function(){
			let data = {},
				el = $(this)[0],
				idx = componentObj.ruleList.getDataIndex(this);//判断点击了哪一条规则

			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             	'displayTime': 1500
	         	});
				return false;
			}

			data = componentObj.ruleList.data[idx];
			if(el.checked) {	//点击启用
				data.action = 'enable';
				$.formMessage(_('启用成功'));
			}else {
				data.action = 'disable';
				$.formMessage(_('禁用成功'));
			}

			$.post('goform/operateForwardRule',data);
		});
	};
}

module.exports = new ModuleLogic();