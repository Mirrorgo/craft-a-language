/*
与自定义类有关的内置函数
*/

#ifndef CLASS_H
#define CLASS_H

#include "object.h"
#include <string.h>

//获取对象的数据部分的地址
#define PTR_OBJ_DATA(pobj) (void *)((size_t)pobj + sizeof(Object)))

//获取对象某个属性的地址
#define PTR_OBJ_PROP(pobj, index) (void *)((size_t)pobj + sizeof(Object) + sizeof(double)*index)

typedef struct _PlayObject{
    Object object;

    // size_t length;  

    //后面跟着的是对象数据  
}PlayObject;

//创建制定数量属性的对象
PlayObject* object_create_by_length(size_t length);


#endif