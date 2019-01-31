import jQuery from 'jquery';
(function($, undefined){
	var DEFAULT ={
		dataObj: {},
		ignoreKey:[],
		titleObj:{},
		css:""
	}
	//todo by xc 字段按顺序输出

	function FormList(tar, opt){
		this.option = $.extend({}, DEFAULT, opt);
		this.$tar = tar;
		this.$tar.addClass(this.option.css);
		this.render();
	}

	FormList.prototype = {
		render: function(){
			var dataObj = this.option.dataObj,
				ignoreKey = this.option.ignoreKey,
				hasColon = this.option.hasColon,
				titleObj = this.option.titleObj;

			var nodeHtml = "";

			function createHtml(obj, groupKey){
			    var nodes = "", 
			    	row = '<div class="form-row data-field-{field}"><label class="col-xs-6 form-title">{key}</label><div class="col-xs-6 form-text" data-key="{key}">{value}</div></div>';

			    function addNode(titleItem, dataItems) {
                    var nodes = "";
                    nodes += '<div class="form-row-title">' + (titleItem["title"]) + '</div>';
                    for(var j = 0, jl = titleItem.items.length; j < jl; j++){
                        var target = titleItem.items[j];
                        nodes +=row.replace(/{key}/g, target.title).replace(/{value}/g, dataItems[target.field]).replace(/{field}/g, target.field);
                    }
                    return nodes;
                }

			    if(titleObj){
			        for(var i = 0, l = titleObj.length; i < l; i++){
			            var curItem = titleObj[i],
                            curData = dataObj[curItem.field],
                            type = Object.prototype.toString.call(curData);
			            if(type === "[object Array]"){
			                var title = curItem.title;
			                for(var k = 0, kl = curData.length; k < kl; k++){
			                    var titleItem = {
			                        title:curItem.title + (curItem.startIndex + k),
                                    items:curItem.items
                                };

                                nodes += addNode(titleItem, curData[k]);
                            }
                        }else{
			                nodes += addNode(curItem, curData);
                        }

                    }
                }
                return nodes;

				// if(obj){
				// 	var type = Object.prototype.toString.call(obj);
				// 	if(type === "[object Object]"){
				// 	    titleObj[groupKey] && (nodes += '<div class="form-row-title">' + (titleObj[groupKey]) + '</div>');
				// 		for(var key in obj){
			    	// 		if(ignoreKey.indexOf(key) < 0 && obj.hasOwnProperty(key)){
				// 				nodes += createHtml(obj[key], key);
				// 			}
				// 		}
				// 	}else if(type === "[object Array]"){
				// 		for(var i = 0, l = obj.length; i<l; i++){
				// 	        titleObj[groupKey] && (nodes += '<div class="form-row-title">' + (titleObj[groupKey] + (i+1)) + '</div>');
				// 			nodes += createHtml(obj[i]);
				// 		}
				// 	}else if(titleObj[groupKey]){
				// 		nodes +=row.replace(/{key}/g, titleObj[groupKey]).replace(/{value}/g, obj);
				// 	}
				// }
				// return nodes;
			}

			nodeHtml = createHtml(dataObj);

			this.$tar.html(nodeHtml);
			this.$tar.find("div.form-row-title:first").css({"border-top": 0, "padding-top":0});
		},
		reload:function(data){
			this.option.dataObj = data;
			this.render();
		},

		setText:function(key, value){
			if(key && this.option.dataObj[key]){
				this.option.dataObj[key] = value;
				//找到元素并替换value
				this.$tar.find("div.datatext[data-key='" + key + "']").text(value);
			}
		}
	}

	$.fn.FormList = function(opt){
		var args = Array.prototype.slice.call(arguments, 1), curObj;
        
        this.each(function () {
            var $this = $(this);
            curObj = $this.data("formlist");

            if (curObj && opt && typeof opt === "string") {
                curObj[opt].apply(curObj, args);
            } else {
            	curObj = new FormList($this, opt);
                $(this).data("formlist", curObj);
            }
        });
        return curObj || this;
	}
})(jQuery);