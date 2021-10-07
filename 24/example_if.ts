/**
 * 测试对条件语句的编译能力
 * 
 * 使用make example_if来构建。
 * 使用./example_if来运行。
 */
function foo(a:number, b:number):number{
    if (a>b){
        return a+5;
    }
    else{
        return a-5;
    }
}

println(foo(15,10));

println(foo(10,10));
