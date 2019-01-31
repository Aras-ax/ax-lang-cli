/* eslint-disable */
import jQuery from 'jquery';
(function ($, undefined) {
    var DEFAULT = {
        data: [], //表格数据
        requestUrl: "",
        requestOpt: {},
        perArray: [10, 20, 30, 50], //每页显示条数数组
        perNum: 10, //每页显示的数据数
        pageIndex: 0, //当前起始页
        showStyle: 1, //数据显示类型  1:分页，2：不分页
        limit: 0, //最多显示几条数据，默认值为0，显示所有
        columns: [
            // {
            //     field:"",
            //     title："",//列显示标题
            //     width:"20%",
            //     sortable:false,
            //     format:function(data, field, dataObj){
            //         data:当前字段的值，
            //         field:当前的字段
            //         dataObj:当前行对象的值
            //         //需要返回值
            //         //可以对数据值进行格式转换等一系列操作，返回处理后的值
            //         return data + "哈哈";
            //         //也可以按自己的需求渲染标签
            //         return '<input type="text" value="' + data + '" class="xxxx"/>'
            //         //return '<div data-field="'+ key +'" data-key="FormInput" defaultValue="'+ data +'"> '
            //     },
            //     sortCallBack:function(){},//返回需要排序的字段和排序方式{field:'', sort:1}
            //     rendered:function(){
            //          //自定义列渲染完成后回调
            //          //可用于调用者实现自己的逻辑，例如事件绑定，组件初始化等操作
            //          //时间绑定
            //          var _this = this; //this 指向当前的formtable实例
            //          _this.$element.off("change.FormTable").on("change.FormTable",".xxxx", function(){
            //              //
            //          });
            //          或者 组件渲染
            //          _this.$element.find("change.Form").Rcomponent({
            //  dataTitle:"formchecklist",
            //  dataField:"formchecklist",
            //  defaultValue:"test1",
            //  selectArray:['test1', 'test2', 'test3', 'test4'],
            //  changeCallBack:function(){
            //      console.log(this.value);
            //  }
            // });
            //     }
            // }
        ],
        dataTarget: "",
        filterProperty: [],
        actionColumn: {
            columnName: _("Operation"),
            actions: [
                // {
                //     id:"",//标识按钮
                //     type:"edit",//delete,other
                //     text:"",
                //     icon:"",
                //     callback:function(){
                //         //to do you own job
                //     }
                // }
            ]
        },
        key: "ID",
        editColumn: [],
        showCheckbox: false, //显示checkbox
        showPageLeftBar: true, //显示底部左侧显示页数切换栏
        showPageRightBar:true, //显示分页按钮
        showIndex: false,//显示序号
        sortFields: [],
        sortOpt: {},
        autoHighLight:false, //高亮与查询字段匹配的字符
        sortFunction:null, //排序函数和排序字段不能同时存在
        maxIndex: 7, //分页栏最多显示按钮数
        beforeUpdate: function () {
        },//数据更新前操作，可进行数据的二次处理，若有返回值，则返回新的数据
        updateCallBack: function () {
        }, //数据更新回调
        changePageNumCallBack:function () {
            //改变每页显示条数回调
        }
    };

    function FormTable($element, opt) {
        this.$element = $element.addClass('form-table');
        var option = $.extend({}, DEFAULT, opt);

        function initProperty() {
            this.perNum = option.perNum || option.perArray[0];
            if (option.perArray.indexOf(this.perNum) == -1) {
                this.perNum = option.perArray[0];
            }
            // for(var key in option){
            //     if(option.hasOwnProperty(key) && key !== "perNum"){
            //         this[key] = option[key];
            //     }
            // }

            this.showStyle = option.showStyle;
            this.perArray = option.perArray;
            this.orignalData = option.data;
            this.updateCallBack = option.updateCallBack;
            this.changePageNumCallBack = option.changePageNumCallBack;
            this.beforeUpdate = option.beforeUpdate;
            this.updateState = option.updateState;

            this.columns = option.columns;
            this.showCheckbox = option.showCheckbox;
            this.actionColumn = option.actionColumn;
            this.hasActionColumn = option.actionColumn.actions.length > 0 ? true : false;
            this.limit = option.limit;

            if(this.limit > 0){
                this.showStyle = 2;
                this.perArray = [this.limit];
            }

            if(this.showStyle === 2){
                this.showPageLeftBar = this.showPageRightBar = false;
            }else{
                this.showPageRightBar = option.showPageRightBar;
                this.showPageLeftBar = option.showPageLeftBar;
            }
            this.key = option.key;
            this.editColumn = option.editColumn;
            this.showIndex = option.showIndex;
            this.filterProperty = option.filterProperty;
            this.filterValue = option.filterValue;
            this.dataTarget = option.dataTarget;
            this.autoHighLight = option.autoHighLight;
            this.requestUrl = option.requestUrl;
            this.requestType = option.requestType || "get";
            this.requestOpt = option.requestOpt;
            this.sortFields = option.sortFields; 
            this.sortFields.length > 0 && this.sortFields.reverse();//优先级最高的排序字段放在数组最后面
            this.sortOpt = option.sortOpt; //记录字段的排序规则 1：升序，2：降序
            this.sortFunction = option.sortFunction;

            //第一条数据索引值
            this.dataIndex = 0;
            //总页数
            this.pageNum = 1;
            //表格数据列数
            this.columnCount = 0;
            //表格总列数
            this.totalColumn = 0;
            this.selectedRow = [];
            //表头数组
            this.tHead = [];
            //标记已经初始化变量
            this.hasInit = false;
            //表格底部操作栏
            this.footBar = {
                //当前页 从1开始
                pageIndex: option.pageIndex + 1,
                //按钮栏是否可见
                visible: true,
                maxIndex: option.maxIndex,
                //按钮栏容器 jQuery对象
                $insertArea: {},
                $rightHtml: {},
                //隐藏页按钮html
                hiddenInfo: '<span class="info-hidden-flag">...</span>'
            };

            if(this.orignalData && !this.requestUrl){
                this.orignalData = this.dataTarget ? this.orignalData[this.dataTarget] : this.orignalData || [];
            }

            this.$thead = $('<thead></thead>');
            this.$tbody = $('<tbody></tbody>');
            this.$element.children('tbody').remove();
            this.editData = {};
            this.defaultOption = option;

            this.MSG = {
                noData: _("No table data")
            };
        }

        initProperty.call(this);
        this.init();
    }

    FormTable.prototype = {
        constructor: FormTable.prototype,
        init: function () {
            if (this.$element === null || !this.$element.length) {
                throw new Error('please specify the element for table');
            }

            if (!this.hasInit) {
                this.$element.attr("cellSpacing", 0);
                this.footBar.$insertArea = $('<div class="form-table-footbar clearfix" id="' + $.IGuid() + '"></div>');
                this.$element.after(this.footBar.$insertArea);
            }
            var obj = {};
            for (var i = 0, l = this.columns.length; i < l; i++) {
                var t = this.columns[i];
                obj[t.field] = t;
            }
            this.columns = obj;

            var _this = this;
            this.hasInit || this.tableHandle.createHead.call(this);
            if (this.requestUrl) {
                this.requestData(function () {
                    _this.hasInit || _this.bindEvent.call(_this);
                    _this.hasInit = true;
                    this.showPageLeftBar || this.footBar.$pageLeft.hide();
                    this.showPageRightBar || this.footBar.$pageRight.hide();
                });
            } else {
                if (typeof _this.beforeUpdate == 'function') {
                    _this.beforeUpdate.call(_this, this.orignalData);
                }
                this.updateData();
                this.hasInit || this.bindEvent.call(this);
                this.hasInit = true;
                this.showPageLeftBar || this.footBar.$pageLeft.hide();
                this.showPageRightBar || this.footBar.$pageRight.hide();
            }
        },
        //更新表格数据
        updateTable: function () {
            if (this.showStyle == 1) {
                this.pageNum = Math.ceil(this.data.length / this.perNum);
                // this.setIndex(this.footBar.pageIndex);
            }

            this.getData.call(this);
            this.selectedRow = this.getSelected();
            // this.footBar.pageIndex = this.footBar.pageIndex <= this.pageNum ? this.footBar.pageIndex : 1;
            this.goPage(this.footBar.pageIndex);
            this.showPageLeftBar && this.footBar.$pageLeft.find("em.page-total").text(_("%s data in total", this.data.length + ""));
        },

        //请求数据
        requestData: function (cb) {
            var _this = this;
            _this.showLoader && _this.$tbody.html('<tr><td colspan="' + _this.totalColumn + '" class="text-center">' + _("Loading data...") + '</td></tr>');

            $.ajax({
                url: this.requestUrl,
                cache: false,
                type: _this.requestType,
                dataType: "text",
                data: this.requestOpt,
                async: true,
                success: function (data, status) {
                    if (data.indexOf("login.js") > 0) {
                        //window.location.href = "login.asp";
                        top.window.location.reload();
                        return;
                    }

                    try {
                        data = JSON.parse(data);

                        _this.returnData = data;//请求返回的数据

                        if (typeof _this.beforeUpdate == 'function') {
                            _this.beforeUpdate.apply(_this, arguments);
                        }

                        _this.orignalData = _this.dataTarget ? data[_this.dataTarget] : data;
                        _this.updateData();

                        if (cb && typeof cb === 'function') {
                            cb();
                        }
                    }
                    catch (e) {
                        // console && console.log && console.log(e);
                    }
                },
                error: function (msg, status) {
                    // console && console.log && console.log(_("Data request failed!"));
                },
                complete: function (xhr) {
                    xhr = null;
                }
            });
        },

        //刷新table
        reLoad: function (data) {
            if (data) {
                this.orignalData = data;
                this.updateData();
                // if (typeof this.updateCallBack == 'function') {
                //     this.updateCallBack.apply(this, arguments);
                // }
            } else if (this.requestUrl) {
                this.requestData();
            }
            this.editData = [];
        },

        //数据二次处理
        updateData: function () {
            //对数据进行过滤
            this.filterData();
            //对数据进行排序
            this.sort();

            if (typeof this.updateCallBack == 'function') {
                this.updateCallBack.apply(this, arguments);
            }
        },
        //获取当前页数据
        getData: function () {
            if (this.showStyle === 2) {
                if (this.data && this.data instanceof Array) {
                    this.pageData = this.data;
                } else {
                    this.data = this.pageData = [];
                }
            } else {
                if (this.data && this.data instanceof Array) {
                    if (this.dataIndex >= this.data.length) {
                        this.dataIndex -= this.perNum;
                        this.footBar.pageIndex -= 1;
                    }
                    this.pageData = this.data.slice(this.dataIndex, this.dataIndex + this.perNum);
                } else {
                    this.data = this.pageData = [];
                }
            }
        },

        sort: function () {
            var _this = this;

            //进行排序
            if(_this.sortFunction){
                _this.data.sort(function(a, b){
                    return _this.sortFunction.apply(_this, arguments);
                });
            }else{
                _this.data.sort(function (a, b) {
                    return SortByProps(a, b, _this.sortFields, _this.sortOpt);
                }); 
            }

            //刷新数据,对数据进行排序时不改变数据的页数
            // _this.footBar.pageIndex = 1;
            _this.updateTable();
        },

        filterData: function () {
            this.data = [];
            if (this.filterValue && this.filterProperty && this.filterProperty.length > 0) {
                var k = this.filterProperty.length, p = this.filterProperty;
                for (var i = 0, l = this.orignalData.length; i < l; i++) {
                    var curData = this.orignalData[i];
                    for (var j = 0; j < k; j++) {
                        var curP = p [j];
                        if (curData[curP]){
                            if(curData[curP].indexOf(this.filterValue) > -1){
                                this.data.push(curData);
                                break;
                            }
                        }else if(curP.indexOf("#") > -1){//对于A#B类型的筛选字段，如A有值则按A字段查找，否则按B字段查找
                            var curps = curP.split("#");
                            if(curData[curps[0]]){
                                if(curData[curps[0]].indexOf(this.filterValue) > -1){
                                    this.data.push(curData);
                                    break;
                                }
                            }else if(curps.length > 1 && curData[curps[1]] && curData[curps[1]].indexOf(this.filterValue) > -1){
                                this.data.push(curData);
                                break;
                            }
                        }
                    }
                }
            } else {
                this.data = this.orignalData;
            }
        },

        setIndex: function (index) {
            index = index > this.pageNum ? this.pageNum : index;
            this.dataIndex = (index - 1) * this.perNum;
            this.dataIndex = this.dataIndex < 0 ? 0 : this.dataIndex;
            this.footBar.pageIndex = index;
        },

        goPage: function (pageIndex) {
            if (this.showStyle == 1) {
                this.setIndex(pageIndex);
            } else {
                this.dataIndex = 0;
                this.footBar.pageIndex = pageIndex;
            }

            this.tableHandle.createTable.call(this);
            this.updateFootBar.call(this);
        },

        tableHandle: {
            fillTable: function () {
                var _this = this;
                this.getData.call(this);
                var bodyHtml = '', dateKey = this.key, selected = 0;
                this.$thead.data("total", this.pageData.length);
                if (!!this.pageData.length) {
                    for (var i = 0, l = this.pageData.length; i < l; i++) {
                        if (_this.limit && i >= _this.limit) {
                            break;
                        }
                        var dataObj = this.pageData[i],
                            tableDataIndex = this.dataIndex + i,
                            checked = false;
                        bodyHtml += '<tr class="form-table-tr" data-id="' + dataObj[dateKey] + '" data-index="' + tableDataIndex + '" >';
                        if (this.selectedRow.indexOf(dataObj[dateKey]) > -1) {
                            checked = true;
                            selected++;
                        }
                        this.showCheckbox && (bodyHtml += '<td><input type="checkbox" data-key="' + dataObj[dateKey] + '" class="table-check check-single" ' + (checked ? "checked" : "") + '/></td>');
                        this.showIndex && (bodyHtml += '<td>' + (tableDataIndex + 1) + '</td>');
                        if (this.tHead.length > 0 && this.tHead[0]) {
                            for (var j = 0; j < this.columnCount; j++) {
                                var field = this.tHead[j],
                                    fObj = this.columns[field] || {},
                                    node = dataObj[field];

                                if (fObj && fObj.format && typeof fObj.format === "function") {
                                    node = fObj.format(node, fObj.field, dataObj);
                                }

                                var nodeTemp = dataObj[field];

                                //高亮筛选字符
                                if(_this.autoHighLight && _this.filterValue && node && _this.filterProperty.indexOf(field) > -1){
                                    node = node.replace(new RegExp(_this.filterValue, "g"), '<span  class="bold">' + _this.filterValue + '</span>');
                                }
                                //end

                                if (fObj["width"] && String(fObj["width"]).indexOf("%") === -1 && String(fObj["width"]).indexOf("px") === -1) {
                                    fObj["width"] += "px";
                                }

                                if(fObj["maxLength"] && node.length > parseInt(fObj["maxLength"])){
                                    let befNode = node ;
                                    node = node.toString().substr(0,fObj["maxLength"])+"...";
                                    bodyHtml += '<td ' + (fObj["width"] ? 'width="' + fObj["width"] + '"' : '') + 'title="'+befNode+'">' + (node || "--") + '</td>';
                                }else{
                                    bodyHtml += '<td ' + (fObj["width"] ? 'width="' + fObj["width"] + '"' : '') + '>' + (node || "--") + '</td>';
                                }

                            }
                        } else {
                            for (var j in dataObj) {

                                bodyHtml += '<td>' + (dataObj[j] || "--") + '</td>';
                            }
                        }

                        if (this.hasActionColumn) {
                            bodyHtml += '<td>';
                            var actions = this.actionColumn.actions;
                            for (var j = 0, k = actions.length; j < k; j++) {
                                var action = actions[j],
                                    css = "icon-" + action.type;

                                bodyHtml += '<i class="table-icon ' + css + '" data-key="' + dataObj[dateKey] + '" data-index="' + tableDataIndex + '" data-type="' + action.type + '"></i>'
                            }
                            bodyHtml += '</td>';
                        }

                        bodyHtml += '</tr>';

                    }
                } else {
                    bodyHtml += '<tr class="form-table-empty"><td colspan="' + _this.totalColumn + '" class="text-center nodata">' + _("No data") + '</td></tr>';
                }
                this.$thead.data("selected", selected);
                if(this.showCheckbox && selected === this.pageData.length){
                    this.$checkAll && this.$checkAll.prop('checked', true);
                }else{
                    this.$checkAll && this.$checkAll.prop('checked', false);
                }
                this.$tbody.html(bodyHtml);
            },

            createHead: function () {
                var _this = this,
                    headHtml = "",
                    $ths = this.$element.find('th');

                _this.columnCount = 0;
                if ($ths.length > 0) {
                    _this.tHead = [];
                    $ths.each(function () {
                        var $this = $(this), field = $this.attr("data-field");
                        if(_this.columns[field]){
                            _this.columns[field]["sortable"] && $this.addClass('sortabled').attr("title", _("Click to sort"));
                        }
                        _this.tHead.push(field);
                    });
                    _this.columnCount = $ths.length;
                    headHtml = this.$element.find('thead')[0].innerHTML;
                    _this.$element.find('thead').remove();
                } else {
                    _this.columnCount = 0;
                    headHtml = '<tr>';
                    for (var key in _this.columns) {
                        _this.tHead.push(key);
                        var colObj = _this.columns[key];
                        _this.columnCount++;
                        if (colObj["width"] && String(colObj["width"]).indexOf("%") === -1 && String(colObj["width"]).indexOf("px") === -1) {
                            colObj["width"] += "px";
                        }
                        headHtml += '<th data-field="' + key + '" ' + (colObj.sortable ? 'class="sortabled" title="' + _("Click to sort") + '"' : '') + (colObj["width"] ? 'width="' + colObj["width"] + '"' : "") + '>' + (colObj["title"] || key) + (colObj.sortable ? '<i class="table-sort ' + (_this.sortOpt[key] === 1 ? "asc" : "desc") + '">' : '') + '</th>';
                    }
                    headHtml += '</tr>';
                }

                _this.totalColumn = _this.columnCount;
                if (_this.showIndex) {
                    headHtml = headHtml.replace(/(<tr>)/g, '$1<th class="check">' + _("ID") + '</th>');
                    _this.totalColumn = _this.columnCount + 1;
                }

                if (_this.showCheckbox) {
                    headHtml = headHtml.replace(/(<tr>)/g, '$1<th class="check"><input type="checkbox" class="table-check check-all"/></th>');
                    _this.totalColumn = _this.columnCount + 1;
                }

                if (_this.hasActionColumn) {
                    headHtml = headHtml.replace(/(<\/tr>)/g, '<th>' + _this.actionColumn.columnName + '</th>$1');
                    _this.totalColumn = _this.columnCount + 1;
                }

                _this.$thead.html(headHtml).find("th").addClass('form-table-th').end().appendTo(_this.$element);
            },

            createTable: function () {

                this.tableHandle.fillTable.call(this);
                this.hasInit || this.render();

                for (var key in this.columns) {
                    if (this.columns.hasOwnProperty(key)) {
                        var item = this.columns[key];
                        if (item.rendered && typeof item.rendered === "function") {
                            item.rendered.call(this, item.field);
                        }
                    }
                }
            },

            refreshTable: function () {
                this.selectedRow = this.getSelected();
                this.tableHandle.fillTable.call(this);
                // this.render();
                for (var key in this.columns) {
                    if (this.columns.hasOwnProperty(key)) {
                        var item = this.columns[key];
                        if (item.rendered && typeof item.rendered === "function") {
                            item.rendered.call(this, item.field);
                        }
                    }
                }
            }
        },

        bindEvent: function () {
            var _this = this;
            this.footBar.$insertArea.off("click.FormTable").on('click.FormTable', 'a', function () {
                if (this.className.indexOf('disabled') > -1 || this.className.indexOf('active') > -1) {
                    return false;
                }
                if (this.className.indexOf('pre') > -1) {
                    _this.footBar.pageIndex = _this.footBar.pageIndex < 2 ? 1 : _this.footBar.pageIndex - 1;
                } else if (this.className.indexOf('next') > -1) {
                    _this.footBar.pageIndex = _this.footBar.pageIndex > _this.pageNum - 1 ? _this.pageNum : +_this.footBar.pageIndex + 1;
                } else {
                    _this.footBar.pageIndex = ~~(this.innerHTML);
                }
                _this.goPage(_this.footBar.pageIndex);
                return false;
            });

            //点击排序
            this.$element.off("click.FormTableHead").on("click.FormTableHead", "th.sortabled", function () {
                var $this = $(this),
                    field = $this.attr("data-field");
                if (_this.columns[field].sortCallBack) {
                    var opt = _this.columns[field].sortCallBack();
                    if (opt) {
                        field = opt.field;
                        _this.sortOpt[field] = opt.sort;
                        field && _this.sortFields.splice(_this.sortFields.indexOf(field), 1);
                    }
                } else {
                    if (_this.sortOpt[field]) {
                        _this.sortOpt[field] = _this.sortOpt[field] === 1 ? 2 : 1;
                        _this.sortFields.splice(_this.sortFields.indexOf(field), 1);
                    } else {
                        _this.sortOpt[field] = 1;
                    }

                    if (_this.sortOpt[field] !== 1) {
                        $this.children('.table-sort').addClass("desc").removeClass("asc");
                    } else {
                        $this.children('.table-sort').removeClass("desc").addClass("asc");
                    }
                }
                _this.sortFields.push(field);

                _this.sort();
            });

            //分页
            this.footBar.$insertArea.off("change.FormTable").on("change.FormTable", ".select-page", function () {
                _this.perNum = ~~(this.value);
                // console.log(_this.perNum);
                //重新渲染table
                _this.updateTable.call(_this);
                _this.changePageNumCallBack && _this.changePageNumCallBack.call(_this);
            });

            if (this.showCheckbox) {
                this.$element.off("change.FormTable").on("change.FormTable", ".table-check", function (e) {
                    _this.$checkAll = _this.$checkAll || _this.$thead.find('input.check-all');
                    if (this.className.indexOf("check-all") > -1) { //全选
                        _this.$element.children('tbody').find("input.table-check").prop("checked", this.checked);

                        if (this.checked) {
                            _this.$thead.data("selected", _this.$thead.data("total"));
                        } else {
                            _this.$thead.data("selected", 0);
                        }
                    } else if (this.className.indexOf("check-single") > -1) { //单选
                        if (this.checked) {
                            var selected = parseInt(_this.$thead.data("selected")) + 1;

                            selected == _this.$thead.data("total") && _this.$checkAll.prop("checked", true);
                            _this.$thead.data("selected", selected);
                        } else {
                            _this.$checkAll.prop("checked", false);
                            _this.$thead.data("selected", parseInt(_this.$thead.data("selected")) - 1);
                        }
                    }
                });
            }

            if (_this.hasActionColumn) {
                _this.actionCallback = {};
                for (var i = 0, len = _this.actionColumn.actions.length; i < len; i++) {
                    var action = _this.actionColumn.actions[i];
                    _this.actionCallback[action.type] = action.callback;
                }

                _this.$element.off("click.FormTable").on("click.FormTable", ".table-icon", function (event) {
                    var $this = $(this),
                        index = parseInt($this.attr("data-index")),
                        type = $this.attr("data-type");
                    
                    _this.actionCallback[type].call(this, index);
                });
            }
        },

        showBtn: function (visible) {
            if (visible === true && typeof visible == 'boolean') {
                if (this.pageNum < 2 || !this.pageData.length) {
                    this.footBar.$pageRight.hide();
                } else {
                    this.footBar.$pageRight.show();
                }
            } else {
                this.footBar.$pageRight.hide();
            }
        },

        updateFootBar: function () {
            var btnEle = '',
                btnPre = '',
                btnNext = '',
                min = 0,
                max = 0,
                btnFirst = '',
                btnLast = '';

            if (this.pageNum < this.footBar.maxIndex) {
                min = 2;
                max = this.pageNum > min ? this.pageNum - 1 : min;
            } else {
                var area = Math.ceil(this.footBar.maxIndex - 3) / 2;
                max = +this.footBar.pageIndex + area >= this.pageNum - 1 ? this.pageNum - 1 : +this.footBar.pageIndex + area;
                min = +this.footBar.pageIndex - area <= 2 ? 2 : +this.footBar.pageIndex - area;

                if (this.footBar.pageIndex - min < area) { //如果最小值按钮个数不够，则从最大值那边添数
                    max = (max + area - (this.footBar.pageIndex - min)) >= this.pageNum - 1 ? this.pageNum - 1 : +max + area - (this.footBar.pageIndex - min);
                } else if (max - this.footBar.pageIndex < area) {
                    min = (min - area + (max - this.footBar.pageIndex)) <= 2 ? 2 : min - area + (max - this.footBar.pageIndex);
                }
            }

            if (min <= max && min < this.pageNum) {
                for (var i = min; i <= max; i++) {
                    if (i != this.footBar.pageIndex) {
                        btnEle += '<a class="btn-page">' + i + '</a>';
                    } else {
                        btnEle += '<a class="btn-page active">' + i + '</a>';
                    }
                }
            }

            if (this.footBar.pageIndex == 1) {
                btnFirst = '<a class="btn-page active">1</a>';
                btnLast = '<a class="btn-page">' + this.pageNum + '</a>';
            } else if (this.footBar.pageIndex == this.pageNum) {
                btnFirst = '<a class="btn-page">1</a>';
                btnLast = '<a class="btn-page active">' + this.pageNum + '</a>';
            } else {
                btnFirst = '<a class="btn-page">1</a>';
                btnLast = '<a class="btn-page">' + this.pageNum + '</a>';
            }

            if (min > 2) {
                btnFirst += this.footBar.hiddenInfo;
            }
            if (max < this.pageNum - 1) {
                btnLast = this.footBar.hiddenInfo + btnLast;
            }

            var rightHtml = [];
            rightHtml.push('<div class="page-right">');
            rightHtml.push('<a class="btn-page pre ' + (this.footBar.pageIndex == 1 ? 'disabled" disabled="disabled"' : '"') + '>' + _("Previous") + '</a>');
            rightHtml.push(btnFirst);
            rightHtml.push(btnEle);
            rightHtml.push(btnLast);
            rightHtml.push('<a class="btn-page next ' + (this.footBar.pageIndex == this.pageNum ? 'disabled" disabled="disabled"' : '"') + '">' + _("Next ") + '</a>');
            rightHtml.push('</div>');
            this.footBar.$pageRight = $(rightHtml.join(""));

            if (!this.hasInit) {
                var leftHtml = [];

                var select = '<select class="select-page">';
                for (var i = 0, l = this.perArray.length; i < l; i++) {
                    var count = this.perArray[i];
                    select += '<option value="' + count + '" ' + (count === this.perNum ? 'selected' : '') + '>' + count + '</option>';
                }
                select += '</select>';
                
                leftHtml.push('<div class="page-left">' + _('data/Page %s,', select));

                // leftHtml.push(select);
                leftHtml.push('<em class="page-total">' + _("%s data in total", this.data.length + "") + '</em>');
                leftHtml.push('</div>');
                this.footBar.$pageLeft = $(leftHtml.join(""));
                this.footBar.$insertArea.html(this.footBar.$pageLeft).append(this.footBar.$pageRight);
            } else {
                this.footBar.$insertArea.children('.page-right').replaceWith(this.footBar.$pageRight);
            }

            this.footBar.$insertArea.find('input').val(this.footBar.pageIndex);
            this.showBtn.call(this, true);
        },

        render: function () {
            this.$element.append(this.$tbody);
        },

        //以下为调用者可操作的方法
        getSelected: function () {
            var index = [];
            this.$tbody.find('input.table-check:checked').each(function (argument) {
                index.push(parseInt($(this).attr("data-key")));
            });
            return index;
        },

        deleteRow: function (index) {
            if (index) {
                if (Object.prototype.toString.call(index) === "[object Array]") {
                    for (var i = 0, l = index.length; i < l; i++) {
                        this.data.splice(index[i], 1);
                    }
                } else {
                    this.data.splice(index, 1);
                }
                this.updateTable();
            }
        },

        addRow: function (data) {
            if (!data || typeof data != "object") {
                return;
            }

            if (Object.prototype.toString.call(data) === "[object Object]") {
                this.data.unshift(data);
            } else if (Object.prototype.toString.call(data) === "[object Array]") {
                this.data = data.concat(this.data);
            }

            this.updateData();
        },

        getValue: function () {
            return this.data;
        },

        addEditData: function (index, field, value) {
            var data = this.data[index],
                index = data[this.key] || index;
            if (!this.editData[index]) {
                this.editData[index] = {};
                this.editData[index][this.key] = index;
                for (var i = 0, l = this.editColumn.length; i < l; i++) {
                    var key = this.editColumn[i];
                    this.editData[index][key] = data[key];
                }
            }
            this.editData[index][field] = value;
        },

        getEditData: function () {
            var data = [];
            for (var key in this.editData) {
                if (this.editData.hasOwnProperty(key)) {
                    data.push(this.editData[key]);
                }
            }
            return data;
        },

        updatRow: function (index, dataObj) {
            if (this.data.length <= index || !dataObj) {
                return;
            }

            $extend(this.data[index], dataObj);
        },

        getDataIndex: function (tar) {
            if (tar) {
                return parseInt($(tar).closest('tr.form-table-tr').attr("data-index"));
            }
            return -1;
        },

        setRowState: function (index, disabledColumn) {
        },

        //如果自定义列有改变当前单元格的值，则在回调函数中必需返回修改后值的key:value键值对
        //用以更新列表的数据，若无返回值，则不发同步更新数据
        //只能给当前的列元素绑定事件
        addEvent: function (eventName, eventTarget, callback) {
            var _this = this;
            eventName += ".FormTableScr";
            _this.$element.off(eventName).on(eventName, eventTarget, function () {
                if (callback) {
                    var index = _this.getDataIndex(this);
                    var obj = callback();
                    obj && _this.updatRow(index, obj);
                }
            });
        },

        hide:function(){
            this.$element.hide();
            this.footBar.$insertArea.hide();
        },
        show:function(){
            this.$element.show();
            this.footBar.$insertArea.show();
        }
    };

    $.fn.FormTable = function (opt) {
        var args = Array.prototype.slice.call(arguments, 1),
            outData, formtable;

        this.each(function () {
            var $this = $(this);
            formtable = $this.data("formtable");
            if (formtable && opt && typeof opt === "string") {
                if (formtable[opt]) {
                    outData = formtable[opt].apply(formtable, args)
                }

            } else {
                if (formtable) {
                    formtable.footBar.$insertArea.remove && formtable.footBar.$insertArea.remove();
                    opt = $.extend({}, formtable.defaultOption, opt);
                }
                formtable = new FormTable($this, opt);
                $this.data('formtable', formtable);
            }
        });
        if (outData) {
            return outData;
        }
        return formtable;
    }

    $.fn.TablePage = $.fn.FormTable;

    function SortByProps(item1, item2, fields, options) {
        "use strict";

        var cps = []; // 存储排序属性比较结果。

        var asc = true; //升序

        if (fields && fields.length > 0) {
            for (var i = fields.length; i > -1 ; i--) {
                var prop = fields[i];
                asc = options[prop] === 1;

                if (item1[prop] > item2[prop]) {
                    cps.push(asc ? 1 : -1);
                    break; // 大于时跳出循环。
                } else if (item1[prop] === item2[prop]) {
                    cps.push(0);
                } else {
                    cps.push(asc ? -1 : 1);
                    break; // 小于时跳出循环。
                }
            }
        }

        for (var j = 0; j < cps.length; j++) {
            if (cps[j] === 1 || cps[j] === -1) {
                return cps[j];
            }
        }
        return 0;
    }
}(jQuery));