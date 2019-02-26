var root = (typeof window == 'object' && window.window == window && window) || (typeof global == 'object' && global.global == global && global);

(function(window) {
    var CONST = {
        CONFIG_MAX_CLIENT_NUM: 128, //最大带机量
        CONFIG_NAT_SESSION_NUMBER: 65536,
        CONFIG_MAX_WAN_NUM: 2, //最大WAN口个数
        CONFIG_MAX_PHY_PORT_NUM: 5,
        CONFIG_MAX_DHCP_CLIENT: 256,
        CONFIG_DHCPS_STATIC_IP_NUM: 200,
        CONFIG_NET_MULTI_WAN: true,
        CONFIG_PRODUCT: "G0",
        CONFIG_PRODUCT_NAME: "企业级路由器",
        CONFIG_BRAND: "Tenda",
        CONFIG_NET_DHCP_STATIC: true, //是否有DHCP静态绑定
        CONFIG_DHCPS_LIST_MAX_NUM: "20",
        CONFIG_CHIP_VENDER: "realtek",
        CONFIG_CHIP_MODEL: "rtl8196e",
        CONFIG_PROD: true,
        CONFIG_NEW_NETCTRL: true,
        CONFIG_NET_WAN_STATIC: false,
        CONFIG_NET_WAN_DHCP: false,
        CONFIG_NET_DHCP: false,
        CONFIG_NET_WAN_PPPOE: true,
        CONFIG_PPPoE_SERVER: true,
        CONFIG_ADVANCE_UPNP: true,
        CONFIG_SYSTEM_SNTP: true,
        CONFIG_ADVANCE_DDNS: true,
        CONFIG_ADVANCE_FALSE: false,
        CONFIG_ADVANCE_3322: true,
        CONFIG_ADVANCE_88IP: true,
        CONFIG_ADVANCE_ORAY: true,
        CONFIG_ADVANCE_NOIP: true,
        CONFIG_VPN: true,
        CONFIG_VPN_PPTP: true,
        CONFIG_VPN_L2TP: true,
        CONFIG_VPN_IPSEC: true,
        CONFIG_IGMPPROXY_SUPPORT: true,
        CONFIG_BEHAVIOR_MANAGER: true,
        CONFIG_URL_FILTER_SYSTEM_CLASSES_SUPPORT: true,
        CONFIG_PRIVILEGE_IP: true,
        CONFIG_ONLINE_IP: true,
        CONFIG_APP_IDENTIFY: true,
        CONFIG_QOS: true,
        CONFIG_SAFE_ATTACK: true,
        CONFIG_SAFE_ARP: true,
        CONFIG_NET_CTL_WEB_ACCESS_WAN: true,
        CONFIG_NET_PORT_CFG_WAN_NUMBER: true,
        CONFIG_NET_PORT_CFG_MIRROR: true,
        CONFIG_NET_PORT_CFG_PORT_LINK_MODE: true,
        CONFIG_NET_PORT_CFG_MAC_CLONE: true,
        CONFIG_NET_DMZ: true,
        CONFIG_PORTAL_AUTH: true,
        CONFIG_ARP_GATEWAY: true,
        CONFIG_NAT_SPEEDUP: true,
        CONFIG_ADVANCE_VIRTUAL_SERVER: true,
        CONFIG_ROUTE_TABLE: true,
        CONFIG_NET_GMAC: true,
        CONFIG_IPPD: true,
        CONFIG_WAN_LAN_COUNT_FROM_ZERO: false, //WAN口的下标从0开始还是从1开始
        CONFIG_WAN_LAN_EXCHANGE: true, //WAN口是否可配置
        CONFIG_LAN_COUNT_BASE_ON_WAN: false, //LAN口下标是否紧跟WAN口下标
        CONFIG_WAN_LEFT: true, //WAN口是否从左端开始
        CONFIG_PORT_PIC_VIEW: false,
        CONFIG_WAN_MAX_STREAM: 100, //支持100M或1000M
        CONFIG_FASTNAT_SWITCH: false, //fastNat是否显示
        CONFIG_WIFI: false, //是否有无线模块
        CONFIG_WIFI_2_4G_CHIP_11AC: false, //无线高级页面的2.4G是否有11ac模式
        CONFIG_AP_MANAGE: true, //是否有AC管理模块
        CONFIG_WIFI_5G: false, //wifi模块是否有5G频段
        CONFIG_WEIXIN_WIFI: false, //微信模块是否显示
        CONFIG_SYSTEM_FIX_TOOL: true, //排障工具页面是否显示
        CONFIG_LAN_PORT_VLAN: false, //端口vlan
        CONFIG_WIRED_QVLAN: false, //qvlan
        CONFIG_WAN_QVLAN: false,
        CONFIG_UCLOUD: false,
        CONFIG_POLICY_UPDATE_ONLINE: false, //策略升级是否有在线升级
        CONFIG_YUN_CLIENT: false, //是否有云管理模块
        CONFIG_NET_DOUBLE_PPTP: false,
        CONFIG_NET_DOUBLE_L2TP: false,
        CONFIG_NET_DOUBLE_PPOE: false //俄罗斯
    };
    window.R = window.R || {};
    window.R.CONST = R.CONST || CONST;
}(root));