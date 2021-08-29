playvm : rt_objs
	@echo "生成c语言版本的虚拟机palyvm..."
	gcc -o $@ vm/*.c rt/*.o

rt_objs :
	@echo "编译运行时库..."
	cd rt && gcc -c -O2 *.c

.PHONY : clean
clean : 
	@echo "删除rt/*.o playvm..."
	@-rm -fr rt/*.o playvm

