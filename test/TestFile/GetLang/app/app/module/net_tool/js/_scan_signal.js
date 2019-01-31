'use strict';
import $ from 'jquery';
import '../../../common/component/FormTable';


function ModuleLogic() {

	this.init = function() {
		_showScanList();
	};

	let _showScanList = function() {
		$('#signalList').FormTable({
		    "requestUrl": 'goform/wrlScanList',
		    "dataTarget":'ssidList',
		    "sortFields": ['index', 'ssid', 'channel', 'signal'],
		    "sortOpt": {"index": 1},
		    "columns":[
		        // {"title":_('序号'), "field":'index'},
		        {"title":_('SSID'), "field":'ssid', 'sortable': true},
		        {"title":_('MAC地址'), "field":'mac'},
		        {"title":_('信道'), "field":'channel', 'sortable': true},
		        {"title":_('安全模式'), "field":'secType', 'maxLength': 18},
		        {
		        	"title":_('信号强度'), 
		        	"field":'signal',
		        	'sortable': true,
		        	format(data, dataField, rowData) {
		        		let className;
		        		if (+data <= -75) {
							className = "signal1";
						} else if (+data > -75 && +data <= -60) {
							className = "signal3";
						} else if (+data > -60) {
							className = "signal5";
						} else {
							className = "signal1";
						}
		        		return `<span class="signal ${className}" title="${data}dBm"></sapn>`;
		        	}
		        }
		    ],
		    'showIndex': true
		});
	};
}

module.exports = new ModuleLogic();