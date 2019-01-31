'use strict';
import $ from 'jquery';

//引入子子模块
import scanSignal from './_scan_signal';
import ping from './_ping';
import rateTest from './_rate_test';
import traceroute from './_traceroute';



function ModuleLogic() {
	let componentObj = {};//保存componentManager

	this.init = function() {
		_registComponent();
	};


	let _registComponent = function() {
		let record = {};	//记录初始化过的模块

		$('#Diagnosis').Rcomponent({
		    "dataTitle": _('网络诊断'),
		    "dataField": 'Diagnosis',
		    "selectArray": {
		    	'0': _('禁用'),
		    	'1': _('扫描信号'),
		    	'2': _('Ping'),
		    	'3': _('Traceroute'),
		    	'4': _('速率测试')
		    	// '5': _('频谱分析')	频谱分析暂时不做
		    },
		    "defaultValue": '0',
		    "changeCallBack": function(){
		    	$('.component-area').addClass('none');

		    	switch(this.value){
		    		case '0':
		    			$('.component-area').addClass('none');
		    			break;
		    		case '1': 		
		    			//调用扫描信号模块
		    			scanSignal.init();
						$('.signal-list-area').removeClass('none');
		    			break;
		    		case '2':
		    			//调用Ping模块

		    			if(!record.ping){
		    				ping.init();
		    			}else {
		    				ping.reset();
		    			}
		    			record.ping = true;
						$('.ping-area').removeClass('none');
		    			break;
		    		case '3':
		    			//调用Traceroute模块
		    			if(!record.traceroute) {
		    				traceroute.init();
		    			}else {
		    				traceroute.reset();
		    			}
		    			record.traceroute = true;
		    			$('.traceroute-area').removeClass('none');
		    			break;
		    		case '4':
		    			//调用速率测试模块
		    			if(!record.rateTest) {
		    				rateTest.init();
		    			}else {
		    				rateTest.reset();
		    			}
		    			record.rateTest = true;
		    			$('.rate-test-area').removeClass('none');
		    			break;
		    		case '5':
		    			//调用频谱分析
		    			break;
		    	}

		    	_resetTimer(rateTest.moduleTimer);

		    }
		});
	};

	let _resetTimer = function(...argv) {
		for(let i=0; i< argv.length; i++) {
			if(!$.isEmptyObject(argv[i])) {
				for(let key in argv[i]){
					clearTimeout(argv[i][key]);
				}
			}
		}
	};

}



module.exports = new ModuleLogic();