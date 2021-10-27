"use strict";
/**
 * 函数式编程特性
 * @param data
 */
function println(data) {
    if (data === void 0) { data = ""; }
    console.log(data);
}
function reduce(numbers, fun) {
    var prev = 0;
    for (var i = 0; i < numbers.length; i++) {
        prev = fun(prev, numbers[i]);
    }
    return prev;
}
function sum(prev, cur) {
    return prev + cur;
}
function max(prev, cur) {
    if (prev >= cur) {
        return prev;
    }
    else {
        return cur;
    }
}
var numbers = [2, 3, 4, 5, 7, 4, 5, 2];
println(reduce(numbers, sum));
println(reduce(numbers, max));
