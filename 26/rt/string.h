#ifndef STRING_H
#define STRING_H

#include "object.h"
#include <string.h>

typedef struct _PlayString{
    Object object;
    //字符串的长度
    size_t length;  

    //后面跟以0结尾的字符串，以便复用C语言的一些功能。实际占用内存是length+1。
    //我们不需要保存这个指针，只需要在PlayString对象地址的基础上增加一个偏移量就行。
    char* data;     
}PlayString;

//创建指定长度的字符串
PlayString* string_create_by_length(size_t length);

//创建指定长度的字符串
PlayString* string_create_by_str(const char* str);

void string_destroy(PlayString* str);

int string_length(PlayString * str);

//连接字符串
PlayString* string_concat(PlayString* str1, PlayString* str2);

#endif

