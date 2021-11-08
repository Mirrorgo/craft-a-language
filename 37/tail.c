/**
 * 一个尾调用的测试程序。
 * 
 * 使用：
 * 通过clang -S tail.c -o tail.s -O2 生成汇编文件。
 * 
 */

int bar(int a, int b);

/**
 * 用foo函数调用bar函数。foo函数的设计，是让它使用较多的栈桢空间，以便测试尾调用复用Caller栈桢的效果。
 * 看看编译器是怎么为第二个bar调用来生成汇编代码的。
 */
int foo(int p1, int p2, int p3, int p4, int p5, int p6, int p7, int p8){
    int x1 = p1*p2;
    int x2 = p3*p4;
    int x3 = x1 + x2 + p5*p6 + bar(p7, p8);
    return bar(x2,x3);
}

/**
 * 如果参数数量超过了6个，那么就没办法复用栈桢了，因为要通过栈桢传参。
 * */
int foo2(int p1, int p2, int p3, int p4, int p5, int p6, int p7, int p8){
    int x1 = p1*p2;
    int x2 = p3*p4;
    return foo1(x1,x2,3,4,5,6,7,8);
}

/**
 * foo3复杂化了一些，有多个return分支。
 * 这个时候，编译器要能够为尾调用生成jmp指令，而为其他的return语句生成ret指令。
 */
int foo3(int p1, int p2, int p3, int p4, int p5, int p6, int p7, int p8){
    int x1 = p1*p2;
    int x2 = p3*p4;
    int x3 = x1 + x2 + p5*p6 + bar(p7, p8);
    if(x2 > x3){
        return x2;
    }
    else{
        return bar(x2,x3);
    }
}