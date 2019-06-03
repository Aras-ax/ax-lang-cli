alert('VLAN ID "' + vid + '" is out of range [0-4095].');
alert(esprima.tf + 3);
alert((2 + 3) + '3');
alert("No Vlan Id is specified when Vlan mode is enable");
document.write("<td class='hd'>DSL PHY and Driver Version:</td>");
document.write("<td class='hd'>DSL PHY and" + name + " Driver Version:</td>");

var text = 'tt';
var enblSiproxd = '<%ejGet(enblSiproxd)%>';
var refresh = '<%ejGet(glbRefresh)%>';
var sessionKey = '<%ejGetOther(sessionKey)%>';
var t = 'this is \\\'t what t';
alert("No Vlan Id is specified when Vlan mode is enable");
var t = 'this is what a what';
document.write("<td class='hd'>DSL PHY and Driver Version:</td>");
if (1 == 2) {
    alert(1);
}
for (i = 0; j < vlanRule.length; i++) {
    if (vlanRule != '') {
        var vlan = vlanRule[i].split('/');
        document.write("<tr align='center'>");
        document.write("<td><input type='text' id='vid" + i + "' value='" + vlan[0] + "'></td>");
        document.write("<td><input type='text' id='pbits" + i + "' value='" + vlan[1] + "'></td>");
        document.write("<td><input type='checkbox' id='rml" + i + "'></td>");
        document.write("</tr>");
    }
}

function encodeUrl(val) {
    var len = val.length;
    var i = 0;
    var newStr = "";
    var original = val;

    for (i = 0; i < len; i++) {
        if (val.substring(i, i + 1).charCodeAt(0) < 255) {
            // hack to eliminate the rest of unicode from this
            if (isUnsafe(val.substring(i, i + 1)) == false)
                newStr = newStr + val.substring(i, i + 1);
            else
                newStr = newStr + convert(val.substring(i, i + 1));
        } else {
            // woopsie! restore.
            alert("Found a non-ISO-8859-1 character at position: " + (i + 1) + ",\nPlease eliminate before continuing.");
            newStr = original;
            // short-circuit the loop and exit
            i = len;
        }
    }

    return newStr;
}