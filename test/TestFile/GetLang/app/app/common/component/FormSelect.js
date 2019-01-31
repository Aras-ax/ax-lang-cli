import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormSelect"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($, undefined){
	$.fn.FormSelect = function(){
	    return $.renderComponent.call(this, arguments, "FormSelect");
	}

	// 构造函数
    $.components.FormSelect = function (element, options) {
        $.components.FormSelect.Base.constructor.call(this, element, options);
    };

    // 继承及控件实现
    // optionp配置项{
    //     selectArray:[]/{}, select选择项，可以为数组或者object
    //     hasNullItem:bool, 是否包含空选择项
    //     nullText:string, 空选择项显示文本
    // }
    
    var DEFAULT = {
        selectArray:[],
        hasNullItem:false,
        nullText:''
    }

    $.components.FormSelect.inherit($.BaseComponent, {
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

            //Error:新建的话，可以制作默认值 ，非新建设置值加载的值
            
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
                // this.$element = $('<select name="' + this.dataField + '" class="form-select"/>').appendTo(this.$body);
                this.$element.attr("name", this.dataField).addClass('form-select');
                var options = [],
                    arr = this.option.selectArray;
                this.option.hasNullItem && options.push('<option value="">' + this.option.nullText + '</option>');
                if(Object.prototype.toString.call(arr) === "[object Array]"){
                    for(var i = 0,len = arr.length; i<len;i++){
                        options.push('<option value="' + arr[i] + '" ' + (this.value==arr[i] ? "selected" : "") + '>' + arr[i] + '</option>');
                    }
                }else if(Object.prototype.toString.call(arr) === "[object Object]"){
                    for(var key in arr){
                        options.push('<option value="' + key + '"' + (this.value==key ? "selected" : "") + '>' + arr[key] + '</option>');
                    }
                }
                this.$element.append(options.join(""));
            }
        },

        update:function(){
             this.$element.html("");
            var options = [],
                arr = this.option.selectArray;
            this.option.hasNullItem && options.push('<option value="">' + this.option.nullText + '</option>');
            if(Object.prototype.toString.call(arr) === "[object Array]"){
                for(var i=0,len = arr.length; i<len;i++){
                    options.push('<option value="' + arr[i] + '"' + (this.value==arr[i] ? "selected" : "") + '>' + arr[i] + '</option>');
                }
            }else if(Object.prototype.toString.call(arr) === "[object Object]"){
                for(var key in arr){
                    options.push('<option value="' + key + '"' + (this.value==key ? "selected" : "") + '>' + arr[key] + '</option>');
                }
            }
            this.$element.append(options.join(""));
            this.getValue();
        },

        //绑定事件
        bindEvent: function () {
            var _this = this;
            
            _this.$element.off("change.formSelect").on("change.formSelect", function(e){
                _this.valChange.call(_this);
                return false;
            });
        },

        addItem:function(key){//string, array,object
            if(!key) return;
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

        removeItem:function(key){//string, array
            var arr = this.option.selectArray,
                type = Object.prototype.toString.call(arr);
            if(key === undefined) return;
            if(type === "[object Array]"){
                if(arr.indexOf(key) > -1){
                    arr.splice(arr.indexOf(key), 1);
                }else if(Object.prototype.toString.call(key) === "[object Array]"){
                    for(var i = 0,l = key.length;i<l;i++){
                        var index = arr.indexOf(key[i]);
                        index >-1 && arr.splice( index, 1);
                    }
                }
            }else if(type === "[object Object]"){
                if(arr[key]){
                    delete arr[key];
                }else if(Object.prototype.toString.call(key) === "[object Array]"){
                    for(var i = 0,l = key.length;i<l;i++){
                        var t = key[i];
                        delete arr[t];
                    }
                }
            }
            this.update();
        },

        //设置值
        setValue: function (v, confirm) {
            // if (v == null) return;
            this.value = v;
            this.format();

            if (!this.editable) {
                this.$element.text(this.value);
            }
            else {
                this.$element.val(v);
            }
            confirm && this.valChange();
        },

        getValue: function () {
            if (!this.editable) {
                var v = this.value;
                this.value = v==null?"":v;
            }
            else {
                this.value =  this.$element.val();
            }

            this.format();
            return this.value;
        },

        getText: function () {
            return this.getValue();
        }
    });
}(jQuery));