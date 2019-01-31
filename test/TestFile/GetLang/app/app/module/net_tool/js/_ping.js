'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/FormTable';


function ModuleLogic() {
	let canPing = true;	//是否可以Ping

	let componentObj = {};

	this.init = function() {
		_registComponent();
		_initEvent();
	};

	this.reset = function() {//重置组件，消除提示信息
		componentObj.reset();
		//componentObj.removeValidateText();
	};

	let _registComponent = function() {
		//ping功能组件
	    componentObj = $.componentManager({
		    "submitUrl":'goform/setPing',
		    "requestUrl": 'goform/getPingCfg',
		    "container":'#ping',
		    // showSubmitBar:true,
		    "formCfg": {
		    	"ipType": {
		       		"dataTitle": _('IP地址'),
		       		"selectArray": [_('manual')],
		       		"defaultValue": _('manual'),
					changeCallBack() {
						let _destIP = componentObj.components._destIP;
						if(this.value !== _('manual')){
							_destIP.hide();
						}else {
							_destIP.show();
						}
					}
		    	},
		    	"destIP": {
		    	},
		    	"_destIP": {
		    		"dataTitle": _('目标IP地址/域名'),
					"dataOptions":[{"type":'ip.all'}],
					changeCallBack() {
						let destIP = componentObj.components.destIP;
						destIP.setValue(this.value);
					}
		    	},
		    	"packetNum": {
		    		"dataTitle": _('Ping包个数'),
		    		"description": _('（范围：1~10000）'),
		    		"dataOptions":[{"type":'num', "args":[1, 10000]}],
		    		"defaultValue": '4'
		    	},
		    	"packetSize": {
		    		"dataTitle": _('数据包大小'),
		    		"description": _('字节（范围：1~60000）'),
		    		"dataOptions":[{"type":'num', "args":[1, 60000]}],
		    		"defaultValue": '32'
		    	}
		    },
		    beforeUpdate(data) {
		    	this.components.ipType.addItem(data.localIP);
		    },
		    afterUpdate() {
		    },
		    beforeSubmit(data) {
		    	let destIP = componentObj.components.destIP.value,
		    		ipType = componentObj.components.ipType.value;

		    	if(ipType !== _('manual')) {//如果IP类型不是选择手动
		    		data.destIP = ipType;
		    	}
		    },
		    afterSubmit() {   
    			let packetNum = this.components.packetNum.value;
    			$('.startPing').addClass('none');
    			$('.stopPing').removeClass('none');
    		    showPingResult(packetNum, this.getValue());
   			}
		});
	};

	let _initEvent = function() {
		$('.startPing').on('click', function() {
			canPing = true;
			componentObj.submit();
		});
		$('.stopPing').on('click', function() {
			$(this).addClass('none');
			$('.startPing').removeClass('none');
			canPing = false;
		});
	};

	function showPingResult(packetNum, data) {
		let send = 0,		//发送的数据包数
			recv = 0,	//收到的数据包数
			drop = 0,	//丢包率
			maxTime = 0, //最大时间
			minTime = 0,	//最小时间
			avgTime = 0,	//平均时间
			totalTime = 0,
			pingStatic = $('.ping-statistics span'),
			pingMin = $('.ping-min'),
			pingAvg = $('.ping-avg'),
			pingMax = $('.ping-max'),
			primState = true;

		packetNum = +packetNum;

		$('#pingResult').FormTable({
		    "requestUrl": 'goform/setPing',
		    "requestOpt": data,
		    "requestType": 'GET',
		    "dataTarget":'result',
		    "columns":[
		        {"title":_('IP地址'), "field":'ip'},
		        {
		        	"title":_('时间'), 
		        	"field":'time', 
		        	format(data, dataField, rowData) {
		        		return data === '-1' ? _('超时') : data;
		        	}
		        },
		        {
		        	"title":_('TTL'), 
		       		"field":'ttl',
		       		format(data, dataField, rowData) {
		       			return data === '-1' ? '--' : data;
		       		}
		       	}
		    ],
		    updateCallBack() {
		    	if(primState && this.data[this.data.length - 1].time !== '-1') {
		    		primState = false;
		    		recv++;

		    		//设置初始时间
		    		maxTime = this.data[this.data.length - 1].time;
		    		minTime = this.data[this.data.length - 1].time;
		    		totalTime += +this.data[this.data.length - 1].time;
		    	}

		    	send++;
		    	drop = ((1 - recv / send ) * 100).toFixed(2) + '%';//计算丢包率

		    	if(canPing && send < packetNum){
	    			$.get('goform/setPing',data, res => {
	    				let data = JSON.parse(res).result[0];

	    				if(data.time !== '-1') {
	    					recv++;
	    					if(+data.time > maxTime) {//保存最大时间
	    						maxTime = data.time;
	    					}else if(+data.time < minTime) {//保存最小时间
	    						minTime = data.time;
	    					}

	    					totalTime += +data.time;	//计算总时间
	    					avgTime = totalTime / recv;//计算平均时间
	    				}

	    				this.addRow(data);
	    			});
		    	}else {
		    		$('.stopPing').addClass('none');
		    		$('.startPing').removeClass('none');
		    	}

		    	//更新ping结果统计
		    	pingStatic.text(_('收到%s个数据包，发送%s个数据包，丢包率%s',[recv,send,drop]));
		    	pingMin.text(_('最小%sms', [minTime]));
		    	pingAvg.text(_('平均%sms', [avgTime.toFixed(2)]));
		    	pingMax.text(_('最大%sms',[maxTime]));
		    }
		});
		$('.ping-result-area').removeClass('none');
	}
}

module.exports = new ModuleLogic();