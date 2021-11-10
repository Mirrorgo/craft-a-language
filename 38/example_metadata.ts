
// class Cat{
//     color:string;
//     weight:number;
//     constructor(weight:number, color:string){
//         this.color = color;
//         this.weight = weight;
//     }
// }

// function foo(a:number):number{
//     let c:number = bar(a+5);
//     // let cat = new Cat(1, "black");
//     // println(cat.color);
//     return c;
// }

function foo(b:number):number{
    let a:number[] = [1,2,b];   
    let s:string = "Hello PlayScript!";
    println(s);
    println(a[2]);
    return b*10;
}

println(foo(2));
