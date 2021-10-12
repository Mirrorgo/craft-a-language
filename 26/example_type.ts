/**
 * 类型分析。
 */

//联合类型
let age:string|number;
age = 18;
println("age="+age);
age = "eighteen";
println("age="+age);

//带有值的联合类型
let name1:string|null;
name1 = null;
println("name1="+name1);
name1 = "richard";
println("name1="+name1);

//子类型的处理
let a = 1;     //内部类型是Integer
let b:number;  
b = a;         //Integer可以赋值给Number
println("b="+b);
// a = b;      //反过来赋值则会报错

//Any类型
let c;         //any
c = 3;         //OK
println("c="+c);
c = "hello";   //OK
println("c="+c);

