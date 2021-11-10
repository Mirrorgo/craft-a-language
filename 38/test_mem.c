#include "rt/mem.h"

int main(){
    void * obj1 = PlayAlloc(32);
    printf("obj1:\t%lu\n",(size_t)obj1);

    void * obj2 = PlayAlloc(40);
    printf("obj2:\t%lu\n",(size_t)obj2);

    void * obj3 = PlayAlloc(40);
    printf("obj3:\t%lu\n",(size_t)obj3);

    dumpArenaInfo();

    printf("\nremove obj2\n");
    PlayFree(obj2);
    dumpArenaInfo();
}



