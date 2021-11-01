"use strict";
function println(data) {
    if (data === void 0) { data = ""; }
    console.log(data);
}
//编号的组成部分
var segment = 1000;
function idGenerator() {
    var nextId = 0;
    function getId() {
        return segment + nextId++; //访问了2个尾部变量
    }
    //在与getId相同的作用域中调用它
    println("getId:" + getId());
    println("getId:" + getId());
    //恢复nextId的值
    nextId = 0;
    return getId;
}
println("\nid1:");
var id1 = idGenerator();
println(id1()); //1000
println(id1()); //1001
//修改segment的值，会影响到id1和id2两个闭包。
segment = 2000;
//新创建一个闭包，重新开始编号
println("\nid2:");
var id2 = idGenerator();
println(id2()); //2000
println(id2()); //2001
//闭包可以通过赋值和参数传递，在没有任何变量引用它的时候，生命周期才会结束。
println("\nid3:");
var id3 = id1;
println(id3()); //2002
function foo() {
    println("\nid4:");
    var id4 = idGenerator();
    println(id4());
    println(id4());
    return id4;
}
var id5 = foo();
println("\nid5:");
println(id5());
println(id5());
function bar() {
    var segment2 = 100;
    function idGenerator() {
        var nextId = 0;
        function getId() {
            return segment + segment2 + nextId++; //访问了2个尾部变量
        }
        //在与getId相同的作用域中调用它
        println("getId in bar:" + getId());
        segment += 100;
        println("getId in bar:" + getId());
        //恢复nextId的值
        nextId = 0;
        return getId;
    }
    println("\nid6:");
    var id6 = idGenerator();
    println("\nid6:");
    println(id6());
    println(id6());
    return id6;
}
println("\nid7:");
var id7 = bar();
println(id7());
println(id7());
