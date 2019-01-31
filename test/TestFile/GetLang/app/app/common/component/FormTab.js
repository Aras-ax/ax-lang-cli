import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormTab"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($, undefined){
	$.fn.FormTab = function(){
	    return $.renderComponent.call(this, arguments, "FormTab");
	}

	// 构造函数
    $.components.FormTab = function (element, options) {
        $.components.FormTab.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        selectArray:[],
        theme:'line-theme'//bg-theme,line-theme
    }

    $.components.FormTab.inherit($.BaseComponent, {
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

            this.setValue(this.value);
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
            //渲染结构
            this.$element.addClass('formtab ' + this.option.theme);
            var selectArray = this.option.selectArray, nodes ="";
            if(Object.prototype.toString.call(selectArray) === "[object Array]"){
                for(var i=0,len = selectArray.length; i<len;i++){
                    nodes += '<a class="btn-tab" data-value="' + selectArray[i] + '">' + selectArray[i] + '</a>';
                }
            }else if(Object.prototype.toString.call(selectArray) === "[object Object]"){
                for(var key in selectArray){
                    nodes += '<a class="btn-tab" data-value="' + key + '">' + selectArray[key] + '</a>';
                }
            }
            this.$element.append(nodes);
            this.$element.children("a:last").addClass('last').end().children('a:first').addClass('first');
        },

        //绑定事件
        bindEvent: function () {
            //事件绑定
            var _this = this        
            this.$element.off("click.FormTab").on("click.FormTab", ".btn-tab", function(){
                var $this = $(this);
                if($(this).hasClass('active')){
                    return false;
                }

                _this.$element.children('.btn-tab').removeClass('active');
                $this.addClass('active');

                _this.value = $this.attr("data-value");
                _this.valChange(this.value);
            });
        },

        //设置值
        setValue: function (v, confirm) {
            if (v == null) return;
            this.value = v;
            this.$element.children('.btn-tab').removeClass('active').end().find(".btn-tab[data-value='" + v + "']").addClass('active');
            confirm && this.valChange(this.value);
        },

        getValue: function () {
            return this.value;
        },

        getText: function () {
            return this.getValue();
        }
    });
}(jQuery));