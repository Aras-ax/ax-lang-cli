'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';
import '../../../common/component/FormTable';

import {checkIfLegalIpRange} from '../../../common/libs/common';

function ModuleLogic() {

	let componentObj = {};

	let ipRange = [];

	this.moduleTimer = {};	//保存模块内所有的定时器

	this.init = function() {

		_registComponent();
		_initEvent();
	};

	this.reset = function() {	//重置一些样式
	
	};

	let _registComponent = function() {
		componentObj.ruleCfg = $.componentManager({
			"submitUrl":'goform/addCtrlRule',
			"requestUrl": 'goform/getLocalInfo',
			"container":'#bandCtrl',
			"formCfg": {
				"remark": {
					"dataTitle": _('备注'),
					"dataOptions": [{"type": 'ssid'}]
				},
				"_upSpeed": {
					"dataTitle": _('单用户最大上传速率'),
					"description": '<select class="up-speed-unit"><option value="k">Kbps</option><option value="m">Mbps</option></select>',
					"dataOptions": [{"type": 'num'}],
					changeCallBack() {
						let unit = $('.up-speed-unit').val(),
							speed = +this.value,
							upSpeedCmt = componentObj.ruleCfg.components.upSpeed;

						unit === 'k' ? upSpeedCmt.setValue(speed) : upSpeedCmt.setValue(speed * 1024); 
					}
				},
				"_downSpeed": {
					"dataTitle": _('单用户最大下载速率'),
					"description": '<select class="down-speed-unit"><option value="k">Kbps</option><option value="m">Mbps</option></select>',
					"dataOptions": [{"type": 'num'}],
					changeCallBack() {
						let unit = $('.down-speed-unit').val(),
							speed = +this.value,
							downSpeedCmt = componentObj.ruleCfg.components.downSpeed;

						unit === 'k' ? downSpeedCmt.setValue(speed) : downSpeedCmt.setValue(speed * 1024); 
					}
				},
				"upSpeed": {//实际后台需要的是这三项数据
				},
				"downSpeed": {//实际后台需要的是这三项数据
				},
				"ipRange":{//实际后台需要的是这三项数据
				}
			},
			
			beforeUpdate(res) {
				let reg = /.*\./,
					segment = res.ip.match(reg)[0];

				$('.segment').html(segment);
			},
			afterUpdate(data) {
				//切换单位赋值
				$('.up-speed-unit').on('change', () => {
					let upUnit = $('.up-speed-unit').val(),
						upSpeedCmt = this.components.upSpeed,	//最大上传速率组件
						upSpeedCmtVal = +this.components.upSpeed.getValue(); //最大上传速率组件值
					if(upSpeedCmtVal !== '') {
						if(upUnit === 'k') {
							upSpeedCmt.setValue(parseInt(upSpeedCmtVal / 1024, 10));
						}else {
							upSpeedCmt.setValue(parseInt(upSpeedCmtVal * 1024, 10));
						}

					}
				});

				//切换单位赋值
				$('.down-speed-unit').on('change', () => {
					let downUnit =  $('.down-speed-unit').val(),
						downSpeedCmt = this.components.downSpeed,	//最大下载速率组件
						downSpeedCmtVal = +this.components.downSpeed.getValue(); //最大下载速率组件值

					if(downSpeedCmtVal !== '') {
						if(downUnit === 'k') {
							downSpeedCmt.setValue(parseInt(downSpeedCmtVal / 1024, 10));
						}else {
							downSpeedCmt.setValue(parseInt(downSpeedCmtVal * 1024, 10));
						}

					}
				});
			},
		    beforeSubmit() {
		    	let	startIP = this.getValue('ipRange').split('-')[0],
		    		endIP = this.getValue('ipRange').split('-')[1];

		    	if(!_checkIpRange(startIP, endIP)){	//验证IP地址范围
		    		return false;
		    	}

		    	if(_checkIfRangeConflict(ipRange,[startIP, endIP])) {	//判断IP地址范围是否冲突
		    		$('.range-start').focus();
		    		return false;
		    	}


		    	this.ruleList = this.getValue();
		    	this.ruleList.status = '1';
		    },
		    afterSubmit() {
		    	let ruleList = componentObj.ruleList;

		    	//重置组件
		    	componentObj.ruleCfg.reset();
		    	$('.range-start, .range-end').val('');

		    	//添加条目
		    	ruleList.addRow(this.ruleList);
		    	$.formMessage(_('添加成功'));
		    }
		});

		componentObj.ruleList = $('#ruleOperate').FormTable({
		    "requestUrl": 'goform/getRuleList',
		    "requestType": 'GET',
		    "dataTarget":'result',
		    "columns":[
		        {"title": _('备注'), "field": 'remark'},
		        {
		        	"title": _('IP地址范围'), 
		        	"field": 'ipRange',
		        	format(data, dataField, rowData) {
		        		return data.replace(/-/, '~');
		        	}
		        },
		        {
		        	"title": _('最大上传速率'), 
		        	"field": 'upSpeed',
		        	format(data, dataField, rowData) {
		        		return (+data / 1024) < 1 ? `${data}Kbps` : `${~~(+data/1024)}Mbps`;
		        	}
		        },
		        {
		        	"title": _('最大下载速率'), 
		        	"field": 'downSpeed',
		        	format(data, dataField, rowData) {
		        		return (+data / 1024) < 1 ? `${data}Kbps` : `${~~(+data/1024)}Mbps`;
		        	}
		        },
		        {
		        	"title": _('状态'), 
		        	"field": 'status', 
		        	format(data, dataField, rowData) {
						if(data === '1') {
							return `<label><input type="checkbox" checked value="${rowData.ipRange}" class="ruleEn"><span>启用</span></label>`;
						}else {
							return `<label><input type="checkbox" value="${rowData.ipRange}" class="ruleEn"><span>启用</span></label>`;
						}
					}
		        }
		    ],
		    "actionColumn":{
	            "columnName": _('操作'),
	            "actions": [{
                    "type":"delete",
                    "text":"删除",
                    callback(index) {
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
                        $.post('goform/operateRule',data);
                    }
	            }]
	        },
		    "showIndex": true,
		    updateCallBack() {//保存已有IP地址范围
		    	ipRange = [];
		    	for(let i = 0;i < this.data.length;i++) {
		    		let start = this.data[i].ipRange.split('-')[0],
		    			end = this.data[i].ipRange.split('-')[1];
		    		ipRange.push([start, end]);
		    	}
		    }
		});
	};

	let _initEvent = () => {
		//启用禁用规则
		$('#ruleOperate').on('click', '.ruleEn', function(){
			let data = {},
				el = $(this)[0];

			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             	'displayTime': 1500
	         	});
				return false;
			}

			if(el.checked) {	//点击启用
				data.action = 'enable';
				$.formMessage(_('启用成功'));
			}else {
				data.action = 'disable';
				$.formMessage(_('禁用成功'));
			}
			data.ipRange = el.value;

			$.post('goform/operateRule',data);
		});

		//添加规则
		$('#addRule').on('click',function() {
			let ruleList = componentObj.ruleList,
				ruleCfg = componentObj.ruleCfg;

			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             	'displayTime': 1500
	         	});
				return false;
			}

			if(ruleList.data.length > 15) {
				$.formMessage(_('Only 16 rules is supported!'));
				return false;
			}

			ruleCfg.submit();	
		});

		//ipRange赋值
		$('.range-start, .range-end').on('keyup',function() {
			let start = $('.range-start').val(),
		    	end = $('.range-end').val(),
		    	segment = $('.segment').eq(0).html(),
		    	range = `${segment}${start}-${segment}${end}`;
		    	
		    componentObj.ruleCfg.components.ipRange.setValue(range);
		});
	};

	let _checkIpRange = function(startIP, endIP) {
		//验证IP地址合法性
		let checkStart = $.valid.ip.all(startIP),
			checkEnd = $.valid.ip.all(endIP);

		if(checkStart) {
			$.formMessage(checkStart);
			$('.range-start').focus();
			return false;
		}

		if(checkEnd) {
			$.formMessage(checkEnd);
			$('.range-end').focus();
			return false;
		}

		if(!checkIfLegalIpRange(startIP, endIP)) {
			$.formMessage(_('结束IP地址不能小于于起始IP地址'));
			$('.range-end').focus();
			return false;
		}
		return true;
	};

	//检测ip地址范围冲突
	let _checkIfRangeConflict = function(rangeArr, range) {
		let len = rangeArr.length;

		for(let i = 0;i < len;i++) {
			if(checkIfLegalIpRange(range[1], rangeArr[i][0]) || checkIfLegalIpRange(rangeArr[i][1], range[0])) {
				continue;
			} else {
				$.formMessage(_('IP地址范围与已有的规则冲突'));
				return true;
			}
		}
		return false;
	};

}

module.exports = new ModuleLogic();