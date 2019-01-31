import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormRadioList"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($, undefined){
	$.fn.FormRadioList = function(){
	    return $.renderComponent.call(this, arguments, "FormRadioList");
	}

	// 构造函数
    $.components.FormRadioList = function (element, options) {
        $.components.FormRadioList.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项 
    // // checkArray:[]/{}
    var DEFAULT = {
        selectArray:[]
    }

    $.components.FormRadioList.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            //是否可见
            if (!this.visible) { 
                this.$wrap.hide(); 
                return; 
            }

            this.option = $.extend({}, DEFAULT, this.option);
            this.setDefaultValue();
            
            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if ($.isNotNullOrEmpty(this.value)) {
                this.setValue(this.value);
            }
        },
        
        setDefaultValue: function(){
            if(!$.isNotNullOrEmpty(this.option.defaultValue)){
                var items = this.option.selectArray;
                if(Object.prototype.toString.call(items) === "[object Array]"){
                    items.length > 0 && (this.option.defaultValue = items[0]);
                }else if(Object.prototype.toString.call(items) === "[object Object]"){
                    for(var key in items){
                        this.option.defaultValue = key;
                    }
                }
            }
            this.value = this.option.defaultValue;
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
                    radios = [];
                if(Object.prototype.toString.call(arr) === "[object Array]"){
                    var name = $.IGuid();
                    for(var i=0, len= arr.length; i<len; i++){
                        var item = arr[i],
                            id = this.dataField + $.IGuid();
                            
                        radios.push('<label for="' + id + '" class="form-label"><input type="radio" id="' + id + '" name="'+name+'" class="form-radiolist" value="' + item + '"/>'+ item +'</label>');
                    }
                }else if(Object.prototype.toString.call(arr) === "[object Object]"){
                    var name = $.IGuid();
                    for(var key in arr){
                        if(arr.hasOwnProperty(key)){
                            var item = arr[key],
                                id = this.dataField + $.IGuid();
                            radios.push('<label for="' + id + '" class="form-label"><input type="radio" id="' + id + '" name="'+name+'" class="form-radiolist" value="' + key + '"/>'+ item +'</label>');
                        }
                    }
                }
                this.$element.append(radios.join(''));
            }
        },

        //绑定事件
        bindEvent: function () {
            var _this = this;
            //事件绑定
            this.$element.off("change.formRadioList").on("change.formRadioList", ".form-radiolist", function(e){
                _this.valChange.call(_this);
            });
        },

        // //数据验证
        // validate: function () {
        //     //
        // },

        update:function(){
            var arr = this.option.selectArray, 
                radios = [];
            if(Object.prototype.toString.call(arr) === "[object Array]"){
                for(var i=0, len= arr.length; i<len; i++){
                    var item = arr[i],
                        id = this.dataField + item;
                        
                    radios.push('<label for="' + id + '" class="form-label"><input type="radio" id="' + id + '" name="'+this.dataField+'" class="form-radiolist" value="' + item + '"/>'+ item +'</label>');
                }
            }else if(Object.prototype.toString.call(arr) === "[object Object]"){
                for(var key in arr){
                    if(arr.hasOwnProperty(key)){
                        var item = arr[key],
                            id = this.dataField + key;
                        radios.push('<label for="' + id + '" class="form-label"><input type="radio" id="' + id + '" name="'+this.dataField+'" class="form-radiolist" value="' + key + '"/>'+ item +'</label>');
                    }
                }
            }
            this.$element.html("").append(radios.join(''));
            this.setValue(this.value);
        },

        addItem:function(key, value){
            var arr = this.option.selectArray,
                type = Object.prototype.toString.call(arr),  
                argType = Object.prototype.toString.call(key);

            if(type === "[object Array]"){
                if(argType != "[object Object]"){
                    this.option.selectArray = arr.concat(key);
                }else{
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
                type = Object.prototype.toString.call(arr),
                val = this.value;
                
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
                if(arr.indexOf(val) === -1 && arr.length > 0){
                    val = arr[0];
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
                if(typeof arr[val] === "undefined"){
                    for(var key in arr){
                        val = key;
                        break;
                    }
                }
            }

            this.update();
            this.setValue(val);
        },

        //设置值
        setValue: function (v, confirm) {
            // if (v == null) return;
            this.value = (v + "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if (!this.editable) {
                this.$element.text(this.value);
            }
            else {
                var inputs = this.$element.find('input');
                inputs.prop("checked", false);
                inputs.each(function(){
                    if(v == this.value){
                        this.checked = true;
                        return false;
                    }
                });
            }
            confirm && this.valChange();
        },

        getValue: function () {
            if (this.editable) {
                var val = this.$element.find('input[type="radio"]:checked').val();
                this.value = val;
            }
            return this.value;
        }
    });
}(jQuery));