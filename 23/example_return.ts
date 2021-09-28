/**
 * 语义分析功能：检查是否所有的程序分枝都会以return结尾。
 */

function foo(a:number):number{
    if (a > 10){
        let b:number = a+5;
        return b;
        b = a + 10; //这段代码不可到达。
    }
} 

println(foo(15));
// println(foo(5));