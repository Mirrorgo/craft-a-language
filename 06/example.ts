/**
 * 示例程序，由play.js解析并执行。
 */

//今年才18
let myAge:number = 18;

//转眼10年过去
myAge = myAge + 10;

println("myAge is: ");
println(myAge);

//一个函数的声明，这个函数很简单，只打印"Hello World!"
function sayHello(){
    println("Hello World!");
}
//调用刚才声明的函数
sayHello();