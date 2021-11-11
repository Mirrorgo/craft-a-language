#include <stdio.h>
#include <string.h>
#include "rt/object.h"
#include "rt/mem.h"

//遍历栈桢
void frame_walker1(unsigned long rbpValue0){

    //当前栈桢的rbp值
    printf("\nrbpValue0:\t0x%lx(%ld)\n", rbpValue0, rbpValue0);  
    
    //往前一个栈桢的rbp值
    unsigned long rbpValue1 = *(unsigned long*)rbpValue0;
    printf("rbpValue1:\t0x%lx(%ld)\n", rbpValue1, rbpValue1);  

    //再往前一个栈桢
    unsigned long rbpValue2 = *(unsigned long*)rbpValue1;   
    printf("rbpValue2:\t0x%lx(%ld)\n", rbpValue2, rbpValue2);  

    //再往前一个栈桢
    unsigned long rbpValue3 = *(unsigned long*)rbpValue2;   
    printf("rbpValue3:\t0x%lx(%ld)\n", rbpValue3, rbpValue3);  
    
    //再往前一个栈桢
    unsigned long rbpValue4 = *(unsigned long*)rbpValue3;   
    printf("rbpValue4:\t0x%lx(%ld)\n", rbpValue4, rbpValue4);  
}

void frame_walker2(unsigned long rbpValue){
    printf("\nwalking the stack:\n");
    while(1){
        //rbp寄存器的值，也就是栈底的地址
        printf("rbp value:\t\t\t0x%lx(%ld)\n", rbpValue, rbpValue); 

        //函数元数据区的地址
        unsigned long metaAddress = *(unsigned long*)(rbpValue -8);
        printf("address of function meta:\t0x%lx(%ld)\n", metaAddress, metaAddress);

        //函数名称的地址，位于元数据区的第一个位置
        unsigned long pFunName = *(unsigned long*)metaAddress;
        printf("address of function name:\t0x%lx(%ld)\n", pFunName,pFunName);

        //到函数名称区，去获取函数名称
        const char* funName = (const char*)pFunName;
        printf("function name:\t\t\t%s\n", funName);

        //变量数量，位于元数据区的第二个位置
        unsigned long numVars = *(unsigned long*)(metaAddress+8);
        printf("number of vars:\t\t\t%ld\n", numVars);

        //遍历所有的变量
        for (int i = 0; i< numVars; i++){
            //获取变量属性的压缩格式，3个属性压缩到了8个字节中
            unsigned long varAttr = *(unsigned long*)(metaAddress+8*(i+2));
            printf("var attribute(compact):\t\t0x%lx(%ld)\n", varAttr,varAttr);

            //拆解出变量的属性
            unsigned long varIndex = varAttr>>32;  //变量下标，4个字节
            unsigned long typeTag =  (varAttr>>24) & 0x00000000000000ff; //变量类型编号，1个字节
            unsigned long offset = varAttr & 0x0000000000ffffff;   //变量在栈桢中的地址偏移量

            printf("var attribute(decoded):\t\tvarIndex:%ld, typeTag:%ld, offset:%ld\n", varIndex, typeTag, offset);
        }

        //去遍历上一个栈桢
        rbpValue = *(unsigned long*)rbpValue;

        printf("\n");

        //如果遇到main函数，则退出
        if (strcmp(funName, "main")==0) break;
    }
}

//遍历栈桢，并GC所引用的对象做标记
void frame_walker(unsigned long rbpValue){
    printf("\nwalking the stack:\n");
    printf("\nbefore gc, dump the arena:\n");
    dumpArenaInfo();

    while(1){
        //函数元数据区的地址
        unsigned long metaAddress = *(unsigned long*)(rbpValue -8);

        //函数名称的地址，位于元数据区的第一个位置
        unsigned long pFunName = *(unsigned long*)metaAddress;

        //到函数名称区，去获取函数名称
        const char* funName = (const char*)pFunName;

        //变量数量，位于元数据区的第二个位置
        unsigned long numVars = *(unsigned long*)(metaAddress+8);

        //遍历所有的变量
        for (int i = 0; i< numVars; i++){
            //获取变量属性的压缩格式，3个属性压缩到了8个字节中
            unsigned long varAttr = *(unsigned long*)(metaAddress+8*(i+2));
            //拆解出变量的属性
            unsigned long varIndex = varAttr>>32;  //变量下标，4个字节
            unsigned long typeTag =  (varAttr>>24) & 0x00000000000000ff; //变量类型编号，1个字节
            unsigned long offset = varAttr & 0x0000000000ffffff;   //变量在栈桢中的地址偏移量

            if(typeTag >= 5 && typeTag <=8){ //GC
                //计算对象地址
                unsigned long objRef= *(unsigned long *)(rbpValue - offset);
                printf("address of obj to set flag:\t%lu\n",objRef);

                Object * obj = (Object *)objRef;

                //做标记
                obj->flags = obj->flags | 0x0000000000000001; //在最后一个bit做标记
                printf("Flag set for function: %s, varIndex:%ld, typeTag:%ld, offset:%ld\n", funName, varIndex, typeTag, offset);
            }
        }

        //去遍历上一个栈桢
        rbpValue = *(unsigned long*)rbpValue;

        //如果遇到main函数，则退出
        if (strcmp(funName, "main")==0) break;
    }

    //回收垃圾
    gc();

    //打印栈桢情况
    printf("\nafter gc, dump the arena:\n");
    dumpArenaInfo();
}



