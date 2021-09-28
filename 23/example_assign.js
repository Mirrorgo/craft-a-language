"use strict";
/**
 * 变量赋值分析
 */
function foo(a) {
    var b;
    var c = a + b;
    if (a > 10) {
        b = 1;
    }
    else {
        b = 2;
    }
    var d = a - b;
    return c + d;
}
