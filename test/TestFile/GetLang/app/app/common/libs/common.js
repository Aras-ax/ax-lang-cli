

/*******获取屏幕可视宽度*********/
function viewportWidth() {
    var de = document.documentElement;

    return window.innerWidth || (de && de.clientWidth) || document.body.clientWidth || 0;
}
/**********获取屏幕可视高度***************/
function viewportHeight() {
    var de = document.documentElement;

    return window.innerHeight || (de && de.clientHeight) || document.body.clientHeight || 0;
}


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

/***********检查IP 是否为网段或广播IP合法性*/
function checkIsVoildIpMask(ipElem, mask, str) {
    var ip,
        ipArry,
        maskArry,
        len,
        maskArry2 = [],
        netIndex = 0,
        netIndex1 = 0,
        broadIndex = 0,
        i = 0;
    str = str || _("IP Address");
    ip = document.getElementById(ipElem).value;
    //mask = document.getElementById(maskElem).value;

    ipArry = ip.split("."),
    maskArry = mask.split("."),
    len = ipArry.length;

    for (i = 0; i < len; i++) {
        maskArry2[i] = 255 - Number(maskArry[i]);
    }

    for (var k = 0; k < 4; k++) { // ip & mask
        if ((ipArry[k] & maskArry[k]) == 0) {
            netIndex1 += 0;
        } else {
            netIndex1 += 1;
        }
    }
    for (var k = 0; k < 4; k++) { // ip & 255 - mask
        if ((ipArry[k] & maskArry2[k]) == 0) {
            netIndex += 0;
        } else {
            netIndex += 1;
        }
    }

    if (netIndex == 0 || netIndex1 == 0) {
        document.getElementById(ipElem).focus();
        return _("%s can't be the network segment.", [str]);
    }

    for (var j = 0; j < 4; j++) {
        if ((ipArry[j] | maskArry[j]) == 255) {
            broadIndex += 0;
        } else {
            broadIndex += 1;
        }
    }

    if (broadIndex == 0) {
        document.getElementById(ipElem).focus();
        return _("%s can't be the broadcast address.", [str]);
    }

    return;
}

/************检查结束IP地址是否大于起始IP地址*****/
function checkIfLegalIpRange(startIP, endIP) {
    var startArr = startIP.split('.'),
        endArr = endIP.split('.');

    for(var i = 0; i < 4; i++) {
        if(+endArr[i] < +startArr[i]) {
            return false;
        }
    }
    return true;
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


//处理时间变成 天 时分秒
function formatSeconds(value) {
    var theTime = parseInt(value); // 秒 
    var theTime1 = 0; // 分 
    var theTime2 = 0; // 小时
    var theTime3 = 0; // 天
    // alert(theTime); 
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
        // alert(theTime1+"-"+theTime); 
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
            if (theTime2 > 24) {
                theTime3 = parseInt(theTime2 / 24);
                theTime2 = parseInt(theTime2 % 24);
            }
        }
    }
    var result = "" + parseInt(theTime) + _("s");
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1) + _("m") + " " + result;
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2) + _("h") + " " + result;
    }
    if (theTime3 > 0) {
        result = "" + parseInt(theTime3) + _("d") + " " + result;
    }
    return result;
}

function loaddedPage() {
    $("body").removeClass("page-loading");
    $("body").find("fieldset").removeClass("none");
}

var Encode = function () {
    var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function utf16to8(str) {
        var out,
            i,
            len,
            c;

        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    function base64encode(str) {
        var out,
            i,
            len;
        var c1,
            c2,
            c3;

        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += '=';
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }
    return function (s) {
        return base64encode(utf16to8(s));
    };
};


module.exports = {formatSeconds, checkIsVoildIpMask, checkIfLegalIpRange,checkIpInSameSegment, viewportWidth, viewportHeight}