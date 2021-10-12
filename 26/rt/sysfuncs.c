#include <stdio.h>
#include <time.h> 

//打印一个整数
void println(int n){
    printf("%d\n",n);
}

//打印一个整数
void println_d(double n){
    printf("%f\n",n);
}

//打印一个整数
void println_l(long n){
    printf("%ld\n",n);
}

//获得时钟时间
int tick(){
    return clock();
}

double tick_d(){
    return clock();
}
