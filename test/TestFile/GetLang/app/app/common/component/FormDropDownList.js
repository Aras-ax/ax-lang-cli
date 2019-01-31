import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormDropDownList"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($, undefined){
    $.fn.FormDropDownList = function(){
        return $.renderComponent.call(this, arguments, "FormDropDownList");
    }

    // 构造函数
    $.components.FormDropDownList = function (element, options) {
        $.components.FormDropDownList.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        selectArray:[],
        dataOptions:[],//[{type:"",args:[]}]
        clickCallBack:null,//下拉框展开回调
        showSelfText:false,//显示自定义值，可以不是配置的下拉选型值
        customText:"", //若该字段不为空，则表示有自定义选项
        focusCallBack:null //自定义情况下文本框获取焦点回调函数
    }

    $.components.FormDropDownList.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function () {
            //是否可见
            if (!this.visible) { 
                this.$wrap.hide(); 
                return; 
            }

            this.option = $.extend({}, DEFAULT, this.option);

            this.items = this.option.selectArray;
            this.hasCustom = !!this.option.customText;
            this.setDefaultValue();
            
            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if ($.isNotNullOrEmpty(this.value) || this.option.showSelfText) {
                this.setValue(this.value);
            }
        },

        setDefaultValue: function(){
            if(!$.isNotNullOrEmpty(this.option.defaultValue)){
                if(Object.prototype.toString.call(this.items) === "[object Array]"){
                    this.items.length > 0 && (this.option.defaultValue = this.items[0]);
                }else if(Object.prototype.toString.call(this.items) === "[object Object]"){
                    for(var key in this.items){
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
                this.$body.addClass('dropdownlist');

                this.$element.addClass("drop-handle form-control");
                var nodes = '<div class="drop-text-wrap">' +
                                '<span class="drop-text"></span>' + 
                                '<input type="text" class="drop-input none"/>' + 
                            '</div>';

                this.$DropHandle = $(nodes).appendTo(this.$element);
                this.$element.append('<span class="drop-btn"></span>');
                this.$DropList = $('<ul class="drop-list"></ul>').appendTo(this.$body);
                this.$DropText = this.$DropHandle.find('.drop-text');
                this.renderOptions();
            }
        },

        renderOptions: function () {
            var that = this;
            that.$DropList.html("");
            if(Object.prototype.toString.call(this.items) === "[object Array]"){
                var items = {};
                for(var i = 0, l= this.items.length; i<l; i++){
                    var item = this.items[i];
                    items[item] = item;
                }
                this.items = items;
            }
            for(var key in this.items ){
                if(this.items.hasOwnProperty(key)){
                    that.$DropList.append('<li class="dropdownlist-item ' + (that.defaultValue == key ? 'active' : "") 
                        + '" data-value="' + key + '"><a class="drop-item-btn">' + that.items[key] + '</a></li>');
                }
            }
            if(that.hasCustom){
                that.$DropList.append('<li class="dropdownlist-item text-item"><a class="drop-item-btn">' 
                    + that.option.customText + '</a></li>');
            }
            this.dropInput = this.$DropHandle.find(".drop-input").Rcomponent({
                dataField:that.dataField,
                dataKey:"FormInput",
                dataValueType: that.option.dataValueType,
                dataOptions:that.option.dataOptions,
                validateCustom:function(text){
                    if(text){
                        that.addValidateText(text);
                    }else{
                        that.removeValidateText();
                    }
                },
                validateCallBack:that.option.validateCallBack,
                changeCallBack:function(){
                    that.value = this.value; 
                    that.setValue(that.value, true);
                    // that.valChange();
                },
                focusCallBack:function(){
                    that.option.focusCallBack && that.option.focusCallBack();
                }
            });
            this.dropInput.hide();
            this.$DropHandle.find(".drop-input").removeClass('none');

            that.$DropList.css("min-width", that.$element.outerWidth());
        },

        //绑定事件
        bindEvent: function () {
            var that = this;
            that.$element.off("click.dropdownlist").on('click.dropdownlist', ".drop-text,.drop-btn", 
                function (e) {
                    if(that.$element.hasClass('disabled')){
                        return false;
                    }

                    that.getWidthAndHeight();
                    that.getWrapHeightWidth();
                    var $Tar = that.$DropList;
                    $("ul.drop-list").not($Tar).hide();
                    that.option.clickCallBack && that.option.clickCallBack();

                    if(!$Tar.is(':visible')){
                        var position = that.$DropHandle.offset();
                        if(position.top + that.h > that.windowH -40){
                            that.$DropList.addClass('top');
                        }else{
                            that.$DropList.removeClass('top');
                        }
                    }

                    $Tar.toggle();
                    return false;
                }
            );

            that.$DropList.off("click.dropdownlist").on("click.dropdownlist", ".dropdownlist-item", 
                function () {
                    var $this = $(this);
                    that.option.showSelfText = false;
                    if ($this.hasClass("active")) {
                        if($this.hasClass('text-item')){
                            // that.dropInput.$element.focus();
                            that.dropInput.focus();
                        }
                        return;
                    }
                    $this.addClass("active").siblings(".dropdownlist-item").removeClass("active");
                    //点击自定义选项
                    if($this.hasClass('text-item')){
                        that.switchDisplay(true);
                        // that.dropInput.$element.focus();
                        that.dropInput.focus();
                    }else{
                        that.setValue.apply(that, [$this.attr("data-value")]);
                        that.switchDisplay(false);
                        that.valChange.call(that);
                    }
                    that.$DropList.hide();
                    return false;
                }
            );

            $(document).unbind("click.dropdownlist-cl").bind("click.dropdownlist-cl", function () {
                $("ul.drop-list").hide();
            });
        },

        //设置值
        setValue: function (val, confirm) { 
            this.$DropList.children('.dropdownlist-item').removeClass("active");
            if(this.option.showSelfText){
                this.$DropText.text(this.option.showSelfText).attr("title", this.option.showSelfText);
                this.switchDisplay(false); 
            }
            else if(this.items[val]){
                this.$DropText.text(this.items[val]).attr("title", this.items[val]);
                this.$DropList.find("li[data-value=" + val + "]").addClass('active');
                this.switchDisplay(false);  
            }else{
                this.switchDisplay(true);
                this.$DropList.find(".text-item").addClass('active');
            }
            this.dropInput && this.dropInput.setValue(val);   
            this.value = val;

            confirm && this.valChange();
        },

        setDisabled:function(type){
            if(type){
                this.$element.addClass('disabled');
            }else{
                this.$element.removeClass('disabled');
            }
        },

        // setTextValue:function(text, disabled){
        //     this.switchDisplay(false);
        //     this.$DropList.children('.dropdownlist-item').removeClass("active");
        //     this.$DropText.text(text);
        //     if(disabled){
        //         this.$element.addClass('disabled');
        //     }else{
        //         this.$element.removeClass('disabled');
        //     }
        // },

        switchDisplay:function(type){
            if(type){
                this.$DropText.hide();
                this.dropInput.show();
            }else{
                this.$DropText.show();
                this.dropInput.hide();
            }
        },

        getValue: function () {
            if (!this.editable) {
                var v = this.value;
                return v==null?"":v;
            }
            else {
                return this.value;
            }
        },

        getText: function () {
            return this.getValue();
        },

        refresh: function () {
        },

        getWidthAndHeight:function(){
            this.h = this.$DropList.outerHeight();
            this.w = this.$DropList.outerWidth();
        },

        getWrapHeightWidth:function(){
            // if(!this.windowH){
                var $tar = this.$DropList.closest('.md-con-body');
                if($tar.length == 0){
                    $tar = $("body");
                }
                this.windowW = $tar.width();
                this.windowH = $tar.height();
            // }
        },

        addItem: function (value, text) {
            var that = this;
            that.$DropList.append('<li class="dropdownlist-item" data-value="' + value 
                + '"><a class="drop-item-btn">' + text + '</a></li>');

            that.getWidthAndHeight();
        },

        clearItems: function () {
            this.$DropText.html("");
            this.$DropList.children("li.dropdownlist-item").removeClass("active");

            that.getWidthAndHeight();
        }
    });
}(jQuery));
