(function(window, $) {
    /*<   CONFIG_NET_WAN_STATIC>*/ //y
    const tt = _("we are not \" the same");
    const tt = _("滴答滴答滴\'答滴");
    /*-CONFIG_NET_WAN_STATIC-*/

    /*<CONFIG_WAN_LAN_COUNT_FROM_ZERO>*/ //不打包
    const tt = _("这条肯定不能被提取");
    /*-CONFIG_WAN_LAN_COUNT_FROM_ZERO-*/

    /*<CONFIG_NET_WAN_STATIC    >*/
    const tt = _("hahahhahahaha");
    /*-CONFIG_NET_WAN_STATIC-*/

    /*<    CONFIG_NET_WAN_STATIC12    >*/
    const tt = _("唐人街");
    /*-CONFIG_NET_WAN_STATIC12-*/

    /*<         CONFIG_WAN_LAN_COUNT_FROM_ZERO>*/
    const tt = _("------不能被提取，阿拉蕾-----");
    /*-CONFIG_WAN_LAN_COUNT_FROM_ZERO         -*/


    /*<     CONFIG_WAN_LAN_COUNT_FROM_ZERO     >*/
    const tt = _("---###老司机带带我，阿里阿里里###---");
    /*- CONFIG_WAN_LAN_COUNT_FROM_ZERO -*/

    /** HHHH */
    /*
    var s = _("this is 不一样");
    let k = _("呵呵哒~~");
    */
    var formTable, G_data = {};

    function initTable(data) {
        var tableData = filterData($("#logType").val());
        formTable = $("#sysLog").TablePage({
            data: tableData,
            sortFields: ["sysLogTime", "ID"],
            sortOpt: {
                sysLogTime: 2,
                ID: 2
            }, // 按时间降序排列
            columns: [{
                    field: "sysLogTime",
                    title: _("Time1"),
                    width: 170
                },
                {
                    field: "sysLogType",
                    title: _("Type"),
                    width: 140,
                    format: function(data) {
                        switch (data) {
                            case 1:
                                return _("System Log1");
                            case 2:
                                return _("Attack Log");
                            case 3:
                                return _("Error Log");
                        }
                    }
                },
                {
                    field: "sysLogMsg",
                    title: _("Log Content")
                }
            ]
        });
    }

}(window, $))