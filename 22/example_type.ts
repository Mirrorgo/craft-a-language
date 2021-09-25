/**
 * 类型分析。
 */

function foo1(a:number){
    let b:number = a + 1;
    let c = true;
    // if (a != null){
    //     let c:number = a + 2;
    // }
}

// function foo2(a:number|string){
//     let b:number = a + 1;
//     if (typeof a == 'number'){
//         let c:number = a + 2;
//     }
// }

// function foo3(){
//     let a = "hello"; 
//     a = 7;
//     let b:any = "world";
//     b = 8;
//     let c;
//     c = "hello";
//     c = 9;
// }

// function foo3(a:any){
//     let b:number = a + 2;
//     a = "hello";
//     let c:number = a*3;
//     return c;
// }

// console.log(foo3());