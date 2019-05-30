var htmlparser = require("htmlparser2");

let code = 'ahha<td id="sdf">this is a demo</td>';
console.log(htmlparser.parseDOM(code));