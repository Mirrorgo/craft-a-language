/**
 * 在语义分析中，计算AST节点的常量值。
 */

let a = 3;
let b = 2;
let c = a+b+1;  //c的常量值：5

a = 4;          //a的常量值修改为4.

if (a>1 && c<5){  //a>1的常量值是true， c<10的常量值是false，a>1 || c<5 的常量值是true
    println("hello!");
}
