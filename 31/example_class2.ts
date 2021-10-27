// function println(data:any=""){
//     console.log(data);
// }

class Mammal{
    weight:number = 0;
    color:string;
    constructor(weight:number, color:string){
        this.weight = weight;  
        this.color = color;
    }
    speak(){
        println("Hello, I'm a mammal, and my weight is " + this.weight + ".");
    }
}

// class Human extends Mammal{  //新的语法要素：extends
//     name:string;
//     constructor(weight:number, color:string, name:string){
//         super(weight,color); //新的语法要素：super
//         this.name = name;
//     }
//     swim(){
//         println("My weight is " +this.weight + ", so I swimming to exercise.");
//     }
//     speak(){
//         println("Hello PlayScript!");
//     }
// }


class Cat extends Mammal{
    constructor(weight:number, color:string){
        super(weight,color);
    }
    catchMouse(){
        println("I caught a mouse! Yammy!");
    }
    speak(){
        println("Miao~~");
    }
}

// function foo(mammal:Mammal){
//     mammal.speak();
// }

let mammal1 : Mammal;
// let mammal2 : Mammal;

mammal1 = new Cat(1,"white");
mammal1.speak();
// mammal2 = new Human(20, "yellow", "Richard");

// foo(mammal1);
// foo(mammal2);
