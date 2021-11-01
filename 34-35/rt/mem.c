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
static Arena* arena; //静态变量，让编译器更容易计算其中的数据字段的地址。

void* allocFromArena(size_t size);
void returnToArena(Object* obj);
void initArena();

//从Arena中申请内存
Object * PlayAlloc(size_t size){
    return (void*)malloc(size); 

    // if(!arena) initArena();

    // return (void*)allocFromArena(size); 
}

void PlayFree(Object* obj){
    // returnToArena(obj);
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
        mem = (void *)(newNode + NODE_SIZE);
    }
    else{
        unsigned int currentOffset = block -> firstNodeOffset;
        ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + currentOffset);

        while (!mem && node->nextNodeOffset>0){
            if (node->nextNodeOffset - currentOffset - node->size >= size + NODE_SIZE){
                //创建新节点
                ListNode * newNode = (ListNode *)((size_t)block + sizeof(ArenaBlock) + currentOffset + node->size);
                newNode->size = size+NODE_SIZE;

                //把新节点加入链表
                newNode->nextNodeOffset = node->nextNodeOffset;
                node->nextNodeOffset = currentOffset + newNode->size;
                mem = (void*)(newNode + NODE_SIZE);
                break;
            }

            currentOffset = node->nextNodeOffset;
            node = (ListNode *)((size_t)block + sizeof(ArenaBlock) + currentOffset);
        }

        //在列表的最后添加节点
        if(!mem){
            if (ARENA_BLOCK_SIZE - currentOffset >= size + NODE_SIZE){
                //创建新节点
                ListNode * newNode = (ListNode *)((size_t)block + sizeof(ArenaBlock) + currentOffset);
                newNode->size = size+NODE_SIZE;
                newNode->nextNodeOffset = 0;
                if (currentOffset >0){ //不是空块
                    node ->nextNodeOffset = currentOffset + newNode->size;
                }
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

    unsigned int currentOffset = block ->firstNodeOffset;
    ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + currentOffset);

    while (node->nextNodeOffset>0){
        ListNode * nextNode = (ListNode*)((size_t)block + sizeof(ArenaBlock) + node->nextNodeOffset);
        unsigned int freeSpace = node->nextNodeOffset - currentOffset - node->size;
        if (freeSpace > maxFreeSpace) maxFreeSpace = freeSpace;

        //继续往前遍历
        currentOffset = node->nextNodeOffset;
        node = nextNode;
    }

    block->maxFreeSpace = maxFreeSpace;
}

//把内存归还arena
// void returnToArena(Object* obj){
//     //找出obj是在哪个块中
//     ArenaBlock * block = NULL;

//     for (int i = 0; i< arena->numBlocks; i++){
//         size_t blockStartAddress = (size_t)(arena->blocks[i]);
//         if (blockStartAddress <)
//     }

// }

//释放Arena所占的内存。
void deleteArena(){
    for (int i = 0; i< arena->numBlocks; i++){
        free(arena->blocks[i]);
    }
    free(arena->blocks);
}

//打印Arena分配的情况
void dumpArenaInfo(){
    unsigned long totalMem = arena->numBlocks * (ARENA_BLOCK_SIZE + sizeof(ArenaBlock));
    printf("Arena: %ud blocks, blocksize=%ud\n, total memory: %ld", arena->numBlocks, ARENA_BLOCK_SIZE, totalMem);
    for (unsigned int i = 0; i < arena->numBlocks; i++){
        ArenaBlock * block = arena->blocks[i];
        printf("\tBlock %ud: maxFreeSpace=%ud\n", i, block->maxFreeSpace);
        ListNode * node = (ListNode*)((size_t)block + sizeof(ArenaBlock) + block->firstNodeOffset);
        unsigned int currentOffset = block->firstNodeOffset;
        while (node->size > 0){
            printf("\t\tNode: offset=%ud, size=%ud, nextOffset=%ud\n", currentOffset, node->size, node->nextNodeOffset);
        }
    }
}