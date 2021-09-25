"use strict";
/**
 * 类型分析。
 */
// function foo1(a:number|null){
//     let b:number = a + 1;
//     if (a != null){
//         let c:number = a + 2;
//     }
// }
// function foo2(a:number|string){
//     let b:number = a + 1;
//     if (typeof a == 'number'){
//         let c:number = a + 2;
//     }
// }
function foo3() {
    var a = 3;
    var b = a + 2;
    a = "hello";
    var c = a * 3;
    return c;
}
console.log(foo3());
