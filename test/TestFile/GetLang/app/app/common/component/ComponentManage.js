import jQuery from 'jquery';
//ControlManager
(function($, undefined){
	/**
	 * 该方法不建议手动调用
	 * args:[]或者{}
	 * args为[]时可作为组件的渲染或者方法的调用
	 * args为{}时只能作为组件渲染 
	 * key为组件的类型
	 */
	$.renderComponent = function(args, key){
		//data-key:用于存储组件的类型
		var $this = $(this),  
			cmts = {};
		if(!args) return;
		if(args.hasOwnProperty("length")){
			if(args.length == 0) return;
			args = Array.prototype.slice.call(args);
			var opt = args[0], params = args.slice(1);
			$this.each(function(i){
				var comkey = key || $this.attr("data-key");
				comkey = comkey || opt["dataKey"];

				var $this = $(this), component = $this.data(comkey);
				//通过该方式访问组件内指定API
				if(component && params && typeof opt == "string"){
					cmts = component[opt].call(component, params);
				}else{
					var cmt = new $.components[comkey](this, opt);
					if(cmt.$element[0].tagName.toLowerCase() === "div"){
						cmt.$element.find("input,select").attr("tabindex", i+1);
					}else{
						cmt.$element.attr("tabindex", i+1);
					}
					// $this.data(comkey, cmt);
					cmts[cmt.dataField] = cmt;
				}
			});
		}else{
			$this.each(function(i){
				var $this = $(this),
					comkey = key || $this.attr("data-key");
				var opt = args[$this.attr("data-field")];
				var cmt = new $.components[comkey](this, opt);
				if(cmt.$element[0].tagName.toLowerCase() === "div"){
					cmt.$element.find("input,select").attr("tabindex", i+1);
				}else{
					cmt.$element.attr("tabindex", i+1);
				}
				// $this.data(comkey, cmt);
				cmts[cmt.dataField] = cmt;
			});
		}
		return cmts;
	}

	//适用于模块组件操作，便于模块组件的编写
	var DEFAULT_OPT = {
		requestUrl:"",
		requestData:{},
		submitUrl:"",
		formCfg:{},
		showSubmitBar: false,
		container:null,
		beforeUpdate:function(data){},//请求返回的数据，this指向当前ComponentManager实例对象
		afterUpdate:function(){},//数据更新后的回调，this指向当前ComponentManager实例对象
		beforeSubmit:function(data){},//提交数据前，进行一些列自定义数据校验操作，当然基础的数据校验会在这之前进行调用,失败返回false, 成功返回true或者二次处理后需要提交的数据，this指向当前ComponentManager实例对象
		afterSubmit:function(){}//数据提交后的回调，this指向当前ComponentManager实例对象
	},
	CHECKTYPE = {
		SUBMIT:1, //数据提交
		VALIDATE:2 //只做数据校验
	};

	//todo by xc 增加数据校验

	function ComponentManager(opt){
		this.option = $.extend({}, DEFAULT_OPT, opt);
		this.$container = $(this.option.container).addClass("form-wrap");
		this.$formWrap = $("<form></form>").insertAfter(this.$container).append(this.$container);
		this.components = {};//datafield:Component对象键值对
		this.isSingle = false; //单个组件渲染
		this.orignalData = {};

		this.init();
	}

	ComponentManager.prototype = {
		init:function(){
			var key = this.$container.attr("data-key");
			this.isSingle = !!key;
			
			if(this.isSingle){
				this.components = $.renderComponent.call(this.$container, this.option.formCfg, key);
			}else{
				this.components = $.renderComponent.call(this.$container.find('[data-key]'), this.option.formCfg);
			}

			this.$footbar = $('<div class="cm-footbar md-toolbar"><input type="button" class="md-btn ok cm-submit" value="' + _("Submit") + '"><input type="button" class="md-btn cancel cm-cancel" value="' + _("Cancel") + '"></div>');
			this.option.showSubmitBar && this.$footbar.appendTo(this.$formWrap);

			this.request();
			this.bindEvent();
		},

		request:function(){
			var _this = this;
			// 获取数据，更新组件的值
			if(this.option.requestUrl){
				$.ajax({
		            url: this.option.requestUrl,
		            cache: false,
		            type: "get",
		            dataType: "text",
		            data:JSON.stringify(this.option.requestData),
		            async: true,
		            success: function (data, status) {
		                if (data.indexOf("login.js") > 0) {
		                    top.window.location.href = "login.asp";
		                    return;
		                }

		                try{
		                	data = JSON.parse(data);
		                	_this.orignalData = data;
		                	_this.analyseData();
		                }
		                catch(e){
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
			}
		},

		bindEvent:function(){
			var _this = this;
			if(this.option.showSubmitBar){
				this.$footbar.off("click.cm").on("click.cm", ".md-btn", function(e){
					var $this = $(this);
					if($this.hasClass("cm-submit")){
						_this.submit();
					}else if($this.hasClass("cm-cancel")){
						_this.updateComponents();
					}
					return false;
				});
			}
		},

		reload:function(){
			this.request();
		},

		analyseData:function(){
			this.updateComponents(this.orignalData);
		},

		/**
		 * 对容器内的表单进行数据校验
		 * @return {true:数据校验成功,false:数据校验失败}
		 */
		validate: function(){
			if(this.$container.find(".error-tip").length > 0){
				$.formMessage(_("Incorrect. Check the red text box."));
				return false;
			}
			var components = this.components, result = true;
			for(var field in components){
				if(components.hasOwnProperty(field)){
					if(components[field].visible){
						var validate = components[field].onValidate();
						if(result){
							result = validate;
						}
					}
				} 
			}
			return result;
		},

		/**
		 * 获取组件的值
		 * @param  {[field]} 需要获取值得组件filed，可不填，不填就是获取所有组件的值
		 * @return filed为空返回{},field有值返回对应组件的值
		 */
	    getValue: function(field){
	    	if(field){
	    		var cmt = this.components[field];
	    		if(cmt){
	    			return cmt.getValue();
	    		}
	    	}else{
	    		var data = {},
	    			components = this.components;
	    		for(var key in components){
					if(components.hasOwnProperty(key)){
						var cmt = components[key];
						!cmt.ignore && (data[key] = components[key].getValue());
					}
				}
				return data;
	    	}
	    },
	    /**
	     * 提交数据
		 * type: 1表示数据提交，2：表示数据校验，默认值为1
	     * 返回 false：数据校验失败， true:数据校验成功
	     */
	    submit:function(type){
			type = type || CHECKTYPE.SUBMIT;
	    	var result = this.validate(), data;
	    	if(result){
	    		data = this.getValue();
	    		result = this.option.beforeSubmit && this.option.beforeSubmit.call(this, data);
	    		if(result === false){
	    			return false;
				}
				
				if(type === CHECKTYPE.VALIDATE){
					return true;
				}

	    		if(result && result !== true){
	    			data = result;
	    		}

	    		var _this = this;

	    		$.ajax({
	    		    url: this.option.submitUrl,
	    		    cache: false,
	    		    type: "post",
	    		    dataType: "text",
	    		    async: true,
	    		    data: data,
	    		    success: function (data) {
	    		        if (data.indexOf("login.js") > 0) {
	    		            //window.location.href = "login.asp";
	    		            top.window.location.reload();
	    		            return;
	    		        }
	    		        _this.option.afterSubmit.call(_this, data);
	    		    }
	    		});
	    		return true;
	    	}
	    	return false;
	    },

	    /**
	     * 设置组件的值
	     * field：需要设置值得组件field,可为空
	     * val:   组件的值，field为空则是所有组件的值{}，否则为该组件的值
	     */
	    setValue: function(val, field){
	    	if(field){
	    		var cmt = this.components[field];
	    		if(cmt){
	    			cmt.setValue(val);
					cmt.handleChangeEvents();
	    		}
	    	}else{
	    		var data = {},
	    			components = this.components;
	    		for(var key in components){
					if(components.hasOwnProperty(key)){
						components[key].setValue(val[key]);
						components[key].handleChangeEvents();
					}
				}
	    	}
	    },
	    /**
	     * 更新组件的值-重置为上一次的值或者给定的值
	     * data:{} 字段与值的键值对
	     */
	    updateComponents:function(data){
	    	var components = this.components;
			data = this.option.beforeUpdate.call(this, data) || data;

	    	if(data && !$.isEmptyObject(data)){
	    	 	$.extend(this.orignalData, data);
	    	}else{
	    		data = this.orignalData;
	    	}
	    	
	    	if(data && $.getType(data) === "[object Object]"){
	    		for(var key in data){
	    			if(data.hasOwnProperty(key)){
	    				var cmt = components[key];
	    				if(cmt){
		    				cmt.setValue(data[key]);
							cmt.handleChangeEvents();
							cmt.removeValidateText();
	    				}
	    			}
	    		}
	    	}
			this.option.afterUpdate.call(this);
	    },

	    reset:function(){
	    	var components = this.components;
	    	for(var key in components){
	    		if(components.hasOwnProperty(key)){
	    			var component = components[key];
	    			component.reset();
	    			component.removeValidateText();
	    		}
	    	}
	    },

	    //获取单个组件
	    getComponent: function(field){
	    	if(field){
	    		return this.components[field];
	    	}
	    },

	    //根据元素节点获取组件
	    getComponentByNode: function(node){
	    	if(node){
	    		var field = $(node).attr("data-field");
	    		return this.getComponent(field);
	    	}
	    },

	    //清空组件
	    clearComponents:function(){

		},
		
		emmit:function(funName, args){
            if(!!funName){
                return;
            }
            
            var data  = {};
            components = this.components;
            for(var key in components){
                if(components.hasOwnProperty(key)){
                    var cmt = components[key];
                    if(cmt[funName] && typeof cmt[funName] === "function"){
                        data[key] = cmt[funName].apply(cmt, args);
                    }
                }
            }
            return data;
        }
	}
	
	//两种调用形式
	$.componentManager = function(opt){
		return new ComponentManager(opt);
	}


	$.getType = function(obj){
		return Object.prototype.toString.call(obj);
	}
}(jQuery));