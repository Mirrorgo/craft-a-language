/**
 * 与内存管理有关的功能
 * */

#ifndef MEM_H
#define MEM_H

#include <stdio.h>
#include "object.h"

//申请相应大小的内存
Object * PlayAlloc(size_t size);

//释放内存
void PlayFree(Object* obj);  //todo 应该没啥用

//回收垃圾
//返回值：回收的总的内存空间（不含链表节点）
unsigned long gc();

//打印Arena信息，用于调试
void dumpArenaInfo();

#endif
