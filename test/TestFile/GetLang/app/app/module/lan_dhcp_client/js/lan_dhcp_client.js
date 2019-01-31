'use strict';
import $ from 'jquery';
import '../../../common/component/FormTable';

import {formatSeconds} from '../../../common/libs/common';

function ModuleLogic() {
	let componentObj = {};

	this.init = function(){
		_registComponent();
	};

	let _registComponent = function(){
		$('#clientList').FormTable({
			"requestUrl": 'goform/getDhcpList',
			"dataTarget": 'list',
			"showIndex": true,
			"columns": [
				{"title": _('主机名'), "field": 'host'},
				{"title": _('IP地址'), "field": 'ip'},
				{"title": _('MAC地址'), "field": 'mac'},
				{
					"title": _('租约时间'),
					"field": 'leaseTime',
					"format": function(data, dataField, rowData) {
						return formatSeconds(data);
					}
				}
			]
		});
	};

	let _initEvent = function(){
		
	};
}

module.exports = new ModuleLogic();