/*
测试条件语句是如何生成汇编代码的。

使用make if来构建。
使用./if来运行。
使用gcc -S if.c -o if.s来生成汇编代码。
 */

void println(int a);

int foo(int a, int b){
    if (a>b){
        return a+5;
    }
    else{
        return a-5;
    }
}

int main(){
    println(foo(15,10));
    println(foo(10,10));
}