import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormCheckList"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($, undefined){
	$.fn.FormCheckList = function(){
	    return $.renderComponent.call(this, arguments, "FormCheckList");
	}

	// 构造函数
    $.components.FormCheckList = function (element, options) {
        $.components.FormCheckList.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    // selectArray:[]/{}
    var DEFAULT = {
        selectArray:[]
    }

    $.components.FormCheckList.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            //是否可见
            if (!this.visible) { 
                this.$wrap.hide(); 
                return; 
            }

            this.option = $.extend({}, DEFAULT, this.option);
            this.value = this.option.defaultValue;
            
            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if (this.value) {
                this.setValue(this.value);
            }
        },

        //渲染html内容
        htmlRender: function () {
            if (!this.editable) {
                this.$element.attr("disabled","disabled").addClass('form-disabled');
            }
            else {
                // this.$element = $('<div class="form-container">').appendTo(this.$body);
                this.$element.addClass('form-container');
                var arr = this.option.selectArray, 
                    checkboxs = [];
                if(Object.prototype.toString.call(arr) === "[object Array]"){
                    for(var i=0, len= arr.length; i<len; i++){
                        var item = arr[i],
                            id = this.dataField + item;
                            
                        checkboxs.push('<label for="' + id + '" class="form-label"><input type="checkbox" id="' + id + '" class="form-checklist" value="' + item + '"/>'+ item +'</label>');
                    }
                }else if(Object.prototype.toString.call(arr) === "[object Object]"){
                    for(var key in arr){
                        if(arr.hasOwnProperty(key)){
                            var item = arr[key],
                                id = this.dataField + key;
                            checkboxs.push('<label for="' + id + '" class="form-label"><input type="checkbox" id="' + id + '" class="form-checklist" value="' + key + '"/>'+ item +'</label>');
                        }
                    }
                }
                this.$element.append(checkboxs.join(''));
            }
        },

        //绑定事件
        bindEvent: function () {
            var _this = this;
            //事件绑定
            this.$element.off("change.formCheckList").on("change.formCheckList", ".form-checklist", function(e){
                _this.valChange.call(_this);
            });
        },

        // //数据验证
        // validate: function () {
        // },

        update:function(){
            var arr = this.option.selectArray, 
                checkboxs = [];
            if(Object.prototype.toString.call(arr) === "[object Array]"){
                for(var i=0, len= arr.length; i<len; i++){
                    var item = arr[i],
                        id = this.dataField + item;
                        
                    checkboxs.push('<label for="' + id + '" class="form-label"><input type="checkbox" id="' + id + '" name="'+this.dataField+'" class="form-checklist" value="' + item + '"/>'+ item +'</label>');
                }
            }else if(Object.prototype.toString.call(arr) === "[object Object]"){
                for(var key in arr){
                    if(arr.hasOwnProperty(key)){
                        var item = arr[key],
                            id = this.dataField + key;
                        checkboxs.push('<label for="' + id + '" class="form-label"><input type="checkbox" id="' + id + '" name="'+this.dataField+'" class="form-checklist" value="' + key + '"/>'+ item +'</label>');
                    }
                }
            }
            this.$element.html("").append(checkboxs.join(''));
            this.setValue(this.value);
        },

        addItem:function(key){
            if(!key) return;

            var arr = this.option.selectArray,
                type = Object.prototype.toString.call(arr),
                argType = Object.prototype.toString.call(key);

            if(type === "[object Array]"){
                if(argType != "[object Object]"){
                    this.option.selectArray = arr.concat(key);
                }else {
                    for(var k in key){
                        key.hasOwnProperty(k) && arr.push(k);
                    }
                }
            }
            else{
                if(argType === "[object Array]"){
                    for(var i = 0, l = key.length; i<l;i++){
                        arr[key[i]] = key[i];
                    }
                }else if(argType === "[object Object]"){
                    $.extend(arr, key);
                }
                else{    
                    arr[key] = key;
                }
            }
            this.update();
        },

        removeItem:function(key){
            var arr = this.option.selectArray,
                type = Object.prototype.toString.call(arr);
            
            if(type === "[object Array]"){
                if(typeof key !== "object"){
                    arr.splice(arr.indexOf(key), 1);
                    $("#"+this.dataField+key).parent('label').remove();
                }else if(Object.prototype.toString.call(key) === "[object Array]"){
                    for(var i = 0,l = key.length;i<l;i++){
                        var index = arr.indexOf(key[i]);
                        if(index >-1){
                            $("#"+this.dataField+key[i]).parent('label').remove();
                            arr.splice( index, 1);
                        } 
                    }
                }
            }else if(type === "[object Object]"){
                if(typeof key !== "object"){
                    delete arr[key];
                    $("#"+this.dataField+key).parent('label').remove();
                }else if(Object.prototype.toString.call(key) === "[object Array]"){
                    for(var i = 0,l = key.length;i<l;i++){
                        var t = key[i];
                        delete arr[t];
                        $("#" + this.dataField + t).parent('label').remove();
                    }
                }
            }

            this.update();
        },

        //设置值
        //v为以;隔开的字符串
        setValue: function (v, confirm) {
            // if (v == null) return;
            this.value = (v + "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            if (!this.editable) {
                this.$element.text(this.value);
            }
            else {
                v += ""; 
                v = v.split(";");
                var inputs = this.$element.find('input');
                inputs.prop("checked", false);
                inputs.each(function(){
                    if(v.indexOf(this.value) > -1){
                        this.checked = true;
                    }
                });
            }
            confirm && this.valChange();
        },

        getValue: function () {
            if (this.editable) {
                var val = [];
                this.$element.find("input").each(function () {
                    if (this.checked) {
                        val.push(this.value);
                    }
                });
                this.value = val.join(";");
            }
            return this.value;
        }
    });
}(jQuery));