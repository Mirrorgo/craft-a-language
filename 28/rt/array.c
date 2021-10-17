/*
与数组有关的内置函数。
*/

#include "array.h"
#include "mem.h"

//创建指定元素个数的数组
PlayArray* array_create_by_length(size_t length){
    //申请内存
    size_t size = sizeof(Object) + sizeof(size_t) + sizeof(unsigned char)*(length);

    PlayArray * parr =  (PlayArray*)PlayAlloc(size);
    
    //设置数组长度
    parr->length = length;
    // //设置数据指针
    // pstr->data = (char*)(pstr + sizeof(Object) + sizeof(size_t));

    return parr;
}

//获取某个元素
void* array_get_element(PlayArray* parr, int index){
    if (index < parr->length){
        return (void*)(PTR_ARRAY_DATA(parr) + sizeof(unsigned long)*index);
    }
    else{
        return 0;   //todo 这里应该产生运行时异常。
    }
}

//获取某个元素的地址，以便赋值。
// void* array_get_element_address(PlayArray* parr, int index){
//     if (index < parr->length){
//         return PTR_ARRAY_DATA(parr) + sizeof(unsigned long)*index;
//     }
//     else{
//         return 0;   //todo 这里应该产生运行时异常。
//     }
// }

void array_destroy(PlayArray* parr){
    PlayFree((Object*)parr);
}

int array_length(PlayArray * parr){
    return parr->length;
}