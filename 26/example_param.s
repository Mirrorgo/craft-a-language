    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, %r10d				#  movl	var0, var10
    imull	%esi, %r10d				#  imull	var1, var10
    movl	%r10d, %edi				#  movl	var10, var8
    movl	%edx, %esi				#  movl	var2, var11
    imull	%ecx, %esi				#  imull	var3, var11
    movl	%esi, %edx				#  movl	var11, var9
    movl	%edi, %ecx				#  movl	var8, var12
    addl	%edx, %ecx				#  addl	var9, var12
    movl	%r8d, %r10d				#  movl	var4, var13
    imull	%r9d, %r10d				#  imull	var5, var13
    addl	%r10d, %ecx				#  addl	var13, var12
    movl	16(%rbp), %r8d			#  movl	var6, var14
    imull	24(%rbp), %r8d			#  imull	var7, var14
    addl	%r8d, %ecx				#  addl	var14, var12
    movl	%ecx, %eax				#  movl	var12, returnSlot
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$32, %rsp
    movl	$10, %r10d				#  movl	$10, var0
    movl	$12, %r11d				#  movl	$12, var1
    movl	%r10d, %edi				#  movl	var0, var3
    imull	%r11d, %edi				#  imull	var1, var3
    movl	%edi, -4(%rbp)			#  spill	var3
    movl	%r10d, %edi
    movl	%r11d, %esi
    movl	$1, %edx
    movl	$2, %ecx
    movl	$3, %r8d
    movl	$4, %r9d
    movl	%r11d, -8(%rbp)			#  spill	var1
    movl	%r10d, -12(%rbp)		#  spill	var0
    movl	$5, (%rsp)
    movl	$6, 8(%rsp)
    callq	_foo
    movl	%eax, %esi				#  movl	returnSlot, var4
    movl	-4(%rbp), %edi			#  reload	var3
    movl	-8(%rbp), %r11d			#  reload	var1
    movl	-12(%rbp), %r10d		#  reload	var0
    addl	%esi, %edi				#  addl	var4, var3
    movl	%edi, -4(%rbp)			#  spill	var3
    movl	%r11d, %edi
    movl	%r10d, %esi
    movl	$7, %edx
    movl	$8, %ecx
    movl	$9, %r8d
    movl	$10, %r9d
    movl	$11, (%rsp)
    movl	$12, 8(%rsp)
    callq	_foo
    movl	%eax, %r10d				#  movl	returnSlot, var5
    movl	-4(%rbp), %edi			#  reload	var3
    addl	%r10d, %edi				#  addl	var5, var3
    movl	%edi, %r11d				#  movl	var3, var2
    movl	%r11d, %edi
    callq	_println
    addq	$32, %rsp
    popq	%rbp
    retq
    .cfi_endproc
