import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <div type="text" data-key="FormMultiInput"></div>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($, undefined){
	$.fn.FormMultiInput = function(){
	    return $.renderComponent.call(this, arguments, "FormMultiInput");
	}

	// 构造函数
    $.components.FormMultiInput = function (element, options) {
        $.components.FormMultiInput.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        text: "", //文本框前面显示的数据，该数据最后会与input内部的数据合并成组件的value值
        inputCfg: [], //文本输入框的的配置信息，必须为数组
        inputCount:0, //文本框的格式 inputCfg/inputCount中有一个必填
        joiner:".", //连接符号
        unique: null    //自定义连接符[]
    }

    $.components.FormMultiInput.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            this.option = $.extend({}, DEFAULT, this.option);
            
            this.option.inputCount = this.option.inputCount || this.option.inputCfg.length;
            
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
                var htmlNode = "", text = this.option.text;
                if(this.option.joiner && text && text.lastIndexOf(this.option.joiner) === text.length - 1){
                    this.option.text = text = text.substring(0, text.length-1);
                }
                if(text){
                    htmlNode += '<label id="form-multi-text">' + text + this.option.joiner + '</label>';
                }
                htmlNode += '<div class="form-multi-wrap">';
                if(this.option.unique) {
                    for(var i = 0 , l = this.option.inputCount; i < l; i++){
                        htmlNode += '<input type="text" data-field="' + this.dataField + i + '" data-key="FormInput">' + this.option.unique[i];
                    }
                }else {
                   for(var i = 0 , l = this.option.inputCount; i < l; i++){
                       htmlNode += (i === 0 ? '' : this.option.joiner) + '<input type="text" data-field="' + this.dataField + i + '" data-key="FormInput">';
                   } 
                }
                
                htmlNode += "</div>";

                this.$element.addClass("form-multi").html(htmlNode);
                this.$inputWrap = this.$element.find(".form-multi-wrap");
                this.$inputText = this.$element.find(".form-multi-text");

                this.initComponents();
            }
        },

        initComponents: function(){
            var formCfg = {}, that = this;
            for(var i = 0, l = this.option.inputCount; i < l; i++){
                var obj = {
                    css:"form-multi-input error-in-top",
                    needWrap: false,
                   validateCallBack: function(){
                       that.getValue.call(that);
                       that.handleValidateEvents.call(that);
                   },
                   changeCallBack: function(){
                        that.handleChangeEvents.call(that);
                   }
                }

                formCfg[this.dataField + i] = $.extend({}, obj, this.option.inputCfg[i] || {});
            }
            this.cManager = $.componentManager({submitUrl:"/goform/module",
                container: this.$inputWrap,
                formCfg: formCfg
            });
        },

        //绑定事件
        bindEvent: function () {
            //事件绑定
            //数据改变时调用基类的valChange方法执行自定义业务逻辑
        },

        //数据验证
        validate: function () {
            var v = this.cManager.validate();
            return v;
            //自身业务逻辑-end 
        },

        //设置值
        setValue: function (v, confirm) {
            if (v == null) return;
            var v = v.split(this.option.joiner).reverse(), data = {};
            for(var i = this.option.inputCount - 1, l = v.length -1; i > -1; i--, l--){
                data[this.dataField + i] = v.shift();
            }

            if(this.option.text){
                this.option.text = v.reverse().join(this.option.joiner);
                this.$inputText.text(this.option.text);
            }

            this.cManager.updateComponents(data);
            confirm && this.valChange();
        },

        getValue: function () {
            var v = this.option.text ? [this.option.text] : [],
                cmv = this.cManager.getValue();
            for(var i = 0, l = this.option.inputCount; i < l; i++){
                v.push(cmv[this.dataField + i]);
            }
            this.value = v.join(this.option.joiner);
      
            return this.value;
        },

        getText: function () {
            return this.getValue();
        }
    });
}(jQuery));