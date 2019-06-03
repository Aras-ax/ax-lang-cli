/*-- hi*/
var buildGpon = '                                 1';
var maxGemPort = 1;

function applyClick(intfEnable) {
    // lst format: monitor_interface|direction(1[out],0[in])|
    // mirror_interface|status(1[enabled],0[disabled]),
    with(document.forms[0]) {
        var lst = '';
        var loc = 'engdebug.cmd?action=apply';

        if (intfEnable.length > 0) {
            for (i = 0; i < intfEnable.length; i++) {

                if (buildGpon == '1') {
                    var mask;
                    for (j = 0; j < gemMask.length; j++) {
                        mask = parseInt(gemMask[i].value, 16);
                        if (mask == NaN) {
                            if (j < (gemMask.length / 2))
                                alert("Invalid IN GemPortMask");
                            else
                                alert("Invalid OUT GemPortMask");
                            return;
                        }
                    }
                    for (j = 0; j < gemMask.length / 2; j++) {
                        lst = lst + gemMask[(i * gemMask.length / 2) + j].value;
                        if (j == ((gemMask.length / 2) - 1))
                            lst = lst + "-|";
                        else
                            lst = lst + "-";
                    }
                }
                lst = lst + intfEnable[i].value + '|' + mirrorIntf[i].value + '|';
                if (intfEnable[i].checked == true)
                    lst = lst + '1,';
                else
                    lst = lst + '0,';

            }
        }

        loc += '&mirrorLst=' + lst;
        loc += '&sessionKey=                         1';
        var code = 'location="' + loc + '"';
        eval(code);
    }
}
// done hiding 100