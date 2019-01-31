var root = (typeof window == 'object' && window.window == window && window) ||(typeof global == 'object' && global.global == global && global);

(function(window) {
    var CONST = {
        CONFIG_MAX_CLIENT_NUM: 128,//最大带机量
        CONFIG_NAT_SESSION_NUMBER: 65536,
        CONFIG_MAX_WAN_NUM: 2,//最大WAN口个数
        CONFIG_MAX_PHY_PORT_NUM: 5,
        CONFIG_MAX_DHCP_CLIENT: 256,
        CONFIG_DHCPS_STATIC_IP_NUM: 200,
        CONFIG_NET_MULTI_WAN: "y",
        CONFIG_PRODUCT: "G0",
        CONFIG_PRODUCT_NAME: "企业级路由器",
        CONFIG_BRAND: "Tenda",
        CONFIG_NET_DHCP_STATIC: "y",//是否有DHCP静态绑定
        CONFIG_DHCPS_LIST_MAX_NUM: "20",
        CONFIG_CHIP_VENDER: "realtek",
        CONFIG_CHIP_MODEL: "rtl8196e",
        CONFIG_PROD: "y",
        CONFIG_NEW_NETCTRL: "y",
        CONFIG_NET_WAN_STATIC: "y",
        CONFIG_NET_WAN_DHCP: "y",
        CONFIG_NET_DHCP: "y",
        CONFIG_NET_WAN_PPPOE: "y",
        CONFIG_PPPoE_SERVER: "y",
        CONFIG_PPPOE_USER_NUMBER: 200,
        CONFIG_PPPOE_WHITE_MAC_NUMBER: 20,
        CONFIG_PPPOE_WHITE_MAC_ADD_NUMBER: 5,//一次性最多添加的MAC数
        CONFIG_ADVANCE_UPNP: "y",
        CONFIG_SYSTEM_SNTP: "y",
        CONFIG_ADVANCE_DDNS: "y",
        CONFIG_ADVANCE_DYNDNS: "y",
        CONFIG_ADVANCE_3322: "y",
        CONFIG_ADVANCE_88IP: "y",
        CONFIG_ADVANCE_ORAY: "y",
        CONFIG_ADVANCE_NOIP: "y",
        CONFIG_VPN: "y",
        CONFIG_VPN_CONNECT_NUMBER: 32,
        CONFIG_VPN_SERVER_USER_NUMBER: 32,//PPTP/L2TP用户可添加的可添加的最大数
        CONFIG_VPN_SERVER_USER_ADD_NUMBER: 5,//一次性最多添加的用户数
        CONFIG_VPN_PPTP: "y",
        CONFIG_VPN_L2TP: "y",
        CONFIG_VPN_IPSEC: "y",
        CONFIG_IPSEC_NUMBER: 32,//ipsec隧道最多可添加的个数
        CONFIG_IGMPPROXY_SUPPORT: "y",
        CONFIG_BEHAVIOR_MANAGER: "y",
        CONFIG_GROUP_IP_NUMBER: 20,//ip组最多可添加的个数
        CONFIG_GROUP_TIMER_NUMBER: 10,//时间组最多可添加的个数
        CONFIG_FILTER_IP_NUMBER: 20,
        CONFIG_FILTER_MAC_NUMBER: 100, //mac过滤最多可添加的个数
        CONFIG_FILTER_IPPORT_NUMBER: 20,//端口过滤最多可添加的个数
        CONFIG_FILTER_URL_NUMBER: 20,//url过滤最多可添加的个数
        CONFIG_URL_GROUP_NUMBER: 10,//url新增分组最多可添加的个数
        CONFIG_GROUP_URL_NUMBER: 20,//url分组内的url条数最多可添加
        CONFIG_URL_FILTER_SYSTEM_CLASSES_SUPPORT: "y",
        CONFIG_FILTER_APP_NUMBER: 20,//app过滤最多可添加数
        CONFIG_FILTER_QQ_NUMBER: 20,//最大QQ数
        CONFIG_FILTER_QQ_ADD_NUMBER: 5,//一次性最多添加的QQ数
        CONFIG_WAN_POLICY_NUMBER: 20,//多wan策略最多可配置多少条
        CONFIG_BIND_IPMAC_NUMBER: 200, //ip-mac绑定最多可添加数
        CONFIG_PRIVILEGE_IP: "y",
        CONFIG_ONLINE_IP: "y",
        CONFIG_APP_IDENTIFY: "y",
        CONFIG_QOS: "y",
        CONFIG_QOS_RULE_NUMBER: 20,//流控可增加的最大条目
        CONFIG_SAFE_ATTACK: "y",
        CONFIG_SAFE_ARP: "y",
        CONFIG_NET_CTL_WEB_ACCESS_WAN: "y",
        CONFIG_NET_PORT_CFG_WAN_NUMBER: "y",
        CONFIG_NET_PORT_CFG_MIRROR: "y",
        CONFIG_NET_PORT_CFG_PORT_LINK_MODE: "y",
        CONFIG_NET_PORT_CFG_MAC_CLONE: "y",
        CONFIG_NET_DMZ: "y",
        CONFIG_PORTAL_AUTH: "y",
        CONFIG_PORTAL_AUTH_WHITE_NUMBER: 100,//不用认证的主机
        CONFIG_AUTH_ADD_NUMBER: 5,//一次性最多添加的不用认证的主机
        CONFIG_AUTH_USER_NUMBER: 300,//认证服务器用户最大数
        CONFIG_AUTH_USER_ADD_NUMBER: 5,//一次性最多添加的用户最大数
        CONFIG_ARP_GATEWAY: "y",
        CONFIG_NAT_SPEEDUP: "y",
        CONFIG_ADVANCE_VIRTUAL_SERVER: "y",
        CONFIG_MAX_PORT_MAP_NUM: 10,
        CONFIG_MAX_STATIC_ROUTE_NUM: 10,
        CONFIG_QVLAN_MAX_NUM: 15,
        CONFIG_ROUTE_TABLE: "y",
        CONFIG_NET_GMAC: "y",
        CONFIG_IPPD: "y",
        CONFIG_FIRWARE_VERION: 'V1.0.0.2(1862_3373_1008)', //软件版本
        CONFIG_WAN_LAN_COUNT_FROM_ZERO: "",//WAN口的下标从0开始还是从1开始
        CONFIG_WAN_LAN_EXCHANGE: "y",//WAN口是否可配置
        CONFIG_LAN_COUNT_BASE_ON_WAN: "",//LAN口下标是否紧跟WAN口下标
        CONFIG_WAN_LEFT: "y",//WAN口是否从左端开始
        CONFIG_PORT_PIC_VIEW: "",
        CONFIG_WAN_MAX_STREAM: 100, //支持100M或1000M
        CONFIG_FASTNAT_SWITCH: "",//fastNat是否显示
        CONFIG_WIFI: "",//是否有无线模块
        CONFIG_WIFI_2_4G_CHIP_11AC: "",//无线高级页面的2.4G是否有11ac模式
        CONFIG_AP_MANAGE: "y",//是否有AC管理模块
        CONFIG_AC_MANAGE_VERSION: "new",//AC管理模块使用哪个版本
        CONFIG_WIFI_5G: "",//wifi模块是否有5G频段
        CONFIG_WEIXIN_WIFI: "",//微信模块是否显示
        CONFIG_SYSTEM_FIX_TOOL : "y",//排障工具页面是否显示
        CONFIG_LAN_PORT_VLAN: "",//端口vlan
        CONFIG_WIRED_QVLAN: "",//qvlan
        CONFIG_WAN_QVLAN: "",
        CONFIG_UCLOUD: "",
        CONFIG_POLICY_UPDATE_ONLINE: "",//策略升级是否有在线升级
        CONFIG_YUN_CLIENT: "",//是否有云管理模块
        CONFIG_FIRWARE_DATE: "2017-09-26",
        CONFIG_DNS_HIJACK_MAX_NUM:256, // DNS缓存最大数量
        CONFIG_MIRROR_WATCH_LAN_PORT:3, // 端口镜像，镜像的端口号
        CONFIG_NET_DOUBLE_PPTP:"",
        CONFIG_NET_DOUBLE_L2TP:"",
        CONFIG_NET_DOUBLE_PPOE:"" //俄罗斯
};
    window.R = window.R || {};
    window.R.CONST = R.CONST || CONST;
}(root));

