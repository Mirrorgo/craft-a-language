/*
 测试一元表达式
 使用make unary来构建。
 使用./unary来运行。
 使用gcc -S unary.c -o unary.s来生成汇编代码。
*/

void println(int a);

int main(){
    int a = 10;
    int b = a++ + 1;
    int c = ++a + 1;
    int d = -a;
    println(b);
    println(c);
    println(d);
    return 0;
}