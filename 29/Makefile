example_fibo : rt_objs
	@echo "为$@.ts生成汇编代码文件..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件..."
	gcc -o $@ $@.s rt/*.o

fibo : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2

	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o -O2

example_fact : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

fact : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2

	@echo "为$@.c生成可执行文件..."
	gcc -o $@ $@.c rt/*.o -O2

example_tail : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

tail : 
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2

example_if : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

if : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2

	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

example_for : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

for : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o -O2 

example_param : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

param : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

example_unary : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

unary : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

example_str : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

str : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

example_array : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

array : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

example_class : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

class : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

example_class2 : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

class2 : rt_objs
	@echo "为$@.cpp生成汇编代码文件$@.s..."
	g++ -S $@.cpp -o $@.s
	
	@echo "为$@.c生成可执行文件$@..."
	g++ -o $@ $@.cpp rt/*.o 

example_fp : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

fp : rt_objs
	@echo "为$@.c生成汇编代码文件$@.s..."
	gcc -S $@.c -o $@.s -O2
	
	@echo "为$@.c生成可执行文件$@..."
	gcc -o $@ $@.c rt/*.o 

foo : rt_objs
	@echo "为$@.s生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

rt_objs :
	@echo "编译运行时库..."
	cd rt && gcc -c -O2 *.c

example : rt_objs
	@echo "为$@.ts生成汇编代码文件$@.s..."
	$(shell node play --dumpAsm $@.ts > /dev/null)

	@echo "为$@.ts生成可执行文件$@..."
	gcc -o $@ $@.s rt/*.o

playvm : rt_objs
	@echo "生成c语言版本的虚拟机palyvm..."
	gcc -o $@ vm/*.c rt/*.o

.PHONY : clean
clean : 
	@echo "删除rt/*.o example_fibo example playvm..."
	@-rm -fr rt/*.o example_fibo fibo foo example playvm example_for for example_if example_str str example_array array example_tail tail example_assign assign example_fact fact example_param param example_reg example_unary unary class example_class class2 example_class2 fp
