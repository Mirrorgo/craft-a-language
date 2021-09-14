/*
斐波那契数列

使用make fibo来构建。
使用./fibo来运行。
使用gcc -S fibo.c -o fibo.s来生成汇编代码。
*/

void println(int a);
int tick();

int fibonacci(int n){
    if (n <= 1){
        return n;
    }
    else{
        return fibonacci(n-1) + fibonacci(n-2);
    }
}

int main(){
    // println(fibonacci(30));
    for (int n = 30; n <= 40; n++){
        println(n);
        int t1 = tick();
        println(fibonacci(n));
        int t2 = tick();
        println(t2-t1);
    }
}