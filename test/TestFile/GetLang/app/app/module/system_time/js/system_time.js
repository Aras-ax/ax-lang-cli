'use strict';
import $ from 'jquery';
import '../../../common/component/FormRadioList';
import '../../../common/component/FormInput';
import '../../../common/component/FormSelect';
import '../../../common/component/ComponentManage';
import '../../../common/component/FormMultiInput';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
		_initEvent();
	};

	let _registComponent = function(){
		componentObj = $.componentManager({
			    "submitUrl":'goform/setSysTimeInfo',
			    "requestUrl":'goform/getSysTimeInfo',
			    "container":'#sysTime',
			    "showSubmitBar": true,
			    "formCfg": {
			    	"timeType": {
			    		"dataTitle": _('时间设置'),
			    		"selectArray":{
			    			'0': _('Synchronized with the Internet'),
			    			'1': _('Manual')
			    		},
			    		"defaultValue": '0',
		    		    "changeCallBack":function(){
		    		    	let timePeriod = componentObj.getComponent('timePeriod'),
		    		    		timeZone = componentObj.getComponent('timeZone'),
		    		    		time = componentObj.getComponent('time');
		    		        if(this.value === '0') {
		    		        	timePeriod.setVisible(true);
		    		        	timeZone.setVisible(true);
		    		        	time.setIgnore(true).setVisible(false);
		    		        	$('#sysTime .btn-wrap').addClass('none');
		    		        }else {
		    		        	timePeriod.setVisible(false);
		    		        	timeZone.setVisible(false);
		    		        	time.setVisible(true).setIgnore(false);
		    		        	$('#sysTime .btn-wrap').removeClass('none');
		    		        }

		    		        $('#sysTime .form-error,#sysTime .form-hideerror').addClass('none');
		    		        $('#sysTime .error-tip').removeClass('error-tip');
		    		    }
			    	},
			    	"timePeriod": {
			    		"dataTitle": _('Time Interval'),
			    		"selectArray": {
			    			'1800': _('30 minutes'),
			    			'3600': _('1 h'),
			    			'7200': _('2 h'),
			    			'43200': _('12 h'),
			    			'86400': _('1 day'),
			    			'172800': _('2 days'),
			    			'604800': _('1 week'),
			    			'1209600': _('2 weeks'),
			    		}
			    	},
			    	"timeZone": {
			    		"dataTitle": _('Time Zone'),
			    		"selectArray": {
			    			'13': _('(GMT+01:00) Denmark, Germany, Norway, Hungary, France, Belgium'),
			    			'14': _('(GMT+02:00) Israel, Egypt, Bucharest'),
			    			'15': _('(GMT+03:00) Moscow'),
			    			'16': _('(GMT+04:00) Sultanate of Oman, Mauritania, Reunion Island'),
			    			'17': _('(GMT+05:00) Pakistan, Novaya Zemlya, Maldives'),
			    			'17.5': _('(GMT+05:30) Madras, Calcutta, Bombay,New Delhi'),
			    			'18': _('(GMT+06:00) Colombo'),
			    			'19': _('(GMT+07:00) Bangkok, Jakarta'),
			    			'20': _('(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumuqi, Taipei'),
			    			'21': _('(GMT+09:00) Tokyo, Pyongyang'),
			    			'22': _('(GMT+10:00) Sydney, Guam'),
			    			'23': _('(GMT+11:00) Solomon Islands'),
			    			'24': _('(GMT+12:00) Wellington')
			    		}

			    	},
			    	"time": {
			    		"dataTitle": _('Date & Time'),
			    		"inputCount": 6,
			    		"joiner": '-',
			    		"unique": [_('Year'), _('Month'), _('Day'), _('h'), _('m'), _('s')],
			    		"inputCfg":[
		    		        {"dataValueType":'num', "dataOptions": {"type":"num","args":[1970, 2037]}},
		    		        {"dataValueType":'num', "dataOptions": {"type":"num","args":[1, 12]}},
		    		        {"dataValueType":'num', "dataOptions": {"type":"num","args":[1, 31]}},
		    		        {"dataValueType":'num', "dataOptions": {"type":"num","args":[0, 23]}},
		    		        {"dataValueType":'num', "dataOptions": {"type":"num","args":[0, 59]}},
		    		        {"dataValueType":'num', "dataOptions": {"type":"num","args":[0, 59]}}
		    		    ]
			    	}
			    },
			    beforeUpdate(data) {
		       	},
		       	updateCallback() {
		       	},
		       	beforeSubmit() {//验证闰年和大小月
		       		let month = this.getValue('time').split('-')[1],
		       			day = this.getValue('time').split('-')[2],
		       			year = this.getValue('time').split('-')[0];

	       			if(G.userType !== 'admin') {
	       				$.formMessage({
	       					'message': _('You must log in as an administrator to make any change.'),
	       	             	'displayTime': 1500
	       	         	});
	       				return false;
	       			}

		       		if (+month == 2) { //2月
						if (+day > 28) {
							if (((+year % 4 == 0 && +year % 100 != 0) || +year % 400 == 0) && +day == 29) {} else {
								this.components.time.$inputWrap.find('input').eq(2).focus();
								$.formMessage(_("Please enter a valid day."));
								return false;
							}
						}
					} else if (+month == 4 || +month == 6 || +month == 9 || +month == 11) { //4.6.9.11
						if (+day > 30) {
							this.components.time.$inputWrap.find('input').eq(2).focus();
							$.formMessage(_("Please enter a valid day."));
							return false;
						}
					} else { //1.3.5.7.8.10.12
						if (+day > 31) {
								this.components.time.$inputWrap.find('input').eq(2).focus();							
							$.formMessage(_("Please enter a valid day."));
							return false;
						}
					}
					

		       	},
		       	afterSubmit(res) { 
		       		let data = JSON.parse(res);   
		       		if(data.errCode === '0'){
		           		$.formMessage(_('保存成功'));
		       		}else {
		           		$.formMessage(_('保存失败'));
		       		}
		       	}
			});
	};

	let _initEvent = function(){
		$('#copyLocalTime').on('click', function() {
			let today = new Date(),
				year, mon, day, hour, min, second, full;

			year = today.getFullYear().toString();
			mon = today.getMonth() + 1;
			day = today.getDate();
			hour = today.getHours();
			min = today.getMinutes();
			second = today.getSeconds();
			full = `${year}-${mon}-${day}-${hour}-${min}-${second}`;

			componentObj.getComponent('time').setValue(full);
		});
	};
}

module.exports = new ModuleLogic();