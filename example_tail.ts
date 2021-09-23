/**
 * 一个尾调用的测试程序。
 * 用foo函数调用bar函数。foo函数的设计，是让它使用较多的栈桢空间，以便测试尾调用复用Caller栈桢的效果。
 */

function foo(p1:number, p2:number, p3:number, p4:number, p5:number, p6:number, p7:number, p8:number):number{
    let x1:number = p1*p2;
    let x2:number = p3*p4;
    let x3:number = x1 + x2 + p5*p6 + bar(p7, p8);
    return bar(x2,x3);
}

/**
 * foo2复杂化了一些，有多个return分支。
 * 这个时候，编译器要能够为尾调用生成jmp指令，而为其他的return语句生成ret指令。
 */
function foo2(p1:number, p2:number, p3:number, p4:number, p5:number, p6:number, p7:number, p8:number):number{
    let x1:number = p1*p2;
    let x2:number = p3*p4;
    let x3:number = x1 + x2 + p5*p6 + bar(p7, p8);
    if(x2 > x3){
        return x2;
    }
    else{
        return bar(x2,x3);
    }
}

function bar(a:number, b:number):number{
    return a+b;
}

println(foo(1,2,3,4,5,6,7,8));
