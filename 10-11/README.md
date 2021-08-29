# Craft A Language

#### 介绍

极客时间《手把手带你写一门计算机语言》课程10-11节示例代码

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


#### 编译C语言版的虚拟机

为了方便编译，我做了一个Makefile文件，也就是make工具的配置文件。  
你只需要在当前目录下，运行make命令，就会生成playvm文件，这个文件就是虚拟机的可执行文件。   
运行“make clean”命令，可以删除前面的命令所生成的.o文件和playvm文件。  

#### 使用C语言版本虚拟机

1.首先，需要把.ts文件编译成字节码文件，例如：   
node play --dumpBC example.ts   
这个命令会生成一个example.bc文件。  
2.用虚拟机运行字节码文件  
./playvm example.bc  

#### Debug

我已经为vscode配置了一个开发环境，相关配置文件在vm/.vscode子目录下。  
用vscode打开vm子目录，就可以运行和调试栈机的代码。  
不过，我这里使用的是mac电脑，你的开发环境不一样的话，可能需要手工修改.json文件里的某些配置项，包括：  
* 将clang修改成gcc  
* 讲lldb修改成gdb  





