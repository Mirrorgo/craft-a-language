/*
测试for循环

使用make for来构建。
使用./for来运行。
使用gcc -S for.c -o for.s来生成汇编代码。
*/

void println(int a);

int main(){
    int sum = 0;
    for (int i = 0; i< 10; i++){
        sum = sum + i;
    }
    println(sum);
    return 0;
}