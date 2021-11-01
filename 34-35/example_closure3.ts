/**
 * 这是一个更复杂的闭包示例程序。
 * 函数bar >> idGenerator >> getId()形成三层嵌套。
 * 函数变量每往外传递一层，就有一个变量脱离当前作用域，从而需要被放到闭包数据中。
 */

function println(data:any=""){
    console.log(data);
}

//编号的组成部分
let segment:number = 1000;

function bar():()=>number{
    //编号的另一个组成部分
    let segment2:number = 100;
    function idGenerator():()=>number{
        let nextId = 0;
    
        function getId(){
            return segment + segment2 + nextId++;  //访问了3个外部变量
        }
    
        //在与getId相同的作用域中调用它
        println("getId in bar:" + getId());
        segment2 += 100;
        println("getId in bar:" + getId());
    
        //恢复nextId的值
        nextId = 0;
    
        return getId;
    }

    //在bar函数中调用，这时候可以看到segment2变量
    println("\nid6:");
    let id6 = idGenerator();
    println("\nid6:");
    println(id6());
    println(id6());

    return id6;
}

//在main函数中调用，这时候可以看到segment变量
//而segment2和nextId都保存在闭包对象里了。
println("\nid7:");
let id7 = bar();
println(id7());
println(id7());
