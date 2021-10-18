/*
与数组有关的内置函数。
*/

#ifndef ARRAY_H
#define ARRAY_H

#include "object.h"
#include <string.h>


//获取数组的数据部分的地址
#define PTR_ARRAY_DATA(parr) (void *)((size_t)parr + sizeof(Object) + sizeof(size_t))

//获取数组中某个元素的地址
#define PTR_ARRAY_ELEM(parr, index) (void *)(((size_t)parr + sizeof(Object) + sizeof(size_t)) + sizeof(double)*index)

/**
 * 目前数组对象的设计中，每个数组元素的长度是一样的，都是8字节（64位），可以用来保存对象引用或者是double值。
 * 如果后面支持boolean或其他类型的数组，再考虑规定其他的元素长度。
 */
typedef struct _PlayArray{
    Object object;
    //字符串的长度
    size_t length;  

    //后面跟着的是数组数据
    //我们不需要保存这个指针，只需要在PlayArray对象地址的基础上增加一个偏移量就行。
    // unsigned long* data;     
}PlayArray;

//创建指定元素个数的数组
PlayArray* array_create_by_length(size_t length);

//获取某个元素的地址，以便赋值
// void* array_get_element_address(PlayArray* parr, int index);

void array_destroy(PlayArray* parray);

int array_length(PlayArray * parray);

#endif