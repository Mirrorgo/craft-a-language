/**
 * 用于测试寄存器分配算法
 * 
 */

function foo(p1:number,p2:number,p3:number,p4:number,p5:number,p6:number){
    let x7 = p1;
    let x8 = p2;
    let x9 = p3;
    let x10 = p4;
    let x11 = p5;
    let x12 = p6 + x7 + x8 + x9 + x10 + x11;
    
    let sum = x12;
    // for (let i:number = 0; i< 10000; i++){
    //     sum += i;
    // }

    return sum;
}

