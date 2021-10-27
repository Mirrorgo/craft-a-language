/**
 * 函数式编程特性
 * @param data 
 */

// function println(data:any=""){
//     console.log(data);
// }

//reduce函数：遍历数组中的每个元素，最后返回一个值
function reduce(numbers:number[], fun:(prev:number,cur:number)=>number):number{
    let prev:number = 0;
    for (let i = 0; i < 8; i++){
        prev = fun(prev, numbers[i]);
    }
    return prev;
}

//累计汇总值
function sum(prev:number, cur:number):number{
    return prev + cur;
}

//累计最大值
function max(prev:number, cur:number):number{
    if (prev >= cur)
        return prev;
    else
        return cur;
}

let numbers = [2,3,4,5,7,4,5,2];

let fun1:(prev:number,cur:number)=>number = sum;  //测试给函数变量赋值
println(fun1(10,2)); 

let fun2 = sum;       //测试类型推导
println(fun2(10,3)); 

//综合测试
println(reduce(numbers, sum));
println(reduce(numbers, max));


