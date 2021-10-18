/*
测试for循环

使用make for来构建。
使用./for来运行。
使用gcc -S for.c -o for.s来生成汇编代码。
*/

#include "rt/sysfuncs.h"

int foo1(int n){
    int sum = 0;
    for (int i = 0; i< n; i++){
        sum = sum + i;
    }   
    return sum;
}

long foo2(double n){
    long sum  = 0;
    for (double i = 0; i< n; i++){
        sum = sum + (double)i;
    }   
    return sum;
}

int main(){
    println(foo1(10));
    println_l(foo1(10));
    return 0;
}