/**
 * 变量赋值分析
 */
function foo(a:number):number{
    let b:number;
    let c = a+b;
    if (a > 10){
        b = 1;
    }
    // else{
    //     b = 2;
    // }
    let d = a-b; //如果前面加上else部分，那么b就是被赋值的。
    return c+d;
}

