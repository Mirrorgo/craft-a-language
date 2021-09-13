/**
 * 测试参数的传递。
 * 
 * 使用make example_param来构建。
 * 使用./example_param来运行。
 */
function foo(p1:number, p2:number, p3:number, p4:number, p5:number, p6:number, p7:number, p8:number){
    let x1:number = p1*p2;
    let x2:number = p3*p4;
    return x1 + x2 + p5*p6 + p7*p8;
}

let a = 10;
let b = 12;
println(foo(b,a,3,4,5,6,7,8));

