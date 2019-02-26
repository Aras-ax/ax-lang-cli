const s = _('翻译1');

function a() {
    let t = _('KD-高-抗');
    if (data.passwordFirm !== data.password) {
        $.formMessage(_('需要翻译项'));
        passwordCm.components['passwordFirm'].focus();
        return false;
    }
}

let translate = _("翻译二"),
    kd = `${_("to do %s.", [12])}`,
    gd = 'this is ' + _('天之大，唯有你的%s', 'love') + _('就像是他');

let cfg = {
    //pppoe
    wanUser: {
        dataTitle: _('天之大。地之大'),
        maxLength: 127,
        dataOptions: [{
            type: _("备注")
        }, {
            type: 'specialChar',
            args: ['\'"&']
        }]
    }
};

let passwordCm = $.componentManager({
    formCfg: cfg,
    submitUrl: '/goform/module',
    container: '#pagePassword',
    beforeSubmit(data) {
        if (data.passwordFirm !== data.password) {
            $.formMessage(_('确认密码'));
            // todo by xc
            passwordCm.components['passwordFirm'].focus();
            return false;
        }
    }
});
$('#wanDesc').html(_('请选择联网类型'));
$('#title').text(_('联网设置'));
$('#wanDesc').html(`${_('设置成功')} <label class="red">${connectType}</label>`);
effectiveNetSelect.unshift({
    0: _("全部")
});

accessTableCmp = $("#accessTable").FormTable({
    requestUrl: "/goform/module",
    requestOpt: {
        getVisitControlList: ""
    },
    showCheckbox: true,
    dataTarget: "getVisitControlList",
    filterProperty: ["effectiveNet"],
    columns: [{
        field: "macAddress",
        title: _('Mac地址'),
        sortable: true
    }],
    actionColumn: {
        columnName: _("操作"),
        actions: [{
            id: "edit", //标识按钮
            type: "edit", //delete,other
            callback: function () {
                _initEditDialog();
                let editData = accessTableCmp.data[~~($(this).attr("data-index"))];
                editData.type = "edit";
                editData.index = ~~($(this).attr("data-index"));
                editModal.updateComponents(editData);
                if (modal) {
                    modal.show();
                } else {
                    modal = $.modalDialog({
                        title: _("修改"),
                        content: $("#editModalWrap"),
                        buttons: [{
                            text: _("保存"),
                            theme: "ok",
                            autoHide: false
                        }, {
                            text: _("取消")
                        }]
                    });
                }
            }
        }, {
            id: "delete", //标识按钮
            type: "delete", //delete,other
            callback: function () {
                $.GetSetData.setData(delData, function (d) {
                    if (d.setVisitControlList === 0) {
                        $.formMessage(_("删除"));
                    } else {
                        $.formMessage(_("保存失败"));
                    }
                }, '/goform/module', 'post', true);
            }
        }]
    }
});
$.formMessage(_("一次只能添加%s条", [5]));