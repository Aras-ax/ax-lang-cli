//所有子模块的集合
import system_status from '../../module/system_status/js/system_status.js';
import wizard from '../../module/wizard/js/wizard.js';

import wrl_basic from '../../module/wrl_basic/js/wrl_basic.js';
import wrl_advance from '../../module/wrl_basic/js/wrl_advance.js';
import wrl_filter from '../../module/wrl_basic/js/wrl_filter.js';

import lan_speed from '../../module/lan_speed/js/lan_speed.js';
import lan from '../../module/lan/js/lan.js';
import lan_dhcps from '../../module/lan_dhcps/js/lan_dhcps.js';
import mac_clone from '../../module/mac_clone/js/mac_clone.js';
import lan_dhcp_client from '../../module/lan_dhcp_client/js/lan_dhcp_client.js';
import lan_vlan from '../../module/lan_vlan/js/lan_vlan.js';

import net_server from '../../module/net_server/js/net_server.js';
import net_tool from '../../module/net_tool/js/net_tool.js';
import net_bandwidth from '../../module/net_bandwidth/js/net_bandwidth.js';
import port_forward from '../../module/port_forward/js/port_forward.js';

import system_config from '../../module/system_config/js/system_config.js';
import mac_filter from '../../module/mac_filter/js/mac_filter.js';

import system_time from '../../module/system_time/js/system_time.js';
import system_password from '../../module/system_password/js/system_password.js';
import system_log from '../../module/system_log/js/system_log.js';

module.exports = {system_status, wizard, wrl_basic,wrl_advance,wrl_filter,lan_speed, net_server, net_tool, net_bandwidth, system_config, mac_filter, port_forward, lan, lan_dhcps, lan_dhcp_client, mac_clone, lan_vlan, system_time, system_password, system_log}