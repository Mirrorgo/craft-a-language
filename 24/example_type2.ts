/**
 * 测试一些更深入的类型分析的例子。
 * 
 */

function foo1(age : number|null){
    println("foo1");
    let age1 : string|number;
    age1 = age;  //编译器在这里会检查出错误。
}

function foo2(age1 : number|null, age2:string|number){
    println("foo2");
    if (age1 == age2){  //OK。只要两个类型有交集就可以。
        // console.log("same age!");
        println("same age!");
    }
}

function foo3(x : number|null, y:string|boolean){
    println("foo3");
    if (x == y){   //编译器报错：两个类型没有交集
        println("x and y is the same");
    }
}

function foo4(age1 : number|null, age2:string|number){
    println("foo4");
    if (age1 >= age2){  //编译器报错
        println("bigger age!");
    }
}

function foo5(age1 : number, age2:string|number){
    println("foo5");
    if (age1 >= age2){  //OK。
        println("bigger age!");
    }
}

function foo6(age : number|null){
    println("foo6");
    let age1 : string|number;
    age = 18;     //age的类型现在变成了一个值类型：18
    age1 = age;   //这里编译器不再报错。
    println(""+age1);
    // console.log(age1);
}
foo6(18);

function foo7(age : number|null){
    println("foo7");
    let age1 : string|number;
    age = 18;     //age的值域现在变成了一个值类型：18
    age1 = age;   //这里编译器不再报错。
    age = null;   //age的值域现在变成了null
    age1 = age;   //错误！
    println(""+age1);
    // console.log(age1);
}

function foo8(age : number|null){
    println("foo8");
    let age1 : string|number;
    if (age != null){   //age的值域现在是number
        age1 = age;     //OK!
        println(""+age1);
    }
    else{               //age==null, 值域现在变成了null
        println("age is empty!");
    }
}

// function foo9(age : number|null){
//     if (age == 18 || age == 81){  //age的值域现在是 18|81
//         console.log("18 or 81");
//     }
//     else{                         //age的值域是 !18 & !81 & (number | null)
//         console.log("age is empty!")
//     }
// }




