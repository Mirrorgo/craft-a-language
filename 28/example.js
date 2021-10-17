"use strict";
/**
 * 用来随手编写一些测试程序的文件。
 *
 * 使用make example来构建。
 * 使用./example来运行。
 */
var a;
var b = 4;
var c = "hello";
a = [1, 2, 3 + 3, b]; //, c];
console.log(a);
// println(a[1]);
var a2 = [];
a2.push([1, 2, 3]);
a2.push([4, 5]);
console.log(typeof a2);
console.log(typeof a2[1]);
console.log(typeof a2[0][2]);
// function foo(a:number, b:number):number[]{
//     return [a,b];
// }
// let x1:string;
// let x2:string;
// x1=x2="hello";
