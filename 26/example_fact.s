    .section	__TEXT,__text,regular,pure_instructions

    .global _factorial
_factorial:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
LBB0_1:
    cmpl	$1, %edi				#  cmpl	$1, var0
    jg	LBB0_3
## bb.2
    movl	%esi, %eax				#  movl	var1, returnSlot
    jmp	LBB0_4
LBB0_3:
    movl	%edi, %r10d				#  movl	var0, var2
    subl	$1, %r10d				#  subl	$1, var2
    movl	%edi, %r11d				#  movl	var0, var3
    imull	%esi, %r11d				#  imull	var1, var3
    movl	%r10d, %edi
    movl	%r11d, %esi
    jmp	LBB0_1					#  Tail Recursive Optimazation
LBB0_4:
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$8, %rsp
    pushq	%rbx
## bb.1
    movl	$10, %edi
    movl	$1, %esi
    callq	_factorial
    movl	%eax, %r10d				#  movl	returnSlot, var3
    movl	%r10d, %edi
    callq	_println
    callq	_tick
    movl	%eax, %r11d				#  movl	returnSlot, var4
    movl	%r11d, %edi				#  movl	var4, var0
    movl	$0, %esi				#  movl	$0, var1
LBB1_2:
    cmpl	$100000000, %esi		#  cmpl	$100000000, var1
    jge	LBB1_4
## bb.3
    movl	%edi, -4(%rbp)			#  spill	var0
    movl	$15, %edi
    movl	%esi, -8(%rbp)			#  spill	var1
    movl	$1, %esi
    movl	%esi, -8(%rbp)			#  spill	var1
    callq	_factorial
    movl	%eax, %edx				#  movl	returnSlot, var5
    movl	-8(%rbp), %esi			#  reload	var1
    movl	-4(%rbp), %edi			#  reload	var0
    movl	%esi, %ecx				#  movl	var1, var6
    movl	%esi, %r8d				#  movl	var1, var7
    addl	$1, %ecx				#  addl	$1, var6
    movl	%ecx, %esi				#  movl	var6, var1
    jmp	LBB1_2
LBB1_4:
    movl	%edi, -4(%rbp)			#  spill	var0
    callq	_tick
    movl	%eax, %r9d				#  movl	returnSlot, var8
    movl	-4(%rbp), %edi			#  reload	var0
    movl	%r9d, %eax				#  movl	var8, var2
    movl	%eax, %ebx				#  movl	var2, var9
    subl	%edi, %ebx				#  subl	var0, var9
    movl	%ebx, %edi
    callq	_println
    popq	%rbx
    addq	$8, %rsp
    popq	%rbp
    retq
    .cfi_endproc
