function foo(a:number, b:number):number{
    let x:number;
    let c = a+b;
    if (a>10){
      x = a + c;
    }
    else{
      x = a - b;
    }
    return x;
}

// function bar(a:number):number{
//     let sum:number = 0;
//     for(let i = 1; i <= a; i++){
//         sum = sum + i;
//     }
//     return sum;
// }
