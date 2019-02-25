(function (window, $) {
    // true
    /*    CONFIG_NEW_NETCTRL        */
    const tt = _('We are not \' the " same');
    /*    CONFIG_NEW_NETCTRL        */
    // false
    //  CONFIG_NET_WAN_STATIC 
    const tt = _('这条肯定不能被提取');
    /*CONFIG_NET_WAN_STATIC*/
    // true
    /*  CONFIG_PPPoE_SERVER     */
    const tt = _('CONFGI Word');
    /*CONFIG_PPPoE_SERVER*/
    /*CONFIG_WAN_LAN_COUNT_FROM_ZERO */
    const tt = _('CONFIG is Diff, so it can be selected.');
    /*    CONFIG_WAN_LAN_COUNT_FROM_ZERO1         */
    /*      CONFIG_WAN_LAN_COUNT_FROM_ZERO      */
    const tt = _('single Config has no use');
    /** HHHH */
    /*
    var s = _("注释内容不进行提取");
    let k = _('不要提取我哦，小哥哥');
    */
    const tt = _('I don’t know how (\') to (") translate.');
    const tt = _('change line and tabs');
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
                    title: _('time group:'),
                    width: 170
                },
                {
                    field: 'sysLogType',
                    title: _('type:'),
                    width: 140,
                    format: function (data) {
                        switch (data) {
                        case 1:
                            return _('system log');
                        case 2:
                            return _('攻击日志');
                        case 3:
                            return _('error log');
                        }
                    }
                },
                {
                    field: 'sysLogMsg',
                    title: _('日志内容')
                }
            ]
        });
    }
}(window, $));