/*
 27节，测试字符串相关的内置函数。
 使用make str来构建。
 使用./str来运行。
 使用gcc -S str.c -o str.s来生成汇编代码。
*/

#include "rt/string.h"
#include "rt/number.h"
#include "rt/sysfuncs.h"

void foo(){
    println_cs("Hello PlayScript!");
}

int main(){
    println_cs("Hello PlayScript!");

    PlayString* pstr1 = string_create_by_cstr("Hello ");
    PlayString* pstr2 = string_create_by_cstr("PlayScript!");

    PlayString* pstr3 = string_concat(pstr1, pstr2);

    println_s(pstr3);

    PlayString* pstr4 = double_to_string(10.5);

    println_s(pstr4);

}