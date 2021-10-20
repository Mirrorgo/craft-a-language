/*
测试参数传递。

*/ 

void prlongln(long a);

long foo(long p1, long p2, long p3, long p4, long p5, long p6, long p7, long p8){
    long x1 = p1*p2;
    long x2 = p3*p4;
    return x1 + x2 + p5*p6 + p7*p8;
}

int main(){
    long a = 10;
    long b = 12;
    prlongln(foo(b,a,3,4,5,6,7,8));
    return 0;
}
