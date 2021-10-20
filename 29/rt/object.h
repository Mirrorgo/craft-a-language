/**
 * 对象的内存布局
 * 
 * */

#ifndef OBJECT_H
#define OBJECT_H

//所有对象的对象头。目前的设计占用16个字节。
typedef struct _Object{
    //指向类的指针
    struct _Object * ptrKlass; 

    //与并发、垃圾收集有关的标志位。
    unsigned long flags;        
}Object;

#endif