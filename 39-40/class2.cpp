#include "stdio.h"

class Mammal{
    public:
    double weight;
    //这个方法不可被子类覆盖
    void breath(){
        printf("mammal breath~~\n"); //这里用c语言的库，而不是c++的cout，是为了让生成的汇编代码更简洁
    }
    //这个方法以virtual开头，可以被子类覆盖
    virtual void speak(){
        printf("I'm mammal.\n");
    }
    virtual void run(){
        printf("I'm mammal.\n");
    }
};

class Cat : public Mammal{
    public:
    double jumpHeight;
    //覆盖了父类的speak方法
    void speak(){
        printf("I can jump %lf m.\n", jumpHeight);
    }
    //子类自己的方法
    void catchMouse(){
        printf("I can catch mouse.\n");
    }
};


class Human : public Mammal{
    public:
    double age;
    //覆盖了父类的speak方法
    void speak(){
        printf("I'm %lf years old.\n", age);
    }
};

void foo(Mammal* mammal){
    mammal->breath();
    mammal->speak();
    mammal->run();
}

int main(){
    Cat * cat = new Cat();
    cat->weight = 10;
    cat->jumpHeight = 5;
    
    Human * human = new Human();
    human->weight = 80;
    human->age = 18;

    foo(cat);
    foo(human); 

    delete cat;
    delete human;

    return 0;
}

