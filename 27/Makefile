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
	@-rm -fr rt/*.o example_fibo example playvm
