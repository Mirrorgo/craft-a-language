

// function println(data:any=""){
//     console.log(data);
// }

function idGenerator():()=>number{
    let nextId = 0;

    function getId(){
        return nextId++;  //访问了外部作用域的一个变量
    }

    return getId;
}

println("id1:");
let id1 = idGenerator();
println(id1());  //0
println(id1());  //1

//新创建一个闭包，重新开始编号
println("id2:");
let id2 = idGenerator();
println(id2());  //0
println(id2());  //1

//闭包可以通过赋值和参数传递，在没有任何变量引用它的时候，生命周期才会结束。
println("id3:");
let id3 = id1;
println(id3());  //2
