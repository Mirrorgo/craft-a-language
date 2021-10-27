
#include "stdio.h"

double reduce(double* numbers, int length, double(*fun)(double, double)){ //使用函数指针
    int prev = 0;
    for (int i = 0; i< length; i++){
        prev = fun(prev, numbers[i]);
    }
    return prev;
}

double max(double prev, double cur){
    if (prev >= cur)
        return prev;
    else
        return cur;
}

double sum(double prev, double cur){
    return prev + cur;
}

int main(){
    double numbers[8] = {2,3,4,5,7,4,5,2};
    printf("%lf\n", reduce(numbers, 8, sum));
    printf("%lf\n", reduce(numbers, 8, max));
}