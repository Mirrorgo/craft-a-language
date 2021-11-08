/**
 * 测试for循环的编译
 * 
 * 使用make example_for来构建。
 * 使用./example_for来运行。
 */

let sum:number = 0;

for (let i:number =0; i<10; i++){
    sum = sum + i;
}

println(sum);