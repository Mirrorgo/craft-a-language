/**
 * 用来随手编写一些测试程序的文件。
 * 
 * 使用make example来构建。
 * 使用./example来运行。
 */

class Human{
    swim(){
        console.log("swim");
    }
}

class Bird{
    fly(){
        console.log("fly");
    }
}

function foo(a:Human|Bird){
    let animal = a;

    if (animal instanceof Human){
        animal.swim();
    }
    else{
        animal.fly();
    }
}