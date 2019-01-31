/*eslint-disable*/
/*!
 * reasy-ui.js v1.0.5 2015-06-19
 * Copyright 2015 ET.W
 * Licensed under Apache License v2.0
 *
 * The REasy UI for router, and themes built on top of the HTML5 and CSS3..
 */

import $ from 'jquery';

(function (win, doc) {
	"use strict";

	var rnative = /^[^{]+\{\s*\[native code/,
		_ = window._;

	// ReasyUI 全局变量对象
	$.reasyui = {};

	// 记录已加载的 REasy模块
	$.reasyui.mod = 'core ';

	// ReasyUI 多语言翻译对象
	$.reasyui.b28n = {};

	// 全局翻译函数
	if (!_) {
		// window._ = _ = function (str, replacements) {
		// 	var ret = $.reasyui.b28n[str] || str,
		// 		len = replacements && replacements.length,
		// 		count = 0,
		// 		index;

		// 	if (len > 0) {
		// 		while ((index = ret.indexOf('%s')) !== -1) {
		// 			ret = ret.substring(0, index) + replacements[count] +
		// 				ret.substring(index + 2, ret.length);
		// 			count = ((count + 1) === len) ? count : (count + 1);
		// 		}
		// 	}

		// 	return ret;
		// }

		window._ = _ = function (key, replacements) {
			var nkey = key,
				index,
				count = 0;
			if (!replacements) {
				return nkey;
			}
			if (replacements instanceof Array && replacements.length !== 0) {
				while ((index = nkey.indexOf('%s')) !== -1) {
					nkey = nkey.slice(0, index) + replacements[count] +
						nkey.slice(index + 2);
					count = ((count + 1) === replacements.length) ? count : (count + 1);
				}
			} else if (typeof replacements === "string") {
				index = nkey.indexOf('%s');
				nkey = nkey.slice(0, index) + replacements + nkey.slice(index + 2);
			}
			return nkey;
		};
	}

	// HANDLE: When $ is jQuery extend include function 
	if (!$.include) {
		$.include = function (obj) {
			$.extend($.fn, obj);
		};
	}

	//扩展String的原型链
	//去除前后空格
	String.prototype.trim = function () {
		return this.replace(/(^\s+)|(\s+$)/g, "");
	}
	//去除字符串中所有的空格
	String.prototype.trimAll = function () {
		return this.replace(/[ ]/g, "");
	}

	//去除前面的空格
	String.prototype.trimBefore = function () {
		return this.replace(/^\s+/g, "");
	}

	//去除后面的空格
	String.prototype.trimEnd = function () {
		return this.replace(/\s+$/g, "");
	}

	Function.prototype.inherit = function (parent, overrides) {
		if (typeof parent != 'function') return this;
		// 保存对父类的引用
		this.Base = parent.prototype;
		this.Base.constructor = parent;
		// 继承
		var f = function () { };
		f.prototype = parent.prototype;
		this.prototype = new f();
		this.prototype.constructor = this;

		//重写基类的属性和方法
		if (overrides) $.extend(this.prototype, overrides);
	};

	$.extend({
		keyCode: {
			ALT: 18,
			BACKSPACE: 8,
			CAPS_LOCK: 20,
			COMMA: 188,
			COMMAND: 91,
			COMMAND_LEFT: 91, // COMMAND
			COMMAND_RIGHT: 93,
			CONTROL: 17,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			INSERT: 45,
			LEFT: 37,
			MENU: 93, // COMMAND_RIGHT
			NUMPAD_ADD: 107,
			NUMPAD_DECIMAL: 110,
			NUMPAD_DIVIDE: 111,
			NUMPAD_ENTER: 108,
			NUMPAD_MULTIPLY: 106,
			NUMPAD_SUBTRACT: 109,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SHIFT: 16,
			SPACE: 32,
			TAB: 9,
			UP: 38,
			WINDOWS: 91 // COMMAND
		},
		//创建Guid，用法:$.IGuid()
		IGuid: function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},

		isNotNullOrEmpty: function (str) {
			if (typeof str === "undefined" || str === "") {
				return false;
			}
			return true;
		},

		//获取视口宽度，不包含滚动条
		viewportWidth: function () {
			var de = doc.documentElement;

			return (de && de.clientWidth) || doc.body.clientWidth ||
				win.innerWidth;
		},

		//获取视口高度，不包含滚动条
		viewportHeight: function () {
			var de = doc.documentElement;

			return (de && de.clientHeight) || doc.body.clientHeight ||
				win.innerHeight;
		},

		//获取输入框中光标位置，ctrl为你要获取的输入框
		getCursorPos: function (ctrl) {
			var Sel,
				CaretPos = 0;
			//IE Support
			if (doc.selection) {
				ctrl.focus();
				Sel = doc.selection.createRange();
				Sel.moveStart('character', -ctrl.value.length);
				CaretPos = Sel.text.length;
			} else if (ctrl.selectionStart || parseInt(ctrl.selectionStart, 10) === 0) {
				CaretPos = ctrl.selectionStart;
			}
			return CaretPos;
		},

		//设置文本框中光标位置，ctrl为你要设置的输入框，pos为位置
		setCursorPos: function (ctrl, pos) {
			var range;

			if (ctrl.setSelectionRange) {
				ctrl.focus();
				ctrl.setSelectionRange(pos, pos);
			} else if (ctrl.createTextRange) {
				range = ctrl.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}

			return ctrl;
		},

		getUtf8Length: function (str) {
			var totalLength = 0,
				charCode,
				len = str.length,
				i;

			for (i = 0; i < len; i++) {
				charCode = str.charCodeAt(i);
				if (charCode < 0x007f) {
					totalLength++;
				} else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
					totalLength += 2;
				} else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
					totalLength += 3;
				} else {
					totalLength += 4;
				}
			}
			return totalLength;
		},

		/**
		 * For feature detection
		 * @param {Function} fn The function to test for native support
		 */
		isNative: function (fn) {
			return rnative.test(String(fn));
		},

		isHidden: function (elem) {
			if (!elem) {
				return;
			}

			return $.css(elem, "display") === "none" ||
				$.css(elem, "visibility") === "hidden" ||
				(elem.offsetHeight == 0 && elem.offsetWidth == 0);
		},

		getValue: function (elem) {
			if (typeof elem.value !== "undefined") {
				return elem.value;
			} else if ($.isFunction(elem.val)) {
				return elem.val();
			}
		}
	});

	/* Cookie */
	$.cookie = {
		get: function (name) {
			var cookieName = encodeURIComponent(name) + "=",
				cookieStart = document.cookie.indexOf(cookieName),
				cookieEnd = document.cookie.indexOf(';', cookieStart),
				cookieValue = null;

			if (cookieStart > -1) {
				if (cookieEnd === -1) {
					cookieEnd = document.cookie.length;
				}
				cookieValue = decodeURIComponent(document.cookie.substring(cookieStart +
					cookieName.length, cookieEnd));
			}
			return cookieValue;
		},
		set: function (name, value, path, domain, expires, secure) {
			var cookieText = encodeURIComponent(name) + "=" +
				encodeURIComponent(value);

			if (expires instanceof Date) {
				cookieText += "; expires =" + expires.toGMTString();
			}
			if (path) {
				cookieText += "; path =" + path;
			}
			if (domain) {
				cookieText += "; domain =" + domain;
			}
			if (secure) {
				cookieText += "; secure =" + secure;
			}
			doc.cookie = cookieText;

		},
		unset: function (name, path, domain, secure) {
			this.set(name, '', path, domain, new Date(0), secure);
		}
	};
}(window, document));
/**
 * jquery 数据操作拓展
 */

$.isEqual = function (a, b) {
	for (var prop in a) {
		if ((!b.hasOwnProperty(prop) && a[prop] !== "") || a[prop] !== b[prop]) {
			return false;
		}
	}
	return true;
};

/**
 * 对象克隆
 * @param  {[type]} myObj [description]
 * @return {[type]}       [description]
 */

function objClone(myObj) {
	if (typeof (myObj) != 'object') return myObj;
	if (myObj === null) return myObj;
	var myNewObj = {};
	for (var i in myObj)
		myNewObj[i] = objClone(myObj[i]);
	return myNewObj;
}
/**
 * 拓展数组对象深度克隆
 * @return {[type]} [description]
 */
Array.prototype.clone = function () { //为数组添加克隆自身方法，使用递归可用于多级数组
	var newArr = [];
	for (var i = 0; i <= this.length - 1; i++) {
		var itemi = this[i];
		if (itemi.length && itemi.push) itemi = itemi.clone(); //数组对象，进行递归
		else if (typeof (itemi) == "object") itemi = objClone(itemi); //非数组对象，用上面的objClone方法克隆
		newArr.push(itemi);
	}
	return newArr;
}

if (!Array.prototype.indexOf) { //解决IE8不支持数组使用indexOf方法
	Array.prototype.indexOf = function (searchStr) {
		var len = this.length || 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) {
			from += len;
		}

		for (; from < len; from++) {
			if (from in this && this[from] === searchStr)
				return from;
		}
		return -1;
	};
}

/**
 * AJAX
 */
$.GetSetData = {
	getDataByGet: function (url, handler) {
		if (url.indexOf("?") < 0) {
			url += "?" + Math.random();
		}
		$.ajax({
			url: url,
			cache: false,
			type: "get",
			dataType: "text",
			async: true,
			success: function (data, status) {
				if (data.indexOf("login.js") > 0) {
					if (top == window) { //不能用全等，ie下会有问题
						window.location.href = "login.asp";
					} else {
						top.window.location.href = "login.asp";
					}
					return;
				}

				if (typeof handler == "function") {
					handler.apply(this, arguments);
				}
			},
			error: function (msg, status) {
				Debug.log("get Data failed,msg is ", msg);
				if (typeof handler == "function") {
					handler.apply(this, arguments);
				}
			},
			complete: function (xhr) {
				xhr = null;
			}
		});
	},
	getData: function (url, data, handler) {
		if (url.indexOf("?") < 0) {
			url += "?" + Math.random();
		}
		// console.log(data);
		if (data) {
			data = JSON.stringify(data);
		}

		$.ajax({
			url: url,
			cache: false,
			type: "post",
			dataType: "text",
			data: data,
			async: true,
			success: function (data, status) {
				if (data.indexOf("login.js") > 0) {
					if (top == window) { //不能用全等，ie下会有问题
						window.location.href = "login.asp";
					} else {
						top.window.location.href = "login.asp";
					}
					return;
				}

				if (typeof handler == "function") {
					handler.call(this, data);
				}
			},
			error: function (msg, status) {
				Debug.log("get Data failed,msg is ", msg);
				// console && console.log && console.log("error:ajax failed！");
			},
			complete: function (xhr) {
				xhr = null;
			}
		});
	},
	getDataSync: function (url, handler) {
		if (url.indexOf("?") < 0) {
			url += "?" + Math.random();
		}
		$.ajax({
			url: url,
			cache: false,
			type: "get",
			dataType: "text",
			async: false,
			success: function (data, status) {
				if (data.indexOf("login.js") > 0) {
					// top.window.location.reload();
					//当在index.js里的请求返回login时，以上方式只能导致页面一直在循环刷新
					if (top == window) { //不能用全等，ie下会有问题
						window.location.href = "login.asp";
					} else {
						top.window.location.href = "login.asp";
					}
					return;
				}

				if (typeof handler == "function") {
					handler.apply(this, arguments);
				}
			},
			error: function (msg, status) {
				Debug.log("get Data failed,msg is ", msg);
				if (typeof handler == "function") {
					handler.apply(this, arguments);
				}
			},
			complete: function (xhr) {
				xhr = null;
			}
		});
	},
	getJson: function (url, data, handler) {
		this.getData(url, data, function (data) {
			try {
				data = JSON.parse(data);
				handler(data);
			}
			catch (e) {
				data = null;
				// console && console.log && console.log("error:data is not JSON！");
			}
		});
	},
	//getHtml 没有用用到
	getHtml: function (elems, url, handler) {
		this.getData(url, function (data, status) {
			if (status == "success") {
				elems.html(data);
			}
			handler(status);
			data = null;
			elems = null;
		});
	},
	setData: function (url, data, handler) {
		if (url.indexOf("?") < 0) {
			url += "?" + Math.random();
		}
		if (data) {
			data = JSON.stringify(data);
		}

		$.ajax({
			url: url,
			cache: false,
			type: "post",
			dataType: "text",
			async: true,
			data: data,
			success: function (data) {
				// if (data.indexOf("login.js") > 0) {
				//     //window.location.href = "login.asp";
				//     top.window.location.reload();
				//     return;
				// }

				if (data.indexOf("login.js") > 0) {
					if (top == window) { //不能用全等，ie下会有问题
						window.location.href = "login.asp";
					} else {
						top.window.location.href = "login.asp";
					}
					return;
				}

				if ((typeof handler).toString() == "function") {
					handler(data);
				}
			}
		});
	},
	setDataNoJson: function (url, data, handler) {
		$.ajax({
			url: url,
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
				if ((typeof handler).toString() == "function") {
					handler(data);
				}
			}
		});
	}
};


/*!
 * REasy UI valid-lib @VERSION
 * http://reasyui.com
 *
 * 数据校验-正则匹配归类
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {
	"use strict";

	//$.validate.utils = utils;
	$.valid = {
		len: function (str, min, max) {
			var len = str.length;

			if (typeof min !== "undefined" && typeof max !== "undefined" && (len < min || len > max)) {
				return _("Range: %s - %s characters", [min, max]);
			}
		},

		byteLen: function (str, min, max) {
			var totalLength = $.getUtf8Length(str);

			if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {
				return _("Range: %s - %s bytes", [min, max]);
			}
		},

		num: function (str, min, max) {

			if (!(/^-?[0-9]{1,}$/).test(str)) {
				return _("Please enter digits.");
			}
		
			if (typeof min != "undefined" && typeof max != "undefined") {
				if (parseInt(str, 10) < min || parseInt(str, 10) > max) {

					return _("Range: %s - %s", [min, max]);
				}
			}
		},
		num0:function(str){
			if (!(/^[0-9]{1,}$/).test(str)) {
				return _("Please enter digits.");
			}

			if (typeof min != "undefined" && typeof max != "undefined") {
				if(parseInt(str,10) == 0){
					return ;
				}
				if (parseInt(str, 10) < min || parseInt(str, 10) > max) {
					return _("Range: %s - %s", [min, max]);
				}
			}
		},
		float: function (str, min, max) {
			var floatNum = parseFloat(str, 10);

			if (isNaN(floatNum)) {
				return _("Must be float");
			}
			if (typeof min != "undefined" && typeof max != "undefined") {
				if (floatNum < min || floatNum > max) {

					return _("Range: %s - %s", [min, max]);
				}
			}
		},
		url: function (str) {
			if (/^[-_~\|\#\?&\\\/\.%0-9a-z\u4e00-\u9fa5]+$/ig.test(str)) {
				if (/.+\..+/ig.test(str) || str == "localhost") {

				} else {
					return _("Incorrect URL format.");
				}
			} else {
				return _("Incorrect URL format.");
			}
		},

		domain: {
			all: function (str, min, max) {
				if (typeof min !== "undefined" && typeof max !== "undefined" && min <= max) {
					var totalLength = $.getUtf8Length(str);

					if (totalLength < min || totalLength > max) {
						return _("Range: %s - %s bytes", [min, max]);
					}
				}

				if (!/^[\d\.]+$/.test(str)) {
					if (/^([\w-]+\.)*(\w)+$/.test(str))
						return;
				} else {
					if (!$.valid.ip.all(str))
						return;
				}
				return _("Please enter a valid IP address or domain name.");


			}
		},
		//dns劫持中域名的限制
		domainName: function (str) {

			var totalLength = $.getUtf8Length(str);
			if (totalLength > 128) {
				return _("Only a maximum of 128 bytes are allowed in a domain name.");
			}

			if (!/^[\d\.]+$/.test(str)) {
				if (/^([\w-]+\.)*(\w)+$/.test(str))
					return;
			}

			return _("Please enter a valid domain name.");

            /*var reg = /(^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$)|(^\*(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}){2,}$)|(^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.\*(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$)/;
            if (!reg.test(str)) {
                return _("Domain name format error.");
            }*/
		},
		mac: {
			all: function (str) {
				var ret = this.specific(str);

				if (ret) {
					return ret;
				}

				if (!(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/).test(str)) {
					return _("MAC address format: XX:XX:XX:XX:XX:XX");
				}
			},

			specific: function (str) {
				var subMac1 = str.split(':')[0];

				if (subMac1.charAt(1) && parseInt(subMac1.charAt(1), 16) % 2 !== 0) {
					return _("The second character of a MAC address must be an even number.");
				}
				if (str === "00:00:00:00:00:00") {
					return _("The MAC address cannot be 00:00:00:00:00:00.");
				}
			}
		},
		mac1: {//这是为了校验 每个mac部分是分开的情况
			all: function (str) {
				var ret = this.specific(str);

				if (ret) {
					return ret;
				}
				if (str.charAt(1) && parseInt(str.charAt(1), 16) % 2 !== 0) {
					return _("The second character of a MAC address must be an even number.");
				}
			}, specific: function (str) {
				if (!(/^[0-9a-fA-F]{2}$/).test(str)) {
					return _("请输入合法的MAC地址字段");
				}
			}

		},
		ip: {
			all: function (str) {
				var ret = this.specific(str);

				if (ret) {
					return ret;
				}

				if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/).test(str)) {
					return _("Please enter a valid IP address.");
				}
			},

			specific: function (str) {
				var ipArr = str.split('.'),
					ipHead = ipArr[0];

				if (ipArr[0] === '127') {
					return _("An IP address that is started with 127 is a loopback address. The range is 1 to 223.");
				}
				if (ipArr[0] > 223) {
					return _("First input %s is invalid and the value range is 1 to 223.", [ipHead]);
				}
			}
		},

		ipSegment: {
			all: function (str) {
				if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}(0|128|192|224|240|252|254)$/).test(str)) {
					return _("Please enter a valid network segment");
				}
			}
		},
		//wep密码校验
		//ascii时允许输入5位或者13位ASCII码
		//hex时允许输入10位或者26位Hex码
		wep: {
			ascii: function (str) {
				let ret = $.valid.ascii(str);
				if (ret || !(str.length == 5 || str.length == 13)) {
					return _("请输入5位或者13位可见ASCII码");
				}
			},
			hex: function (str) {
				let ret = $.valid.hex(str);
				if (ret || !(str.length == 10 || str.length == 26)) {
					return _("请输入10或26个有效Hex码");
				}
			}
		},
		dns: function () { },

		mask: function (str) {
			var rel = /^(254|252|248|240|224|192|128)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/;
			if (!rel.test(str)) {
				return _("Please enter a valid subnet mask.");
			}
		},

		email: function (str) {
			var rel = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			if (!rel.test(str)) {
				return _("Please input a valid E-mail address.");
			}

		},

		time: function (str) {
			var dateAndTime = str.split(" ");
			var date = dateAndTime[0];
			var time = dateAndTime[1];
			var datePattern = /^((((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9]))|(([2468][048]00)([-\/\._])(0?2)([-\/\._])(29))|(([3579][26]00)([-\/\._])(0?2)([-\/\._])(29))(([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)))$/;
			var timePattern = /^(((0|1)\d)|(2[0-3]))(:([0-5]\d)){2}$/
			if (!(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/).test(str)) {
				return _("Time format: YYYY-MM-DD HH:MM:SS.");
			} else if (!(datePattern.test(date)) || !(timePattern.test(time))) {
				return _("Please enter a valid time.");
			}

		},

		hex: function (str) {
			if (!(/^[0-9a-fA-F]{1,}$/).test(str)) {
				return _("Only hexadecimal characters are allowed.");
			}
		},

		/**
		 * 检测是否包含全角字符
		 * @param  {[type]} str [待检测字符串]
		 * @return {[type]}     [true：包含全角字符 false:不包含]
		 */
		chkHalf: function (str) {
			for (var i = 0; i < str.length; i++) {
				var strCode = str.charCodeAt(i);
				if ((strCode > 65248) || (strCode == 12288)) {
					return _("Full-width characters are not allowed.");;
					break;
				}
			}
		},

		ascii: function (str, min, max) {
			/*chkHalf*/
			for (var i = 0; i < str.length; i++) {
				var strCode = str.charCodeAt(i);
				if ((strCode > 65248) || (strCode == 12288)) {
					return _("Full-width characters are not allowed.");
					break;
				}
			}

			if (!(/^[ -~]+$/g).test(str)) {
				return _("Please enter non-Chinese characters.");
			}
			if (min || max) {
				return $.valid.len(str, min, max);
			}
		},

		pwd: function (str, minLen, maxLen) {
			var ret;

			if (!(/^[0-9a-zA-Z_]+$/).test(str)) {
				return _("Digits, letters, and underscores are allowed.");
			}

			if (minLen && maxLen) {
				ret = $.valid.len(str, minLen, maxLen);
				if (ret) {
					return ret;
				}
			}
		},

		username: function (str, min, max) {
			var totalLength = $.getUtf8Length(str);

			if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {
				return _("Range: %s - %s bytes", [min, max]);
			}

			if (!(/^[0-9a-zA-Z\u4e00-\u9fa5_]+$/).test(str)) {
				return _("Digits, letters, underscores, and Chinese characters are allowed.");
			}
		},

		ssid: function (str) {
			var reg = /[ -~\u4e00-\u9fa5]/,
				len = $.getUtf8Length(str);

			if (!reg.test(str)) {
				return _("请输入1-32字节可见ASCII码或中文")
			}
			if (len > 32) {
				return _("请输入1-32字节可见ASCII码或中文");
			}
		},

		clockTime: function (str) {
			var reg = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

			if (!reg.test(str)) {
				return _('请输入正确格式的时间')
			}
		},

		ssidPassword: function (str, minLen, maxLen) {
			var ret;
			if (str.length == 64) {
				if ($.valid.hex(str)) {
					ret = _("请输入8-63个可见ASCII码或者64个Hex码");
				}
				return ret;
			}

			ret = $.valid.ascii(str, minLen, maxLen);
			if (ret) {
				ret = _("请输入8-63个可见ASCII码或者64个Hex码");
				return ret;
			}

		},

		specialChar: function (str, banStr) {
			var len = banStr.length,
				curChar,
				i;

			for (i = 0; i < len; i++) {
				curChar = banStr.charAt(i);
				if (str.indexOf(curChar) !== -1) {
					return _("Cannot enter %s.", [banStr.split("").join(" ")]);
				}
			}
		},

		remarkTxt: function (str, min, max) {
			var totalLength = str.length,
				ret;

			if (min && max) {
				ret = $.valid.byteLen(str, min, max);
				if (ret) {
					return ret;
				}
			}

			if (!(/^[0-9a-zA-Z\u4e00-\u9fa5_\s]+$/).test(str)) {
				return _("Digits, letters, underscores, spaces, and Chinese characters are allowed.");
			}
		},

		noBlank: function (str) {
			if (str.indexOf(" ") !== -1) {
				return _("Cannot enter spaces.");
			}
		},
		pppoe:function(str){
			if(str.indexOf("\\") !== -1){
				return _("Cannot enter \\");
			}
			if(str.length > 64){
				return _("最大输入长度为64位");
			}
		},
		charTxt: function (str) {
			if (!(/^[0-9a-zA-Z]+$/).test(str)) {
				return _("Digits and letters are allowed.");
			}
		},

		ssidNoBlank: function (str) {
			if ((/^( )|( )$/).test(str)) {
				return _("The first and last characters of the SSID cannot be spaces.");
			}
		}
		,
		hostName: function (str) {
			if ((/[\s\'\"\.]/).test(str)) {
				return _("Space, dot(.), single quotation marks ('') and double quotation marks (\"\") are disallowed in a host name.");
			}
		}
	};

})(window, document);


//通用功能函数
/********判断是否同网段****************/
function checkIpInSameSegment(ip_lan, mask_lan, ip_wan, mask_wan) {
	if (ip_lan === '' || ip_wan === '') {
		return false;
	}
	var ip1Arr = ip_lan.split("."),
		ip2Arr = ip_wan.split("."),
		maskArr1 = mask_lan.split("."),
		maskArr2 = mask_wan.split("."),
		maskArr = maskArr1,
		i;
	for (i = 0; i < 4; i++) {
		if (maskArr1[i] != maskArr2[i]) {
			if (maskArr1[i] & maskArr2[i] == maskArr1[i]) {
				maskArr = maskArr1;
			} else {
				maskArr = maskArr2;
			}
			break;
		}
	}
	for (i = 0; i < 4; i++) {
		if ((ip1Arr[i] & maskArr[i]) != (ip2Arr[i] & maskArr[i])) {
			return false;
		}
	}
	return true;
}
window.checkIpInSameSegment = checkIpInSameSegment;
//格式化流量数据显示 KB MB GB TB，传入的数据单位都为KB
function formatSpeed(val, num) {
	if (num === "" || num === undefined) {
		num = 2;
	}
	if (val) {
		val = ~~val;
		var speedArr = [" KB", " MB", " GB", " TB"], index = 0;
		while (val > 1024) {
			val = val / 1024.0;
			index++;
		}
		val = val.toFixed(num) + speedArr[index];
	} else {
		val += " KB";
	}
	return val;
}

/*********对象转换成字符串****************/
function objToString(obj) {
	var str = "",
		prop;
	for (prop in obj) {
		str += prop + "=" + encodeURIComponent(obj[prop]) + "&";
	}
	str = str.replace(/[&]$/, "");
	return str;
}

/**
 * 将html标符转换为页面可显示的安全字符
 * @param  {String} str 需要转换html tag的字符串
 * @return {[type]}     转换过html tag的字符
 */
function toHtmlCode(str) {
	if (typeof str != "string") {
		return str;
	} else {
		return str ? str.replace(/[<>\"]/g, function (char) {
			switch (char) {
				case '<':
					return '&lt;'
				case '>':
					return '&gt;'
				case '"':
					return '&quot;'
			}
		}) : '';
	}
}
var keyCodeMap = {
	8: 'Backspace',
	9: 'Tab',
	13: 'Enter',
	16: 'Shift',
	17: 'Ctrl',
	18: 'Alt',
	19: 'Pause',
	20: 'Caps Lock',
	27: 'Escape',
	32: 'Space',
	33: 'Page Up',
	34: 'Page Down',
	35: 'End',
	36: 'Home',
	37: 'Left',
	38: 'Up',
	39: 'Right',
	40: 'Down',
	42: 'Print Screen',
	45: 'Insert',
	46: 'Delete',

	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',

	65: 'A',
	66: 'B',
	67: 'C',
	68: 'D',
	69: 'E',
	70: 'F',
	71: 'G',
	72: 'H',
	73: 'I',
	74: 'J',
	75: 'K',
	76: 'L',
	77: 'M',
	78: 'N',
	79: 'O',
	80: 'P',
	81: 'Q',
	82: 'R',
	83: 'S',
	84: 'T',
	85: 'U',
	86: 'V',
	87: 'W',
	88: 'X',
	89: 'Y',
	90: 'Z',

	91: 'Windows',
	93: 'Right Click',

	96: 'Numpad 0',
	97: 'Numpad 1',
	98: 'Numpad 2',
	99: 'Numpad 3',
	100: 'Numpad 4',
	101: 'Numpad 5',
	102: 'Numpad 6',
	103: 'Numpad 7',
	104: 'Numpad 8',
	105: 'Numpad 9',
	106: 'Numpad *',
	107: 'Numpad +',
	109: 'Numpad -',
	110: 'Numpad .',
	111: 'Numpad /',

	112: 'F1',
	113: 'F2',
	114: 'F3',
	115: 'F4',
	116: 'F5',
	117: 'F6',
	118: 'F7',
	119: 'F8',
	120: 'F9',
	121: 'F10',
	122: 'F11',
	123: 'F12',

	144: 'Num Lock',
	145: 'Scroll Lock',
	182: 'My Computer',
	183: 'My Calculator',
	186: ';',
	187: '=',
	188: ',',
	189: '-',
	190: '.',
	191: '/',
	192: '`',
	219: '[',
	220: '\\',
	221: ']',
	222: '\''
};
/**
 * @desc 根据keycode获得键名
 * @param  {Number} keycode 
 * @return {String}
 */
function getKeyName(keycode) {
	if (keyCodeMap[keycode]) {
		return keyCodeMap[keycode];
	} else {
		console.log('Unknow Key(Key Code:' + keycode + ')');
		return '';
	}
};


$(document).off("keydown.backspace").on("keydown.backspace", function (e) {
	if (keyCodeMap[e.keyCode] === "Backspace") {
		var obj = e.target,
			tagName = obj.tagName.toUpperCase(),
			tagType = obj.type && obj.type.toUpperCase();
		if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
			e.preventDefault();
		}

		if (tagName == 'INPUT' && (tagType != 'TEXT' && tagType != 'TEXTAREA' && tagType != 'PASSWORD')) {
			e.preventDefault();
		}

		if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && (obj.readOnly == true || obj.disabled == true)) {
			e.preventDefault();
		}
	}
});
