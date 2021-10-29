

// function println(data:any=""){
//     console.log(data);
// }

//编号的组成部分
let segment:number = 1000;

function idGenerator():()=>number{
    let nextId = 0;

    function getId(){
        return segment + nextId++;  //访问了2个尾部变量
    }

    //在与getId相同的作用域中调用它
    println("getId:" + getId());
    println("getId:" + getId());

    //恢复nextId的值
    nextId = 0;

    return getId;
}

println("id1:");
let id1 = idGenerator();
println(id1());  //1000
println(id1());  //1001

//修改segment的值，会影响到id1和id2两个闭包。
segment = 2000;

//新创建一个闭包，重新开始编号
println("id2:");
let id2 = idGenerator();
println(id2());  //2000
println(id2());  //2001

//闭包可以通过赋值和参数传递，在没有任何变量引用它的时候，生命周期才会结束。
println("id3:");
let id3 = id1;
println(id3());  //2002


function foo():()=>number{
    println("id4:");
    let id4 = idGenerator();
    println(id4());
    println(id4());
    return id4;
}

let id5 = foo();
println("id5:");
println(id5());
println(id5());

