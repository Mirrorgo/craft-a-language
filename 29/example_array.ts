// 先用这个简单的测试程序
let ages:number[] = [8.0, 18.0, 28];  //技术点：整型字面量28要作为浮点型看待
ages[2] = 38;                         //技术点：1.给数组元素赋值；2.整数下标
let sum:number = 0;
for (let i:number = 0; i<3; i++){
    sum = sum + ages[i];              //技术点:浮点数转整数，计算出ages的下标
    println(ages[i]);
}
println(sum);


//字符串数组
let names:string[] = ["richard","sam", "john"];
names[1] = "julia";                   //数组元素赋值，左值
println(names[1]);
for (let i:number = 0; i< 3; i++){
   println(names[i]);                 //读取数组元素，右值
}


//二维数组
let a:number[][] = [[1,2,3],[4,5]];  //二维数组
a[0] = [4,5,6];          //修改一个维度
a[0][1] = 7;             //修改一个元素
// println(a[0][1]);        //打印一个元素
// println(a[0][2]);        //打印一个元素
