/*
 29节，测试基础的面向对象功能。
 使用make class来构建。
 使用./class来运行。
 使用gcc -S class.c -o class.s来生成汇编代码。
*/

#include "rt/class.h"
#include "rt/string.h"
#include "rt/sysfuncs.h"

int main(){
    PlayObject* mammal = object_create_by_length(2);

    PlayString* color = string_create_by_cstr("white");

    *((PlayString **)PTR_OBJ_PROP(mammal,0)) = color;
    *((double *)PTR_OBJ_PROP(mammal,1)) = 10;

    println_s(*((PlayString **)PTR_OBJ_PROP(mammal,0)));
    println_d(*((double *)PTR_OBJ_PROP(mammal,1)));
}



