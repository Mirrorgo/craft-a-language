/**
 * 测试参数的传递。
 * 
 * 使用make example_param来构建。
 * 使用./example_param来运行。
 */
function foo(p1:number, p2:number, p3:number, p4:number, p5:number, p6:number, p7:number, p8:number):number{
    let x1:number = p1*p2;
    let x2:number = p3*p4;
    return x1 + x2 + p5*p6 + p7*p8;
}

let a:number = 10.2;
let b:number = 12.1;
let c:number = a*b + foo(a,b,1,2,3,4,5,6) + foo(b,a,7.2,8.3,9.4,10.5,11.6,12.1);
println(c);

// println(foo(1,2,3,4,5,6,7,8)+foo(2,3,4,5,6,7,8,9));


