'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/FormRadioList';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/ModalDialog';
import '../../../common/component/FormCheckList';
import '../../../common/component/FormTable';

function ModuleLogic() {

	let componentObj = {};

	let macList = [];	//保存MAC地址，保证规则不能重复
	
	this.init = function() {
		
		_registComponent();
		_initEvent();
	};

	let _registComponent = function() {
		componentObj.ruleCfg = $.componentManager({
			'submitUrl': 'goform/setMacFilter',
			'requestUrl': 'goform/getCurrentMode',
			'container': '#filterCfg',
			'formCfg': {
				'mode': {
					'dataTitle': _('模式'),
					'selectArray': {'2':_('禁用'), '0': _('仅禁止'), '1':_('仅允许')},
					changeCallBack() {
						if(this.value === '2') {
							$('.configrable-area, .macFilter-table-area').addClass('none');
						}else {
							$('.configrable-area, .macFilter-table-area').removeClass('none');
						}
					}
				},
				'remark': {
					'dataTitle': _('备注'),
					'dataOptions': [{'type': 'ssid'}]
				},
				'mac': {
					'dataTitle': _('MAC地址'),
					'dataOptions': [{'type': 'mac.all'}]
				},
				'date':{
					'defaultValue': '00:00-00:00|'
				},
				'time': {
					'dataTitle': _('日期'),
					'selectArray':{'1': _('星期一'), '2': _('星期二'), '3': _('星期三'), '4': _('星期四'), '5': _('星期五'), '6': _('星期六'), '7': _('星期日'), '8': _('每天')},
					changeCallBack() {
						let time = componentObj.ruleCfg.getValue('date').split('|')[0],	//获取时间
							ruleCfg = componentObj.ruleCfg,
							date = '';

						date = `${time}|${this.value}`;

						ruleCfg.getComponent('date').setValue(date);
					}
				}
			},
			beforeSubmit(data) {
				if(macList.indexOf(data.mac.toUpperCase()) > -1) {
					$.formMessage(_('不能添加重复规则'));
					this.components.mac.focus();
					return false;
				}
				macList.unshift(data.mac);
			},
			afterSubmit(res) {
				let data = JSON.parse(res),
					rowData = this.getValue();

				rowData.status = '1';
				if(data.errCode === '0') {
					componentObj.ruleList.addRow(rowData);
					//componentObj.ruleCfg.reset();
					$.formMessage(_('保存成功'));
				}else {
					$.formMessage(_('保存失败'));
				}
			}
		});

		componentObj.ruleList = $('#ruleOperate').FormTable({
			'requestUrl': 'goform/getMacFilter',
			'dataTarget': 'rules',
			'columns': [
				{'title': _('备注'), 'field': 'remark'},
				{
					'title': _('MAC地址'), 
					'field': 'mac',
					format(data, dataField, rowData) {
						return data.toUpperCase();
					}
				},{
					'title': _('时间'), 
					'field': 'date',
					format(data, dataField, rowData) {
						let date = data.split('|')[1],
							time = data.split('|')[0];

						if(date.indexOf('8') > -1) {
							return `${_('每天')} &nbsp; ${time}`;
						}else {
							let dateArr = date.split(';');
							for(let i = 0;i < dateArr.length;i++) {
								switch(dateArr[i]) {
									case '1':
										dateArr[i] = _('一');
										break;
									case '2':
										dateArr[i] = _('二');
										break;
									case '3':
										dateArr[i] = _('三');
										break;
									case '4':
										dateArr[i] = _('四');
										break;
									case '5':
										dateArr[i] = _('五');
										break;
									case '6':
										dateArr[i] = _('六');
										break;
									case '7':
										dateArr[i] = _('日');
										break;
								}
							}
							return `${_('星期')}${dateArr.join('、')} &nbsp; ${time}`;
						}
					}
				},{
					'title': _('模式'), 
					'field': 'mode',
					format(data, dataField, rowData){
						return data === '0'? _('禁止上网') : _('允许上网');
					}
				},{
					'title': _('状态'), 
					'field': 'status',
					format(data, dataField, rowData) {
						if(data === '1') {
							return `<label><input type="checkbox" checked value="${rowData.mac}" class="ruleEn"><span>${_('启用')}</span></label>`;
						}else {
							return `<label><input type="checkbox" value="${rowData.mac}" class="ruleEn"><span>${_('启用')}</span></label>`;
						}
					}
				}
			],
		    'actionColumn':{
	            'columnName': _('操作'),
	            'actions': [{
                    'type':"delete",
                    'text':"删除",
                    callback(index) {
                    	let data = componentObj.ruleList.data[index];

            			if(G.userType !== 'admin') {
            				$.formMessage({
            					'message': _('You must log in as an administrator to make any change.'),
            	             'displayTime': 1500
            	         	});
            				return false;
            			}

                    	//删除表格行
                        componentObj.ruleList.deleteRow([index]);
                        //删除mac列表
                        macList.splice(index,1);

                        $.formMessage(_('删除成功'));
                        data.action = 'delete';
                        $.post('goform/operateMacFilter',data);
                    }
	            }]
	        },
		    'showIndex': true,
		    updateCallBack() {
		    	macList = [];
		    	for(let i = 0; i < this.data.length; i++) {
		    		macList.push(this.data[i].mac.toUpperCase());
		    	}
		    }
		});
	};

	let _initEvent = function() {
		//添加规则
		$('#addRule').on('click',() => {
			let timeRange = $('.time-range'),
				ruleCfg = componentObj.ruleCfg,
				date = ruleCfg.getValue('date').split('|')[1],	//获取日期
				time = '';

			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
             		'displayTime': 1500
         		});
				return false;
			}

			//组装time数据
			time = `${timeRange.data('starthour')}:${timeRange.data('startmin')}-${timeRange.data('endhour')}:${timeRange.data('endmin')}|${date}`;

			//为time组件赋值
			ruleCfg.components.date.setValue(time);
			ruleCfg.submit();
		});

		//修改时间
		$('.time-range select').on('change',function() {
			let dataName = $(this)[0].name,
				dataVal = $(this).val();

			$(this).parent().data(dataName, dataVal);
		});

		//启用或禁用规则
		$('#ruleOperate').on('click','.ruleEn', function(){
			let data = {},
				el = $(this)[0];

			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             'displayTime': 1500
	         	});
				return false;
			}

			if(el.checked) {
				data.action = 'enable';
				$.formMessage(_('启用成功'));
			}else {
				data.action = 'disable';
				$.formMessage(_('禁用成功'));
			}
			data.mac = el.value;
			$.post('goform/operateMacFilter', data);
		});

		//点击时间
		$('#time').on('click', 'label', function() {
			let elem = $(this).find('input'),
				oDate = elem.attr('id'),
				originVal = componentObj.ruleCfg.getValue('time'),
				cpntTime = componentObj.ruleCfg.getComponent('time');

			if(oDate === 'time8') {
				if(elem[0].checked) {
					cpntTime.setValue('1;2;3;4;5;6;7;8');
				}else {
					cpntTime.setValue('');
				}
			}else {
				if(originVal === '1;2;3;4;5;6;7') {
					cpntTime.setValue('1;2;3;4;5;6;7;8');
				}else {
					if(originVal.indexOf('8') > -1) {
						cpntTime.setValue(originVal.replace(/;8/, ''));
					}
				}
			}
		});
	};
}

module.exports = new ModuleLogic();