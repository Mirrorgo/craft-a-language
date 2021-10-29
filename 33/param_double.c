/*
测试参数传递。
使用make param来构建。
使用./param来运行。
使用gcc -S param.c -o param.s来生成汇编代码。
*/ 

void println(double a);

// double foo(double p1, double p2, double p3, double p4, double p5, double p6, double p7, double p8, double p9, double p10){
//     double x1 = p1*p2;
//     double x2 = p3*p4;
//     return x1 + x2 + p5*p6 + p7*p8 + p9+ p10;
// }

//为避免过程间优化，只提供一个函数声明
double foo(double p1, double p2, double p3, double p4, double p5, double p6, double p7, double p8, double p9, double p10);

// double bar(double p1, double p2, double p3, double p4, double p5, double p6, double p7, double p8, double p9, double p10){
//     double x1 = p1*p2;
//     double x2 = p3*p4;
//     double x3 = foo(x1,x2,p3,p4,p5,6,7,8,9,10);
//     double x4 = foo(x1,x2,x3,p4,p5,p6,p7,p8,p9,p10);
//     return x4+p10;
// }

double bar(){
    return foo(1, 2, 3, 4, 5, 6.1, 7.2, 8.3, 9.4, 10.5);
}

double bar1(){
    return foo(12, 21, 23, 34, 5, 6.1, 7.2, 8.3, 9.4, 10.5);
}

// int main(){
//     double c = a*b + foo(1,2,3,4,5,6,9,10,11,12);
//     println(c);
//     return 0;
// }
