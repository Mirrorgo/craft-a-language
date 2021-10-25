/*
 28节，测试数组处理的相关功能。
 使用make array来构建。
 使用./array来运行。
 使用gcc -S array.c -o array.s来生成汇编代码。
*/

#include "rt/array.h"
#include "rt/string.h"
#include "rt/sysfuncs.h"

//看看c语言是如何处理它原生的数组的
double sum(double a[], int length){
    // double ret = 0;
    // for (int i = 0; i< length; i++){
    //     ret += a[i];
    // }
    // return ret;
    return a[2]+a[3];
}

//创建示例的number数组
PlayArray* sample_array_double(){
    //创建数组
    PlayArray * parr = array_create_by_length(3);

    // println_cs("In sample_array_double, addresses:");
    // println_l((long)parr);
    // println_l((long)PTR_ARRAY_ELEM(parr,0));
    // println_l((long)PTR_ARRAY_ELEM(parr,1));
    // println_l((long)PTR_ARRAY_ELEM(parr,2));

    //给数据元素赋值
    *((double *)PTR_ARRAY_ELEM(parr,0)) = 5;
    *((double *)PTR_ARRAY_ELEM(parr,1)) = 10.5;
    *((double *)PTR_ARRAY_ELEM(parr,2)) = 10.6;

    return parr;
}

//把number数组的元素汇总
double sum_array_double(PlayArray * parr){
    //读取数据并汇总
    double sum = 0;
    for (int i = 0; i< parr->length; i++){
        sum += *((double *)PTR_ARRAY_ELEM(parr,i));
    }

    return sum;
}

//创建示例的字符串数组
PlayArray* sample_array_string(){
 //创建数组
    PlayArray * parr = array_create_by_length(2);

    // println_cs("In sample_array_string, addresses:");
    // println_l((long)parr);
    // println_l((long)PTR_ARRAY_ELEM(parr,0));
    // println_l((long)PTR_ARRAY_ELEM(parr,1));

    //给数据元素赋值
    *((PlayString **)PTR_ARRAY_ELEM(parr,0)) = string_create_by_cstr("Hello");
    *((PlayString **)PTR_ARRAY_ELEM(parr,1)) = string_create_by_cstr(" PlayScript!");

    return parr;
}

//把字符串数组的元素拼接在一起，形成一个新的字符串
PlayString* concat_array_string(PlayArray * parr){
    PlayString* pstr;

    if (parr->length > 0)  pstr = *((PlayString**)PTR_ARRAY_ELEM(parr, 0));
    PlayString* pstr1 = *((PlayString**)PTR_ARRAY_ELEM(parr, 0));
    PlayString* pstr2 = *((PlayString**)PTR_ARRAY_ELEM(parr, 1));
    pstr = string_concat(pstr1, pstr2);

    // for (int i = 1; i< parr->length; i++){
    //     PlayString* pstr1 = *((PlayString**)PTR_ARRAY_ELEM(parr, i));
    //     pstr = string_concat(pstr, pstr1);
    // }

    return pstr; 
}

//创建一个示例的二维数组，其中一个维度是double类型，另一个维度是字符串数组
PlayArray * sample_array_2d(){
    //创建数组
    PlayArray * parr = array_create_by_length(2);

    *((PlayArray **)PTR_ARRAY_ELEM(parr,0)) = sample_array_double();
    *((PlayArray **)PTR_ARRAY_ELEM(parr,1)) = sample_array_string();

    return parr;
}

int main(){
    PlayArray * parr = sample_array_2d();

    PlayArray * parr_double = *((PlayArray **)PTR_ARRAY_ELEM(parr,0));

    PlayArray * parr_string = *((PlayArray **)PTR_ARRAY_ELEM(parr,1));

    println_d(sum_array_double(parr_double));

    println_s(concat_array_string(parr_string));
}


