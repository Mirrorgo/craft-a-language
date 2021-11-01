
// class Cat{
//     color:string;
//     weight:number;
//     constructor(weight:number, color:string){
//         this.color = color;
//         this.weight = weight;
//     }
// }

function foo(a:number):string{
    let s:string = "PlayScript!"
    let b:number = bar(a+5);
    return s;
}

function bar(b:number):number{
    let a:number[] = [1,2,b];   
    let s:string = "Hello";
    println(s);
    println(a[2]);
    b = b*10;
    return b;
}

println(foo(2));
