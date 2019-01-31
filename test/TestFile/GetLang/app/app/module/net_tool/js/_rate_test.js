'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/FormRadioList';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/FormCheckList';
import '../../../common/component/FormTable';


function ModuleLogic() {

	let componentObj = {};

	this.moduleTimer = {};	//保存模块内所有的定时器

	this.init = function() {

		_registComponent();
		_initEvent();
	};

	this.reset = function() {	//重置一些样式
		componentObj.reset();
		//componentObj.removeValidateText();
		$('.rate-test-area .stopTest').addClass('none');
		$('.rate-test-area .startTest').removeClass('none');
		$('#testProcess').addClass('none');
		$('#progressBar').css('width', '0');
	};

	let _registComponent = function() {
		componentObj = $.componentManager({
			"submitUrl": 'goform/setRateTest',
			"requestUrl": 'goform/getPingCfg',
			"container": '#rateTest',
			"formCfg": {
				"testFrom": {
					"dataTitle": '&nbsp;',
				    "defaultValue":'0',
				    "selectArray":{'0':_('客户端'), '1': _('服务器')}
				},
				"rateIpType": {
					"dataTitle": _('对端AP的IP地址'),
	   	       		"selectArray": [_('manual')],
	   	       		"defaultValue": _('manual'),
	   				"changeCallBack": function(){
	   					let destIP = componentObj.components.destIP;
	   					if(this.value !== _('manual')){
	   						destIP.hide();
	   					}else {
	   						destIP.show();
	   					}
	   				}
				},
				"destPort": {
					"dataTitle": _('Web服务端口号'),
					"defaultValue": 80,
					"dataOptions":[{"type":'num'}]
				},
				"destIP": {
					"dataTitle": _('IP地址'),
					"dataOptions":[{"type":'ip.all'}]
				},
				"userName": {
					"dataTitle": _('登录用户名')
				},
				"userPwd": {
					"dataTitle": _('登录密码')
				},
				"groups": {
					"dataTitle": _('组数'),
					"description": _('(范围：1~20)'),
					"defaultValue": 10,
					"dataOptions":[{"type":'num', "args":[1, 20]}]
				},
				"direction": {
					"dataTitle": _('方向'),
					"defaultValue":'both',
					"selectArray":{'recv':_('接收'), 'send': _('发送'), 'both': _('双向')}
				},
				"time": {
					"dataTitle": _('Time'),
					"description": _('s(范围：1~60)'),
					"defaultValue": 30,
					"dataOptions":[{"type":'num', "args":[1, 60]}]
				}
			},
		    beforeUpdate(data) {
		    	//对端IP地址添加一项
		    	this.components.rateIpType.addItem(data.localIP);
		    },
			beforeSubmit(data) {
				let destIP = componentObj.components.destIP.value,
					rateIpType = componentObj.components.rateIpType.value;

				if(rateIpType !== _('manual')) {//如果IP类型不是选择手动
					data.destIP = rateIpType;	//直接在data上添加一条数据
				}

				$('.startTest').addClass('none');
				$('.stopTest').removeClass('none');
			},
			afterSubmit(res) {
				let errorCode = JSON.parse(res);
				if(errorCode == '1000'){
					$.formMessage(_('网络不可达'));
					return false;
				}else if(errorCode == '1001') {
					$.formMessage(_('拒绝连接'));
					return false;
				}else if(errorCode == '1002') {
					$.formMessage(_('不支持速率测试'));
					return false;
				}

				let delay = +this.components.time.value * 1000;
				_startTest(delay);

				$('.startTest').addClass('none');
				$('.stopTest').removeClass('none');
			}
		});
	};

	let _initEvent = () => {
		$('.startTest').on('click', () => {
			componentObj.submit();
		});

		$('.stopTest').on('click', () => {
			clearTimeout(this.moduleTimer.req);
			clearTimeout(this.moduleTimer.bar);
			$('#testProcess').addClass('none');
			$('#progressBar').css('width', 0);
			$('.stopTest').addClass('none');
			$('.startTest').removeClass('none');
		});
	};

	let _startTest = delay => {
		let perWidth = 100000 / delay,
			t = 0;
			
		$('#testProcess').removeClass('none');

		_progress(perWidth, 0);

		//到达指定时间后，请求数据
		this.moduleTimer.req = setTimeout(() => {
			$.get('goform/getRateTest', res => {
				let data = JSON.parse(res);
				for(let key in data){
					$(`.${key}`).text(data[key]);
				}
			});
			$('.stopTest').addClass('none');
			$('.startTest').removeClass('none');
		},delay);
	};
	
	//进度条
	let _progress = (perWidth, barWidth) => {
		let bar = $('#progressBar');

		barWidth += perWidth;
		if(barWidth > 100) {
			barWidth = 100;
		}
		bar.css('width', barWidth + '%');

		this.moduleTimer.bar = setTimeout(_progress, 1000, perWidth, barWidth);

		if(barWidth == '100'){
			clearTimeout(this.moduleTimer.bar);

			setTimeout(() => {
				bar.css('width', 0);
				$('#testProcess').addClass('none');
			}, 1000);
		}

	};
}

module.exports = new ModuleLogic();