"use strict";
/**
 * 用来随手编写一些测试程序的文件。
 *
 * 使用make example来构建。
 * 使用./example来运行。
 */
function foo8(age) {
    var age1;
    var b = age != null;
    if (b) { //age的值域现在是number
        age1 = age; //OK!
        console.log("" + age1);
    }
    else { //age==null, 值域现在变成了null
        console.log("age is empty!");
    }
}
// let age : string|number;
// function foo(name:string|null){
//     if (name != null){
//         println(name);
//     }
//     // bar(name);
// }
// function bar(str:string){
//     console.log(str);
// }
// let name1 : string|null;
// let a = 3;
// if (a==2 || a==3){
//     println("hello");
// }
// let b:2|3;
// b = 3 ;
// if (b == 2){
//     println("b==2");
// }
