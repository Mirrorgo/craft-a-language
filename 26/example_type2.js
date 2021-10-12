"use strict";
/**
 * 测试一些更深入的类型分析的例子。
 *
 * 使用make example来构建。
 * 使用./example来运行。
 */
// function foo1(age : number|null){
//     let age1 : string|number;
//     age1 = age;  //编译器在这里会检查出错误。
//     console.log(age1);
// }
// function foo2(age1 : number|null, age2:string|number){
//     if (age1 >= age2){  //OK。只要两个类型有交集就可以。
//         console.log("same age!");
//     }
// }
// function foo3(x : number|null, y:string|boolean){
//     if (x == y){   //编译器报错：两个类型没有交集
//         console.log("x and y is the same");
//     }
// }
// function foo4(age1 : number|null, age2:string|number){
//     if (age1 >= age2){  //编译器报错
//         console.log("same age!");
//     }
// }
// function foo5(age1 : number, age2:string|number){
//     if (age1 >= age2){  //OK。
//         console.log("same age!");
//     }
// }
// function foo6(age : number|null){
//     let age1 : string|number;
//     age = 18;     //age的类型现在变成了一个值类型：18
//     age1 = age;   //这里编译器不再报错。
//     console.log(age1);
// }
// function foo7(age : number|null){
//     let age1 : string|number;
//     age = 18;     //age的值域现在变成了一个值类型：18
//     age1 = age;   //这里编译器不再报错。
//     age = null;   //age的值域现在变成了null
//     age1 = age;   //错误！
//     console.log(age1);
// }
// function foo8(age : number|null){
//     let age1 : string|number;
//     if (age != null){   //age的值域现在是number
//         age1 = age;     //OK!
//         console.log(age1);
//     }
//     else{               //age==null, 值域现在变成了null
//         console.log("age is empty!")
//     }
// }
// function foo9(age : number|null){
//     if (age == 18 || age == 81){  //age的值域现在是 18|81
//         console.log("18 or 81");
//     }
//     else{                         //age的值域是 !18 & !81 & (number | null)
//         console.log("age is empty!")
//     }
// }
// function foo10(x : number|string, y : string){
//    x = y;    //x的值域变成了string
//    if (typeof x == 'string'){  //其实这个条件一定为true
//        console.log("x is string");
//    }
// }
function foo11(x) {
    var y;
    var z;
    if (x > 10) {
        y = x; //y的值域是number
    }
    else {
        y = 18; //y的值域是18
    } //if语句之后，y的值域是number       
    z = y;
    return z;
}
// function foo(name:string|null){
//     if (name != null){
//         println(name);
//     }
//     else{
//         println("Name is empty!");
//     }
// }
// let age : string|number;
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
