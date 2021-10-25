/*
斐波那契数列(double版)

使用make fibo_double来构建。
使用./fibo来运行。
使用gcc -S fibo_double.c -o fibo_double.s来生成汇编代码。
*/

void println_d(double a);
double tick_d();

double fibonacci(double n){
    if (n <= 1){
        return n;
    }
    else{
        return fibonacci(n-1) + fibonacci(n-2);
    }
}

int main(){
    // println(fibonacci(30));
    for (double n = 30; n <= 40; n++){
        println_d(n);
        double t1 = tick_d();
        println_d(fibonacci(n));
        double t2 = tick_d();
        println_d(t2-t1);
    }
}