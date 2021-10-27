/**
 * 求阶乘的函数。用于测试对尾递归和尾调用的优化。
 * 
 * 使用make example_fact来构建。
 * 使用./example_fact来运行。
 */

function factorial (n:number, total:number):number{
    if (n <= 1)
      return total;
    else
      return factorial(n-1, n*total); 
}

println(factorial(10,1));

let t1 = tick();
for (let i:number = 0; i< 100000000; i++){
    factorial(15,1);
}
let t2 = tick();
println(t2-t1);