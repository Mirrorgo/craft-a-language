
//删除公共子表达式
function commonSubExp(a:number, b:number):number{
    let x = a + b;
    let y = a + b;
    let z = a + b + 10;
    let m = x + y + z
    return m;
}

// 拷贝传播
function copyPropagation(a:number, b:number):number{
    let x = a + b;
    let y = x;
    let z = y - x;
    return z;
}

//删除死代码
function deadCode(a:number, b:number):number{
    let x = a + b;
    let y = a - b;
    let dc = a - 2;
    let z = x + y + 10;
    return z;
}
