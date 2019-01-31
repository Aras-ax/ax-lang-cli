'use strict';
import $ from 'jquery';
import '../../../common/component/FormInput';
import '../../../common/component/ComponentManage';
import '../../../common/component/FormTable';

function ModuleLogic() {
	let componentObj = {};

	let curType = 'user';	//当前用户类型

	this.init = function(){
		_registComponent();
		_initEvent();
	};

	let _registComponent = function(){
		componentObj = $('#sysLog').FormTable({
			"requestUrl": 'goform/getSyslogInfo',
			"dataTarget": 'list',
			"columns": [
				{"title": '主机名称',"field": 'time'},
		        {"title": '认证类型',"field": 'type'},
		        {"title": 'IP地址',"field": 'log'}
			],
			"showIndex": true,
			"filterProperty": ['type'],
			"filterValue": ''
		});
	};

	let _initEvent = function(){
		$('#refreshLog').on('click',function() {
			componentObj.reLoad();
		});
		$('#clearLog').on('click',function() {
			if(G.userType !== 'admin') {
				$.formMessage({
					'message': _('You must log in as an administrator to make any change.'),
	             	'displayTime': 1500
	         	});
				return false;
			}
			
			$.post('goform/clearLog', function() {
				componentObj.reLoad();
			});
		});
		$('#selectLogType').on('change', function() {
			componentObj.filterValue = $(this).val() !== 'all'? $(this).val() : '';
			componentObj.reLoad();
		});
	};
}

module.exports = new ModuleLogic();