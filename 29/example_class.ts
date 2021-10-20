
class Mammal{
    weight:number = 0;
    // weight2;
    color:string;
    constructor(weight:number, color:string){
        this.weight = weight;
        this.color = color;
    }
    speak(){
        println(this.color);
    }
}

let mammal = new Mammal(20,"white");

println(mammal.color);
// println(mammal.weight);
