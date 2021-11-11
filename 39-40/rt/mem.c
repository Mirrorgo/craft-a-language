#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "mem.h"
#include "object.h"

//Arena中，每个内存块的大小
//目前设置为40M
#define ARENA_BLOCK_SIZE 40960  

//占位符，让程序便于阅读
#define BLOCK_DATA   

//////////////////////////////////////////////////////////////////////////
//数据结构：Arena、ArenaBlock
//基于大的内存块，自己做内存管理的机制。

//Arena中的一个数据块。 
typedef struct _ArenaBlock{    
    //在当前块中最大的自由空间，用于加速算法速度
    unsigned int maxFreeSpace;    
    
    //第一个节点的偏移量（从ArenaBlock结构体的底部算起）。
    //由于Block中的第一个节点也可能被释放掉，所以需要记录现存的第一个对象的位置
    unsigned int firstNodeOffset; 

    //后面接着Block的数据区
    BLOCK_DATA
}ArenaBlock;

//一个Arena可以包含多个ArenaBlock。当内存不够用了，就申请一个新的块。 
typedef struct _Arena{
    ArenaBlock ** blocks; 
    unsigned int numBlocks;
}Arena;

//记录内存申请状况的链表
//目前的实现，每个ArenaBlock有一个链表，链表的节点跟数据是放在一起的，放在每个内存对象的前面，
//占据8个字节。内部划分成两部分，分别记录内存块的
typedef struct _ListNode{
    //到下一个内存块的偏移量
    //如果是最后一个节点，那么取值为0
    unsigned int nextNodeOffset;

    //该内存对象的大小+NODE_SIZE, 也就是链表节点所占的内存是含在其中的。
    unsigned int size;
}ListNode;

//节点大小
#define NODE_SIZE sizeof(ListNode)

////////////////////////////////////////////////////////////////////
//对外接口
static Arena* arena = NULL; //静态变量，让编译器更容易计算其中的数据字段的地址。

void* allocFromArena(size_t size);
void returnToArena(Object* obj);
void initArena();

//从Arena中申请内存
Object * PlayAlloc(size_t size){
    // return (void*)malloc(size); 
    if(!arena) initArena();

    // return allocFromArena(size); 

    void * obj = allocFromArena(size);

    printf("obj allocated:\t%lu\n",(size_t)obj);
    return obj;
}

void PlayFree(Object* obj){
    returnToArena(obj);
}

//////////////////////////////////////////////////////////////////
//内部实现

//添加Arena，每次添加一块
void addArenaBlock(){
    ArenaBlock ** newBlocks = (ArenaBlock**)malloc((arena->numBlocks+1)*sizeof(ArenaBlock*));
    memcpy(newBlocks, arena->blocks, arena->numBlocks*sizeof(ArenaBlock*));
    free(arena->blocks);

    arena->numBlocks++;
    arena->blocks=newBlocks;

    //申请一整块内存
    ArenaBlock* block = (ArenaBlock*)malloc(sizeof(ArenaBlock) + ARENA_BLOCK_SIZE*sizeof(unsigned char));
    arena->blocks[arena->numBlocks-1] = block;

    //初始化block
    block -> firstNodeOffset = 0;
    block -> maxFreeSpace = ARENA_BLOCK_SIZE; 
    ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock));
    node->nextNodeOffset = 0;
    node->size = 0;
}

void initArena(){
    arena = (Arena *) malloc(sizeof(Arena));
    arena->numBlocks = 0;
    addArenaBlock();
}

void* allocFromArenaBlock(ArenaBlock * block, size_t size);    
void updateBlockMaxFreeSpace(ArenaBlock* block);

//从Arena中申请内存
//size:内存块的大小
void* allocFromArena(size_t size){
    //目前暂时不支持一次性申请很大块的内存
    if(size > ARENA_BLOCK_SIZE){
        printf("Failed to alloc memory larger than %d", ARENA_BLOCK_SIZE);
        return 0;
    }

    //找到一个block，其自由空间大于size
    ArenaBlock * block = NULL;
    for (unsigned int i = 0; i < arena->numBlocks; i++){
        if (arena->blocks[i]->maxFreeSpace >= size + NODE_SIZE){  //还要有8个字节作为链表的节点
            block = arena->blocks[i];
            break;
        }
    }

    //内存不够的话，添加一个新的Block
    if (!block){
        addArenaBlock();
        block = arena->blocks[arena->numBlocks -1];
    }

    return allocFromArenaBlock(block, size);
}

void* allocFromArenaBlock(ArenaBlock * block, size_t size){
    //在block中基于链表查找自由空间。
    void * mem = NULL;

    //首先看Block前头有没有空间
    if(block -> firstNodeOffset >= size + NODE_SIZE){
        ListNode * newNode = (ListNode*)((size_t)block + sizeof(ArenaBlock));
        newNode->size = size+NODE_SIZE;
        newNode->nextNodeOffset = block -> firstNodeOffset;
        block->firstNodeOffset = 0;
        mem = (void *)((size_t)newNode + NODE_SIZE);
    }
    else{
        // printf("pos1\n");
        unsigned int offset = block -> firstNodeOffset;
        ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + offset);

        while (node->nextNodeOffset>0){
            if (node->nextNodeOffset - offset - node->size >= size + NODE_SIZE){ //有足够大的自由空间

                // printf("pos2\n");
                //创建新节点
                ListNode * newNode = (ListNode *)((size_t)block + sizeof(ArenaBlock) + offset + node->size);
                newNode->size = size+NODE_SIZE;

                //把新节点加入链表，插入两个节点之间
                newNode->nextNodeOffset = node->nextNodeOffset;
                node->nextNodeOffset = offset + node->size;
                mem = (void*)((size_t)newNode + NODE_SIZE);
                break;
            }

            // printf("pos3\n");

            offset = node->nextNodeOffset;
            node = (ListNode *)((size_t)block + sizeof(ArenaBlock) + offset);
        }

        //在列表的最后添加节点
        if(!mem){
            if (ARENA_BLOCK_SIZE - offset >= size + NODE_SIZE){
                // printf("pos4\n");
                //创建新节点
                ListNode * newNode = (ListNode *)((size_t)block + sizeof(ArenaBlock) + offset);
                mem = (void *)((size_t)newNode + NODE_SIZE);
                newNode->size = size+NODE_SIZE;
                newNode->nextNodeOffset = 0;
                node ->nextNodeOffset = offset + newNode->size;

                //在最后设置一个结束标志
                ListNode * endNode = (ListNode *)((size_t)block + sizeof(ArenaBlock) + node ->nextNodeOffset);
                endNode->size = 0;
                endNode->nextNodeOffset = 0;
            }
        }
    }

    updateBlockMaxFreeSpace(block);

    return mem;
}

//缓存块的最大自由空间信息，有利于加快查找速度
void updateBlockMaxFreeSpace(ArenaBlock* block){
    unsigned int maxFreeSpace = 0;

    if(block -> firstNodeOffset > 0){
        maxFreeSpace = block->firstNodeOffset;
    }

    unsigned int offset = block ->firstNodeOffset;
    ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + offset);

    while (node->nextNodeOffset>0){
        // printf("pos5\n");
        unsigned int freeSpace = node->nextNodeOffset - offset - node->size;
        if (freeSpace > maxFreeSpace) maxFreeSpace = freeSpace;

        //继续往前遍历
        offset = node->nextNodeOffset;
        node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + offset);
    }

    //尾部空间
    unsigned int tailSpace = ARENA_BLOCK_SIZE - offset;
    if (tailSpace > maxFreeSpace) maxFreeSpace = tailSpace;

    block->maxFreeSpace = maxFreeSpace;

    // printf("maxFreeSpace:%u\n",maxFreeSpace);
}

//把内存归还arena
void returnToArena(Object* obj){
    //找出obj是在哪个块中
    ArenaBlock * block = NULL;

    //对象的前面就有一个node
    ListNode * node = (ListNode*)((size_t)obj - NODE_SIZE);
    // printf("node address in returnToArena:%lu\n",(size_t)node);

    for (int i = 0; i< arena->numBlocks; i++){
        size_t blockStartAddress = (size_t)arena->blocks[i] + sizeof(ArenaBlock);
        size_t blockEndAddress = blockStartAddress + ARENA_BLOCK_SIZE;
        if (blockStartAddress <= (size_t)node && blockEndAddress >= (size_t)node){
            block = arena->blocks[i];
        }
    }

    if (block){
        //找到node的前序节点
        unsigned int offset = (size_t)node - (size_t)block - sizeof(ArenaBlock);
        // printf("offset in returnToArena:%u\n",offset);
    
        if (block->firstNodeOffset == offset){ //是block的第一个节点
            block->firstNodeOffset = node->nextNodeOffset;
        }
        else{
            unsigned int found = 0;
            ListNode * prevNode = (ListNode*)((size_t)block + sizeof(ArenaBlock) + block->firstNodeOffset);
            while(prevNode->nextNodeOffset >0){ 
                if (prevNode->nextNodeOffset == offset){
                    found = 1;
                    break;
                }
                prevNode = (ListNode*)((size_t)block + sizeof(ArenaBlock) + prevNode->nextNodeOffset);
            }
            if (found ==1){
                prevNode->nextNodeOffset = node->nextNodeOffset;
                updateBlockMaxFreeSpace(block);
            }
            else{
                printf("Cannot find object in the arena block.\n");
            }
        }
    }
    else{
        printf("Cannot find arena block containing object.\n");
    }
}

//gc功能
//如果对象头的标记字的最后一个bit是1,那么就不是垃圾。
//返回总共回收的内存空间的大小（不含ListNode所占空间）
unsigned long gc(){
    unsigned long garbageCollected = 0;

    for (unsigned int i = 0; i< arena->numBlocks; i++){
        ArenaBlock * block = arena->blocks[i];

        ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + block->firstNodeOffset);
        ListNode * prevNode = NULL; //前序节点
        while (node->nextNodeOffset > 0){
            //找到对象
            Object * obj = (Object *)((size_t)node + NODE_SIZE);
            
            if (obj->flags & 0x0000000000000001){ //最后1个比特是1
                //清除标记
                obj->flags = obj->flags & 0xfffffffffffffe;
            }
            else{
                //回收垃圾
                printf("\ncollecting object:\t%lu\n",(size_t)obj);
                if(prevNode == NULL){ //第1个节点
                    block->firstNodeOffset = node->nextNodeOffset;
                }
                else{
                    //如果当前节点是最后一个节点，那么要把node改成新的结束标志
                    ListNode * nextNode = (ListNode*)((size_t)block + sizeof(ArenaBlock) + node->nextNodeOffset); 
                    if (nextNode->nextNodeOffset == 0){
                        node->size = 0;
                        node->nextNodeOffset = 0;
                        break; //结束当前block
                    }
                    else{ //从链条中去掉node节点
                        prevNode -> nextNodeOffset = node->nextNodeOffset;
                    }
                }
            }

            prevNode = node;
            node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + node->nextNodeOffset); 
        }

    }

    return garbageCollected;
}



//释放Arena所占的内存。
void deleteArena(){
    for (int i = 0; i< arena->numBlocks; i++){
        free(arena->blocks[i]);
    }
    free(arena->blocks);
    free(arena);
}

//打印Arena分配的情况
void dumpArenaInfo(){
    unsigned long totalMem = arena->numBlocks * (ARENA_BLOCK_SIZE + sizeof(ArenaBlock));
    printf("Arena: %u block(s), blocksize=%u, total memory ocupied: %ld\n", arena->numBlocks, ARENA_BLOCK_SIZE, totalMem);
    for (unsigned int i = 0; i < arena->numBlocks; i++){
        ArenaBlock * block = arena->blocks[i];
        printf("\tBlock %u: maxFreeSpace=%u\n", i, block->maxFreeSpace);

        ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + block->firstNodeOffset);
        unsigned int offset = block->firstNodeOffset;
        while (node->nextNodeOffset > 0){
            // unsigned int freeSpace = node->nextNodeOffset - offset - node->size;
            printf("\t\tNode: offset=%u, size=%u, nextOffset=%u\n", offset, node->size, node->nextNodeOffset);
            
            offset = node->nextNodeOffset;
            node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + offset); 
        }
    }
}