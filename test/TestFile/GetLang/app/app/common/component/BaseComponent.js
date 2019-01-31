import jQuery from 'jquery';
//依赖jQuery
(function($, undefined){
	$.components = {};
}(jQuery));

/**
 * 组件基类
 * 未特别说明的参数为非必填
 * 所有驼峰写法的属性，写在标签属性上时用-连接（即:dataTitle -> data-title）,因为标签属性不区分大小写
 * 所有标签上面配置的属性值的优先级都大于以参数形式定义的属性值
 */

(function($, undefined){
	//以下为默认配置参数
	var DEFAULT = {
			dataKey:"", //组件类型 必填
			dataField:"", //组件对应的字段（为空时为自动为其生成一个GUID作为字段名），但在ComponmentManager中使用时最好为必填，便于单个组件操作
			dataTitle:"", //组件左侧显示标题
			editable:true, //是否可编辑
			visible:true, //是否可见
			ignore:false, //是否忽略组件，true时则不进行该组件取值操作
			css:'', //自定义css样式
			needWrap: true, //组件最外层是否需要容器包裹，若有dataTitle则该值默认为true
			required:true, //是否必填
			sync: true, //表示隐藏组件与补在进行校验是否同步设置，true:表示同步设置visible和ignore的值
			autoValidate:true, //是否自动进行数据校验
			defaultValue:"", //默认值
			description:"", //描述信息
			dataValueType:"string",//bool,num,float(input组件则含有其它数据校验格式值)
			validateCustom:null,//自定义错误信息提示方式，定义了该参数则不会显示默认的错误提示样式
			changeCallBack:null,//组件值改变回调函数，只有数据校验成功的情况下才执行该回调，函数内部this指向当前组件实例
			validateCallBack:null,//数据校验回调函数,有错则返回出错语句，否则为校验成功，函数内部this指向当前组件实例
			afterChangeCallBack:null,
			renderedCallBack:null //组件渲染完成后的回调函数，函数内部this指向当前组件实例
		}

	$.BaseComponent = function(element, option){
		this.$element = $(element);
		this.option = $.extend({}, DEFAULT);
		this.changeEvents = {};
		this.validateEvents = {};

		this.init(option);
		this.preRender();
		this.render();
		this.rendered();
		this.isIE = is_IE(8);

		this.$element.data(this.dataKey, this);
	} 

	$.BaseComponent.prototype = {
		//组件初始化
		init:function(option){
			var $elem =this.$element,
				elem = $elem[0],
				attrs = elem.attributes,
				//不需要遍历属性数组
				ignore = ["data-key", "data-field", "required"];

			this.dataKey = $elem.attr("data-key") || this.option.dataKey;

			//避免控件重复渲染
			var cmt = this.$element.data(this.dataKey);
			if(cmt){
				return cmt;
			}

			if(/(required='false')|(required="false")/.test($elem.prop("outerHTML"))){
				this.option.required = false;
			}

			//遍历node节点上配置的属性
			for(var i=0, l = attrs.length; i<l; i++){
				var attr = attrs[i];
				var name = translate(attr.nodeName);
				if($.inArray(attr.nodeName, ignore) == -1){
					this.option[name] = attr.nodeValue;
				}
			}
			
			this.option = $.extend(this.option, option);

			if(this.option.required === false){
				$elem.removeAttr('required');
			}
			
			this.dataField = this.$element.attr("data-field") || this.option.dataField;
			if(!this.dataField){
				this.dataField = $.IGuid();
				$elem.attr("data-field", this.dataField);
			}

			this.validateResult = true;
			this.css = this.option.css;
			
			this.visible = this.option.visible = this.option.visible === "false" ? false : !!this.option.visible;
			this.ignore = this.option.ignore = this.option.ignore === "false" ? false : !!this.option.ignore;
			this.editable = this.option.editable = this.option.editable === "false" ? false : !!this.option.editable;
			this.autoValidate = this.option.autoValidate = this.option.autoValidate  === "false" ? false : !!this.option.autoValidate;

			if(this.option.defaultValue || this.option.defaultValue === 0){
				switch(this.option.dataValueType){
					case "bool":{
						if(this.option.defaultValue === "true"){
							this.value = this.option.defaultValue = true;
						}else{
							this.value = this.option.defaultValue = false;
						}
					}break;
					case "float":
					case "num":{
						this.value = this.option.defaultValue = Number(this.option.defaultValue);
					}break;
					default:{
						if(this.dataKey === "FormCheckbox"){
							if(this.option.defaultValue === "true"){
								this.value = this.option.defaultValue = true;
							}else{
								this.value = this.option.defaultValue = false;
							}
						}else{
							this.value = this.option.defaultValue;
						}
					}break;
				}
			}
			
			this.option.changeCallBack && (this.changeEvents["default"] = this.option.changeCallBack);
			this.option.validateCallBack && (this.validateEvents["default"] = this.option.validateCallBack);
			this.option.hasTitle = !!this.option.dataTitle ? true : false;
			//若组件有title则必须有外层容器包裹
			this.option.hasTitle && (this.option.needWrap = true);
		},

		//组件渲染前
		preRender: function(){
			this.$wrap = $('<div class="control-wrap clearfix"></div>');
			!this.visible && this.$wrap.hide();
			
			if(this.option.needWrap){	
				this.$element.after(this.$wrap);
				if(this.option.hasTitle){
					var titleCss = "form-title";
					var bodyCss = "form-content";
					
					//标题
					this.$title = $('<label class="' + titleCss + '">' + this.option.dataTitle + '</label>')
					if (this.Editable && this.Required) {
						this.$Title.append('<i style="color:red;vertical-align:middle">*</i>');
					}
					this.$body = $('<div class="' + bodyCss + '"></div>').append(this.$element);

					this.$wrap.append(this.$title).append(this.$body);
				}
				else{
					this.$wrap.append(this.$element);
					this.$body = this.$wrap;
				}
			}else{
				this.$wrap = this.$body = this.$element;
			}

            this.$wrap.addClass(this.option.css)
		},

		//组件渲染中
		render: function(){
			//子类重写
		},

		//组件渲染完成后
		rendered: function(){
            if(this.option.description){
            	this.$element.after('<em class="form-description">' + this.option.description + '</em>');
            }

			this.option.renderedCallBack && this.option.renderedCallBack.call(this);
		},

		//获取组件的值
		getValue: function(){
			//子类重写
		},

		changeTitle:function(title){
			title && this.$title.text(title);
		},

		//设置组件的值
		setValue:function(){
			//子类重写
		},

		//设置组件是否可编辑, 不可编辑的状态自动给组件加上disabled属性
		setEditable:function(editable){
			this.editable = !!editable;
			if(editable){
				this.$element.removeAttr('disabled').removeClass('form-disabled');
			}else{
				this.removeValidateText();
				this.$element.attr('disabled', true).addClass('form-disabled');
			}
		},

		//设置组件是否可见 
		setVisible: function(val){
			this.visible = !!val;
			if(this.visible){
				this.$wrap.show();
			}else{
				this.$wrap.hide();
				this.removeValidateText();
			}
			this.option.sync && (this.ignore = !val);
			return this;
		},

		//设置是否忽略组件 
		setIgnore: function(val){
			this.ignore = !!val;
			this.option.sync && (this.visible = !val);
			return this;
		},

		format:function(){
			if(this.value){
				switch(this.option.dataValueType){
					case "bool":{
						if(this.value === "true"){
							this.value = true;
						}else{
							this.value = false;
						}
					}break;
					case "float":
					case "num":{
						this.value = Number(this.value);
					}break;
				}
			}
		},

		reset:function(){
			// this.setValue(this.option.defaultValue, true);
			this.setValue(this.option.defaultValue);
			this.handleChangeEvents();
		},

		validate:function(){
			//子类重写
			//返回值 
			//true验证通过，false验证失败
			return true;
		},

		valChange:function(){
			if(this.autoValidate){
				if(this.onValidate()){
					//只有数据校验成功的情况下才执行自定义change事件
					this.handleChangeEvents();
				}
			}else{
				this.handleChangeEvents();
			}
			this.option.afterChangeCallBack && this.option.afterChangeCallBack.call(this);
		},

		//执行自定义数据校验逻辑和基础数据校验
		onValidate:function(elem){
			this.removeValidateText();
			if (!this.editable) return true;

			elem = elem || this.$element;
            var val = this.getValue();

            if (this.option.required &&(val === null || val === "" || val === undefined)) {

                this.addValidateText(_("Specify a value in this field."));
                return false;
            } 

            var s = this.validate();
            if(!s){
            	return false;
            }

            return this.handleValidateEvents();
		},

		//绑定自定义数据校验回调函数
		//回调函数：若验证失败直接返回，失败信息文本，否则返回空
		//回调函数中的this指向当前组件的实例
		bindValidateEvent: function(key, fn){
			key = key || "default";
			if(!fn || !$.isFunction(fn)){
				return;
			}

			this.validateEvents[key] = fn; 
			return this;
		},

		//执行组件数据改变后的自定义逻辑
		handleValidateEvents: function(){
			if (this.validateEvents == null || $.isEmptyObject(this.validateEvents)) 
			return true;

			if($.isEmptyObject(this.validateEvents)) return true;

            var events = this.validateEvents;
            for (var key in events) {
                var result = events[key].call(this);
                if(result && (typeof result === "string")){
					this.addValidateText(result);
					return false;
				}
			}
			return true;
		},

		//执行组件数据改变后的自定义逻辑
		handleChangeEvents: function(){
			this.getValue();
            if (this.changeEvents == null || $.isEmptyObject(this.changeEvents)) return;
            var events = this.changeEvents;
            for (var key in events) {
                events[key].apply(this, [arguments]);
            }
		},

		// 绑定组件数据后的自定义事件
		bindChangeEvent: function(key, fn){
			key = key || "default";
			if(!fn || !$.isFunction(fn)){
				return;
			}

			this.changeEvents[key] = fn;
			return this;
		},

		//解绑change事件和验证事件
		unBindEvent: function (key) {
			// 预留API
            this.changeEvents[key] && (delete this.changeEvents[key]);
            this.validateEvents[key] && (delete this.validateEvents[key]);
		},

		//显示验证的错误信息
		addValidateText: function(text){
			//增加显示错误信息格式
			var _this =this;
			if(_this.option.validateCustom && typeof _this.option.validateCustom === "function"){
				_this.option.validateCustom.call(this, text);
			}else{
				if(!this.$error){
					var pos = _this.$element.position(),
						pos1 = _this.$element.parent().position();
					pos = {
						h: _this.$element.outerHeight(),
						w: _this.$element.outerWidth(),
						top: pos.top,
						left: pos.left,
						totalW:_this.$element.parent().outerWidth()
					};

					this.$error = this.$error || $('<div title="' + _("Click to hide the hint") + '" class="form-error none">'+ text +'</div>');
					this.$hideerror = this.$hideerror || $('<i title="' + _("Click to show!") + '" class="form-hideerror icon-warning none hide"></i>');

					var top = pos.top, left = pos.w + pos.left + 7;
					if(this.option.css.indexOf("error-in-top") > -1 || pos.totalW - left < 130){
						this.$error.addClass('error-top').removeClass('error-left');
						left = pos.left;
						top = pos.h + pos.top + 7;
					}else{
						this.$error.removeClass('error-top').addClass('error-left');
					}

					this.$error.text(text).css({
						top: top + "px",
						left: left + "px"
					});

					this.$hideerror.css({
						left: pos.w + pos.left - 18 + "px"
					});
					this.$error.removeClass('none').insertAfter(_this.$element);
					this.$hideerror.insertAfter(_this.$element);

					this.$error.off("click").on("click", function() {
						_this.$error.toggleClass('hide');
						_this.$hideerror.toggleClass('hide');

						if(_this.isIE){
                            _this.$hideerror.removeClass("icon-warning").addClass("icon-warning");
                        }

					});

					this.$hideerror.off("click").on("click", function() {
						_this.$error.toggleClass('hide');
						_this.$hideerror.toggleClass('hide');
					});
				}else{
					this.$error.text(text);
				}

				this.showError();
			}
		},

		showError:function(){
			this.$element.addClass('error-tip');
			this.$error.removeClass('none');
			this.$hideerror.removeClass('none');
		},

		//去掉显示的错误信息
		removeValidateText: function(){
			if(this.option.validateCustom && typeof this.option.validateCustom === "function"){
				this.option.validateCustom();
			}else{
				if(this.$error){
					this.$error.addClass('none');
					this.$hideerror.addClass('none');
					this.$element.removeClass('error-tip');
				}
			}
		},

		show:function(){
			this.setVisible(true);
		},

		hide:function(){
			this.setVisible(false);
		},

		toggle:function(){
			this.setVisible(!this.visible);
		}
	}

    function  is_IE(ver) {
        var b = document.createElement('b');
        b.innerHTML = '<!--[if gte IE ' + ver + ']><i></i><![endif]-->'
        return b.getElementsByTagName('i').length === 1
    }

	function translate(str){
		if(str){
			var t = str.split("-"),
				l = t.length, 
				newStr = t[0],
				i = 1;
			while(i<l){
				var s = t[i];
				if(s){
					newStr += String.prototype.toUpperCase.call(s[0]) + s.slice(1); 	
				}
				i++;
			}
			return newStr;
		}
		return "";
	}

	//所有控件都能通过这种方式调用
	$.fn.Rcomponent = function(opt){
		var key = this.attr("data-key");
		if(!!opt){ 
			var component;
			opt.dataKey = opt.dataKey || key;
			this.each(function(){
				var $this = $(this);
				component = $this.data(opt.dataKey);
				if(component){
					return true;
				}
				component =  new $.components[opt.dataKey]($this, opt);
				// $this.data(opt.dataKey, component);
			});
			return component;
		}else{
			if(key){
				return new $.components[key](this);
				// $this.data(key, cmt);
				// return cmt;
			}
		}
	}



}(jQuery));


