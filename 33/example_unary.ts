/**
 * 测试一元运算。
 * 
 * 使用make example_unary来构建。
 * 使用./example_unary来运行。
 */

let a = 10;
let b = a++ + 1;
let c = ++a + 1;
let d = -a;
println(b);
println(c);
println(d);