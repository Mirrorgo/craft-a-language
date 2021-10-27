
class Mammal{
    weight:number;
    color:string;
    constructor(weight:number, color:string){
        this.weight = weight;  //技术点：this的准确消解
        this.color = color;
    }
    speak(){
        println("Hello, my color is:");
        println(this.color);
    }
}

let mammal = new Mammal(20,"white"); //技术点1：把Mammal()消解到构造函数；技术点2：变量的类型是Mammal，而不是constructor的返回值void；技术点3：额外多传一个参数

println(mammal.color);    //技术点：右值，返回变量属性的值
println(mammal.weight);

mammal.color = "yellow";  //技术点：左值，给变量的属性赋值
println(mammal.color);

mammal.speak();          //技术点：调用方法


