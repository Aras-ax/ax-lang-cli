
let ignoredMenu = {	//根据宏控制忽略哪些菜单
	/*'wrl-qvlan': true,
	'adv-portForward': true,
	'adv-bandwidth': true,
	'adv-macFilter': true*/
}

let menuObj = {
	'status': [{
		'id': 'sta-0',
		'class': 'icons-status',
		'name': _('Status'),
		'url': 'system_status'
	}],
	'wizard': [{
		'id': 'wiz-0',
		'class': 'icons-wizard',
		'name': _('Quick Setup'),
		'url': 'wizard'
	}],
	'net': [{
		'id': 'net-0',
		'class': 'icons-network',
		'name': _('Network'),
		'url': 'lan'
	}, {
		'id': 'net-lan',
		'name': _('LAN Setup'),
		'url': 'lan'
	}, {
		'id': 'net-mac',
		'name': _('MAC Clone'),
		'url': 'mac_clone'
	}, {
		'id': 'net-dhcps',
		'name': _('DHCP Server'),
		'url': 'lan_dhcps'
	}, {
		'id': 'net-dhcp-list',
		'name': _('DHCP Client'),
		'url': 'lan_dhcp_client'
	}, {
		'id': 'net-vlan',
		'name': _('VLAN Settings'),
		'url': 'lan_vlan'
	}],
	'wireless': [{
		'id': 'wrl-0',
		'class': 'icons-wireless',
		'name': _('Wireless'),
		'url': 'wrl_basic'
	}, {
		'id': 'wrl-basic',
		'name': _('Basic'),
		'url': 'wrl_basic'
	}, {
		'id': 'wrl-adv',
		'name': _('Advanced'),
		'url': 'wrl_advance'
	}, {
		'id': 'wrl-filter',
		'name': _('Access Control'),
		'url': 'wrl_filter'
	}],
	'advance': [{
		'id': 'adv-0',
		'class': 'icons-advance',
		'name': _('Advanced'),
		'url': 'lan_speed'
	}, {
		'id': 'adv-lanSpeed',
		'name': _('LAN Rate'),
		'url': 'lan_speed'
	}, {
		'id': 'adv-netTool',
		'name': _('Diagnose'),
		'url': 'net_tool'
	}, {
		'id': 'adv-bandwidth',
		'name': _('带宽控制'),
		'url': 'net_bandwidth'
	}, {
		'id': 'adv-portForward',
		'name': _('端口映射'),
		'url': 'port_forward'
	}, {
		'id': 'adv-macFilter',
		'name': _('MAC Filter'),
		'url': 'mac_filter'
	}, {
		'id': 'adv-netServer',
		'name': _('Network Service'),
		'url': 'net_server'
	}],
	'tool': [{
		'id': 'tool-0',
		'class': 'icons-tool',
		'name': _('Tools'),
		'url': 'system_time'
	}, {
		'id': 'sys-time',
		'name': _('Date & Time'),
		'url': 'system_time'
	}, {
		'id': 'sys-config',
		'name': _('Maintenance'),
		'url': 'system_config'
	}, {
		'id': 'sys-password',
		'name': _('Account'),
		'url': 'system_password'
	}, {
		'id': 'sys-log',
		'name': _('System Log'),
		'url': 'system_log'
	}]
}

module.exports = {menuObj,ignoredMenu}