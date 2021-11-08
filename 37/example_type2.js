"use strict";
/**
 * 测试一些更深入的类型分析的例子。
 *
 */
// function foo1(age : number|null){
//     println("foo1");
//     let age1 : string|number;
//     age1 = age;  //编译器在这里会检查出错误。
// }
// function foo2(age1 : number|null, age2:string|number){
//     println("foo2");
//     if (age1 == age2){  //OK。只要两个类型有交集就可以。
//         // console.log("same age!");
//         println("same age!");
//     }
// }
// function foo3(x : number|null, y:string|boolean){
//     println("foo3");
//     if (x == y){   //编译器报错：两个类型没有交集
//         println("x and y is the same");
//     }
// }
// function foo4(age1 : number|null, age2:string|number){
//     println("foo4");
//     if (age1 >= age2){  //编译器报错
//         println("bigger age!");
//     }
// }
// function foo5(age1 : number, age2:string|number){
//     println("foo5");
//     if (age1 >= age2){  //OK。
//         println("bigger age!");
//     }
// }
// function foo6(age : number|null){
//     println("foo6");
//     let age1 : string|number;
//     age = 18;     //age的类型现在变成了一个值类型：18
//     age1 = age;   //这里编译器不再报错。
//     println(""+age1);
//     // console.log(age1);
// }
// foo6(18);
// function foo7(age : number|null){
//     println("foo7");
//     let age1 : string|number;
//     age = 18;     //age的值域现在变成了一个值类型：18
//     age1 = age;   //这里编译器不再报错。
//     age = null;   //age的值域现在变成了null
//     age1 = age;   //错误！
//     println(""+age1);
//     // console.log(age1);
// }
// function foo8(age : number|null){
//     println("foo8");
//     let age1 : string|number;
//     if (age != null){   //age的值域现在是number
//         age1 = age;     //OK!
//         println(""+age1);
//     }
//     else{               //age==null, 值域现在变成了null
//         println("age is empty!");
//     }
// }
/**
 * 注意，必须把等值表达式"age != null"放在if条件里才能被语义分析程序所使用。如果把它放在外面，
 * 再用tsc --strict编译，仍然会报错。所以，编译器的智能程度还有待于进一步提升:)
 */
// function foo8_1(age : number|null){
//     let age1 : string|number;
//     let b = age != null;
//     if (b){   
//         age1 = age;     //这里编译器会报错！
//         console.log(""+age1);
//     }
//     else{               
//         console.log("age is empty!");
//     }
// }
// function foo9(age : number|null){
//     println("foo9");
//     if (age == 18 || age == 81){  //age的值域现在是 18|81
//         println("18 or 81");
//     }
//     else{                         //age的值域是 !18 & !81 & (number | null)
//         println("age is empty!");
//     }
// }
// foo9(18);
// foo9(null);
// function foo10(x : number|string, y : string){
//    x = y;    //x的值域变成了string
//    if (typeof x == 'string'){  //其实这个条件一定为true
//        println("x is string");
//    }
// }
// let a:any;
// let b:number|undefined;
// console.log(typeof a);
// console.log(typeof b);
function foo81(age) {
    var age1;
    if (age === null) { //age的值域现在是number
        age1 = age; //OK!
    }
}
// function foo11(x : number|string){
//     let y: string;
//     if (typeof x == 'string'){  //x的值域变为string
//         y = x;                  //OK。
//     }
// }
// function foo12(x : string|null){
//     let y: string;
//     if (x){  //x的值域变为string & !""
//         y = x;                  //OK。
//     }
// }
// function foo13(x : number|null){
//     let y:number|string;
//     let z:number;
//     if (x != null){ //x的值域是number 
//         y = x;      //y的值域是number
//     }
//     else{
//         y = 18;     //y的值域是18
//     }               //if语句之后，y的值域是number       
//     z = y;          //OK。
//     return z;
// }
// function foo14(x : number|null){
//     let y:number|string;
//     let z:number;
//     if (x != null){ //x的值域是number 
//         y = x;      //y的值域是number
//     }
//     else{
//         y = "eighteen"; //y的值域是18
//     }               //if语句之后，y的值域是number|"eighteen"       
//     z = y;          //编译器报错！
//     return z;
// }
// function foo15(x1:number|null):number{
//     let x2 = 10;       //x2是常量10
//     let x3 = x2 + 8;   //x3是常量18
//     if (x1 == x3 ){    //并且x1的值域是18
//         return x1;     //OK!
//     }
//     return x2;
// }
// function foo16(a:number|string){
//     a = "hello";    //a的值域是"hello"
//     let b = a;      //推导出b的类型是string
//     console.log(typeof b); 
// }
// function foo17(a:number|string|null){
//     if(a == 10 || a == null){ //a的值域是10|null
//         let b = a;            //推导出b的类型是number|null
//         if (b == "hello"){    //编译器报错！
//             console.log("whoops"); 
//         }
//     }
// }
