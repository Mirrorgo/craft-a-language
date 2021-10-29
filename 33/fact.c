/**
 * 求阶乘的函数。用于测试对尾递归和尾调用的优化。
 * 
 * 使用make fact来构建。
 * 使用./fact来运行。
 */

void println_l(long a);

long factorial (long n, long total){
    if (n <= 1)
      return total;
    else
      return factorial(n-1, n*total); 
}

int main(){
    println_l(factorial(10,1));
    return 0;
}