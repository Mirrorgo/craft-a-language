# Craft A Language

#### 介绍

极客时间《手把手带你写一门编程语言》课程16-18节示例代码。

#### 测试程序    
本目录下有多个测试程序，用来测试编译器生成的汇编代码是否正确。每个测试程序都有TypeScript版本和等价的C语言版本。你可以比较它们对应的汇编文件的不同。  
TypeScript版本和C语言版本的测试程序，都可以用make命令来构建，并生成相同文件名的可执行文件。    
1.example_param.ts    
测试参数传递。  
构建命令：make example_param     
对应的c程序：param.c   
构建命令：make param  
2.example_if.ts    
测试if语句。  
构建命令：make example_if     
对应的c程序：if.c   
构建命令：make if  
3.example_for.ts    
测试for循环。  
构建命令：make example_for     
对应的c程序：for.c   
构建命令：make for  
4.example_unary.ts    
测试一元运算。  
构建命令：make example_unary     
对应的c程序：unary.c   
构建命令：make unary  
5.example_fibo.ts    
斐波那契数列。   
构建命令：make example_fibo，或直接make，因为该命令是Makefile的第一个命令。     
对应的c程序：fibo.c   
构建命令：make fibo  


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








