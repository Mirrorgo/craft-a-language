#include <stdlib.h>
#include <stdio.h>

//全局变量
int global_a = 10;
char * global_b = "hello";

int main(int argc, char** argv){
    printf("命令行参数/\"address\"的地址:\t0x%12lX\n", (size_t)argv[0]);
    printf("命令行参数/argv数组的地址:  \t0x%12lX\n", (size_t)argv);
   
    printf("栈/参数argc的地址:         \t0x%12lX\n", (size_t)&argc);
    printf("栈/参数argv的地址:         \t0x%12lX\n", (size_t)&argv);

    int local_a = 20;
    printf("栈/local_a的地址:         \t0x%12lX\n", (size_t)&local_a);

    int * local_b = (int*)malloc(sizeof(int));
    printf("栈/local_b的地址:         \t0x%12lX\n", (size_t)&local_b);
    printf("堆/local_b指向的地址:      \t0x%12lX\n", (size_t)local_b);
    free(local_b);

    printf("data段/global_b的地址:    \t0x%12lX\n", (size_t)&global_b);

    printf("data段/global_a的地址:    \t0x%12lX\n", (size_t)&global_a);

    printf("text段/\"hello\"的地址:    \t0x%12lX\n", (size_t)global_b);

    printf("text段/main函数的地址:     \t0x%12lX\n", (size_t)main);
}
