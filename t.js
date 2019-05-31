var htmlparser = require("htmlparser2");
const {
    JSDOM
} = require("jsdom");
let code = 'ahha<td id="sdf">this is a demo</td>';
// console.log(htmlparser.parseDOM(code));
console.log(new JSDOM(code));