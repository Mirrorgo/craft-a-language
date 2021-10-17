
#include "string.h"
#include "mem.h"

PlayString* string_create_by_length(size_t length){
    //申请内存
    size_t size = sizeof(Object) + sizeof(size_t) + sizeof(unsigned char)*(length+1);
    PlayString * pstr =  (PlayString*)PlayAlloc(size);
    //设置字符串长度
    pstr->length = length;
    // //设置数据指针
    // pstr->data = (char*)(pstr + sizeof(Object) + sizeof(size_t));

    return pstr;
}

PlayString* string_create_by_cstr(const char* str){
    size_t str_length = strlen(str);
    
    PlayString * pstr =  string_create_by_length(str_length);

    //拷贝数据
    strcpy(PTR_CSTRING(pstr), str);
    return pstr;
}

void string_destroy(PlayString* str){
    PlayFree((Object*)str);
}

int string_length(PlayString * str){
    return str->length;
}

PlayString* string_concat(PlayString* str1, PlayString* str2){
    size_t str_length1 = strlen(PTR_CSTRING(str1));
    size_t str_length2 = strlen(PTR_CSTRING(str2));
    size_t size = sizeof(Object) + sizeof(size_t) + sizeof(unsigned char)*(str_length1+str_length2+1);
    //申请内存
    PlayString * pstr = (PlayString*)PlayAlloc(size);
    //设置字符串长度
    pstr->length = str_length1 + str_length2;
    //设置数据指针
    // pstr->data = (char*)(pstr + sizeof(Object) + sizeof(size_t));
    //拷贝数据
    strcpy(PTR_CSTRING(pstr), PTR_CSTRING(str1));
    strcpy(PTR_CSTRING(pstr)+str_length1, PTR_CSTRING(str2));
    return pstr;
}