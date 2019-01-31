'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/ComponentManage';
import '../../../common/component/FormTable';

function ModuleLogic() {

	let componentObj = {};

	let canTrace = true;	//是否能trace标志

	this.init = function() {
		_registComponent();
		_initEvent();
	};

	this.reset = function() {//重置组件，消除提示信息
		componentObj.trace.reset();
		componentObj.trace.getComponent('destination').removeValidateText();
	};


	let _registComponent = function() {
		componentObj.trace = $.componentManager({
			"submitUrl": 'goform/setTraceroute',
    		"container": '#trace',
    		"formCfg": {
    			"destination": {
    				"dataTitle": _('目标IP地址/域名'),
    				"dataOptions": [{"type": 'domain.all'}]
    			}
    		},
    		afterSubmit(res) {
    			let data = JSON.parse(res);

    			if(data.errCode === '0') {
    				$('.startTrace').addClass('none');
    				$('.stopTrace').removeClass('none');
    				_showTraceResult(this.getValue());
    			}	
    		}
		});
	};

	let _initEvent = function() {
		$('.startTrace').on('click', function() {
			canTrace = true;
			componentObj.trace.submit();
		});
		$('.stopTrace').on('click', function() {
			$(this).addClass('none');
			canTrace = false;
			$('.startTrace').removeClass('none');
			$.post('goform/stopTraceroute');//通知后台停止trace
		});
	};

	let _showTraceResult = function(dest) {
		let traceData = {};	//待post的数据

		traceData.dest = dest.destination;
		traceData.hop = 1;

		let tb = $('#traceResult').FormTable({
			"requestUrl": 'goform/getTraceroute',
			"requestOpt": traceData,
			"requestType": 'GET',
			"dataTarget": 'result',
			"sortField": ['order'],
			"sortOpt": {"order": 1},
			"columns": [
				{"title": _('序号'), "field": 'order'},
				{"title": _('IP地址'), "field": 'ip'},
				{"title": _('时间'), "field": 'time'}
			],
			updateCallBack() {
				traceData.hop++;

				if(canTrace && traceData.hop < 31) {
					$.post('goform/getTraceroute', traceData, res => {
						let data = JSON.parse(res);
						if(data.finished === '0') {//如果获取完毕，则停止请求
							canTrace = false;
							return false;
						}
						this.addRow(data.result[0]);
					});
				}else {
					$('.stopTrace').addClass('none');
		    		$('.startTrace').removeClass('none');
				}
			}
		});

		$('.traceroute-result-area').removeClass('none');
	};
}

module.exports = new ModuleLogic();