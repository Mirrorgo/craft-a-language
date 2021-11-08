#include <stdio.h>
#include <time.h> 

#include "string.h"

//打印一个整数
void println(int n){
    printf("%d\n",n);
}

//打印一个double
void println_d(double n){
    printf("%f\n",n);
}

//打印一个long
void println_l(long n){
    printf("%ld\n",n);
}

//打印一个C字符串
void println_cs(const char* str){
    printf("%s\n",str);
}

//打印一个PlayScript字符串
void println_s(PlayString* pstr){
    printf("%s\n",PTR_CSTRING(pstr));
}

//获得时钟时间
int tick(){
    return clock();
}

double tick_d(){
    return clock();
}
