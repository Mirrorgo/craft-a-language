#include "stdio.h"
#include "rt/object.h"

int main(){
    printf("%lu\n",sizeof(char));
    printf("%lu\n",sizeof(int));
    printf("%lu\n",sizeof(Object));
    double a = 1.34;
    printf("%f\n",a);
}