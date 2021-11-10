# Craft A Language

#### 介绍

极客时间《手把手带你写一门编程语言》课程第38节示例代码。

#### 本节的测试程序  
example_opt1.ts  测试本地优化功能。
运行：node play example_opt1.ts --dumpIR
运行结果会生成.dot文件，可以用graphviz或vscode查看（用预览模式可以看到图形）。  
在图形中，为每个DataNode显示了inputs和uses的数量。  

#### 环境配置注意事项

注意：从26节开始，要用"npm install ieee754"来安装一个ieee754的库，支持浮点数的转换。      

#### 之前课程的测试程序    
本目录下有多个测试程序，用来测试编译器生成的汇编代码是否正确。每个测试程序都有TypeScript版本和等价的C语言版本。你可以比较它们对应的汇编文件的不同。  
TypeScript版本和C语言版本的测试程序，都可以用make命令来构建，并生成相同文件名的可执行文件。    
1.example_param.ts    
测试参数传递。  
构建：make example_param     
对应的c程序：param.c   
构建：make param  
2.example_if.ts    
测试if语句。  
构建：make example_if     
对应的c程序：if.c   
构建：make if  
3.example_for.ts    
测试for循环。  
构建：make example_for     
对应的c程序：for.c   
构建：make for  
4.example_unary.ts    
测试一元运算。  
构建：make example_unary     
对应的c程序：unary.c   
构建：make unary  
5.example_fibo.ts    
斐波那契数列。   
构建：make example_fibo，或直接make，因为该命令是Makefile的第一个命令。     
对应的c程序：fibo.c   
构建：make fibo  
6.example_fact.ts    
阶乘，用来演示尾递归优化。   
构建：make example_fact。     
对应的c程序：fact.c   
构建：make fact  
7.example_tail.ts    
用来演示尾调用优化。   
构建：make example_tail。     
对应的c程序：tail.c   
构建：make tail，只是生成.s文件，用于对比C语言生成的汇编代码，并没有生成可执行文件。这是为了避免编译器根据输入的参数做全局优化。   
8.example_return.ts   
对return情况做语义分析。    
运行：node play example_return.ts。   
9.example_assign.ts   
变量赋值分析。  
运行：node play example_assign.ts  
10.example_type.ts   
用于测试联合类型、值类型、子类型和Any类型。  
使用：node play example_type.ts  
11.example_str.ts  
测试对字符串数据类型的支持。  
构建：make example_str   
对应的c程序：  str.c    
测试与字符串类型有关的内置函数  
构建：make str  
12.example_array.ts。    
测试对数组类型的支持。 
构建：make example_array 
对应的C程序：array.c
构建：make array   
13.example_class.ts。
测试自定义类、创建对象、访问对象属性和方法的功能。   
构建：make example_class 
对应的C程序：class.c
构建：make class    
14:example_class2.ts。
测试自定义类、创建对象、访问对象属性和方法的功能。   
构建：make example_class2 
15.example_fp.ts   
测试高阶函数特性。   
AST解释器版：node play exameple_fp.ts  
16.example_closure.ts   
测试闭包特性。  
运行：node play example_closure.ts.
17.example_closure2.ts   
测试更复杂一点的闭包特性。  
运行：node play example_closure2.ts.
18.example_metadata.ts
测试生成函数的元数据。
运行：node play example_metadata.ts --dumpAsm，看看生成的汇编代码中的元数据。   
19.example_gc.ts   
测试垃圾回收功能。
构建：make example_gc
运行：./example_gc
20.example_ir.ts  测试把AST转化成IR。
运行：node play example_ir.ts --dumpIR
运行结果会生成.dot文件，可以用graphviz或vscode查看（用预览模式可以看到图形）。

#### 运行编译器

一个简单的TypeScript编译器和解释器。  
使用:	node play (-B|--dumpBC|--dumpAsm)? (-v)? FileName  
	node play --help  
举例：  
	node play example.ts -> 用AST解释器执行example.ts  
	node play example.bc -> 用字节码虚拟机执行example.bc  
	node play -B example.ts -> 编译成字节码执行  
	node play --dumpAsm example.ts -> 编译成字节码执行，并保存到.bc文件中  
	node play --dumpAsm example.ts -> 编译成汇编代码，保存到.s文件中  
可选参数：  
	-B:	用字节码虚拟机运行程序。缺省用AST解释器执行程序。  
	--dumpBC:	编译成字节码，保存到.bc文件中。  
	--dumpAsm:	编译成x86_64的汇编代码，保存到.s文件中。  
	-v:	显示编译过程中的详细信息。  
	--help:	显示当前的帮助信息。  
FileName：  
	文件后缀可以是.ts或.bc，分别作为TypeScript和字节码文件读入。当文件后缀为.bc时，自动启动-B选项，用字节码虚拟机运行字节码文件。  








