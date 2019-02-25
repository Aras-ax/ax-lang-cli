(function (window, $) {
    // true
    /*    CONFIG_NEW_NETCTRL        */
    const tt = _('我们不"一样');
    /*    CONFIG_NEW_NETCTRL        */
    // false
    //  CONFIG_NET_WAN_STATIC 
    const tt = _('这条肯定不能被提取');
    /*CONFIG_NET_WAN_STATIC*/
    // true
    /*  CONFIG_PPPoE_SERVER     */
    const tt = _('宏控制词条');
    /*CONFIG_PPPoE_SERVER*/
    /*CONFIG_WAN_LAN_COUNT_FROM_ZERO */
    const tt = _('宏不一样所以肯定被提取');
    /*    CONFIG_WAN_LAN_COUNT_FROM_ZERO1         */
    /*      CONFIG_WAN_LAN_COUNT_FROM_ZERO      */
    const tt = _('没有对应的结束宏，可以被提取');
    /** HHHH */
    /*
    var s = _("注释内容不进行提取");
    let k = _('不要提取我哦，小哥哥');
    */
    const tt = _('符号提(\')取验(")证项');
    const tt = _('换行和tab验证：\n  \t');
    function initTable(data) {
        var tableData = filterData($('#logType').val());
        formTable = $('#sysLog').TablePage({
            data: tableData,
            sortFields: [
                'sysLogTime',
                'ID'
            ],
            sortOpt: {
                sysLogTime: 2,
                ID: 2
            },
            // 按时间降序排列
            columns: [
                {
                    field: 'sysLogTime',
                    title: _('时间组一：'),
                    width: 170
                },
                {
                    field: 'sysLogType',
                    title: _('类型：'),
                    width: 140,
                    format: function (data) {
                        switch (data) {
                        case 1:
                            return _('系统日志');
                        case 2:
                            return _('Attack \'Log"');
                        case 3:
                            return _('错误日志');
                        }
                    }
                },
                {
                    field: 'sysLogMsg',
                    title: _('Log \n Content')
                }
            ]
        });
    }
}(window, $));