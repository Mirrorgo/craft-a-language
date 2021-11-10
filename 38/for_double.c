/*
测试for循环

使用make for_double来构建。
使用./for_double来运行。
使用gcc -S for_double.c -o for_double.s来生成汇编代码。
*/

void println(double a);

int main(){
    double sum = 0;
    for (double i = 0; i< 10; i++){
        sum = sum + i;
    }
    println(sum);
    return 0;
}