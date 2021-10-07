    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$8, %rsp
    pushq	%rbx
    pushq	%r12
    pushq	%r13
    pushq	%r14
    pushq	%r15
## bb.1
    movl	%edi, %r10d				#  movl	var0, var11
    imull	%esi, %r10d				#  imull	var1, var11
    movl	%r10d, %r11d				#  movl	var11, var8
    movl	%edx, %eax				#  movl	var2, var12
    imull	%ecx, %eax				#  imull	var3, var12
    movl	%eax, %ebx				#  movl	var12, var9
    movl	%r11d, %r12d				#  movl	var8, var13
    addl	%ebx, %r12d				#  addl	var9, var13
    movl	%r8d, %r13d				#  movl	var4, var14
    imull	%r9d, %r13d				#  imull	var5, var14
    addl	%r13d, %r12d				#  addl	var14, var13
    movl	16(%rbp), %edi
    movl	24(%rbp), %esi
    callq	_bar
    movl	%eax, %r14d				#  movl	returnSlot, var15
    addl	%r14d, %r12d				#  addl	var15, var13
    movl	%r12d, %r15d				#  movl	var13, var10
    movl	%ebx, %edi
    movl	%r15d, %esi
## bb.2
    popq	%r15
    popq	%r14
    popq	%r13
    popq	%r12
    popq	%rbx
    addq	$8, %rsp
    popq	%rbp
    jmp	_bar					#  Tail Call Optimazation
    .cfi_endproc

    .global _foo2
_foo2:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
    pushq	%rbx
    pushq	%r12
## bb.1
    movl	%edi, %r10d				#  movl	var0, var10
    imull	%esi, %r10d				#  imull	var1, var10
    movl	%r10d, %r11d				#  movl	var10, var8
    movl	%edx, %eax				#  movl	var2, var11
    imull	%ecx, %eax				#  imull	var3, var11
    movl	%eax, %ebx				#  movl	var11, var9
    movl	%r11d, %edi
    movl	%ebx, %esi
    movl	$3, %edx
    movl	$4, %ecx
    movl	$5, %r8d
    movl	$6, %r9d
    movl	$7, (%rsp)
    movl	$8, 8(%rsp)
    callq	_foo
    movl	%eax, %r12d				#  movl	returnSlot, var12
    movl	%r12d, %eax				#  movl	var12, returnSlot
    popq	%r12
    popq	%rbx
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc

    .global _foo3
_foo3:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$8, %rsp
    pushq	%rbx
    pushq	%r12
    pushq	%r13
    pushq	%r14
    pushq	%r15
## bb.1
    movl	%edi, %r10d				#  movl	var0, var11
    imull	%esi, %r10d				#  imull	var1, var11
    movl	%r10d, %r11d				#  movl	var11, var8
    movl	%edx, %eax				#  movl	var2, var12
    imull	%ecx, %eax				#  imull	var3, var12
    movl	%eax, %ebx				#  movl	var12, var9
    movl	%r11d, %r12d				#  movl	var8, var13
    addl	%ebx, %r12d				#  addl	var9, var13
    movl	%r8d, %r13d				#  movl	var4, var14
    imull	%r9d, %r13d				#  imull	var5, var14
    addl	%r13d, %r12d				#  addl	var14, var13
    movl	16(%rbp), %edi
    movl	24(%rbp), %esi
    callq	_bar
    movl	%eax, %r14d				#  movl	returnSlot, var15
    addl	%r14d, %r12d				#  addl	var15, var13
    movl	%r12d, %r15d				#  movl	var13, var10
    cmpl	%r15d, %ebx				#  cmpl	var10, var9
    jle	LBB2_3
## bb.2
    movl	%ebx, %eax				#  movl	var9, returnSlot
    jmp	LBB2_4
LBB2_3:
    movl	%ebx, %edi
    movl	%r15d, %esi
    jmp	LBB2_5					#  Tail Call Optimazation
LBB2_4:
    popq	%r15
    popq	%r14
    popq	%r13
    popq	%r12
    popq	%rbx
    addq	$8, %rsp
    popq	%rbp
    retq
LBB2_5:
    popq	%r15
    popq	%r14
    popq	%r13
    popq	%r12
    popq	%rbx
    addq	$8, %rsp
    popq	%rbp
    jmp	_bar					#  Tail Call Optimazation
    .cfi_endproc

    .global _bar
_bar:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movl	%edi, %r10d				#  movl	var0, var2
    addl	%esi, %r10d				#  addl	var1, var2
    movl	%r10d, %eax				#  movl	var2, returnSlot
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    movl	$1, %edi
    movl	$2, %esi
    movl	$3, %edx
    movl	$4, %ecx
    movl	$5, %r8d
    movl	$6, %r9d
    movl	$7, (%rsp)
    movl	$8, 8(%rsp)
    callq	_foo
    movl	%eax, %r10d				#  movl	returnSlot, var0
    movl	%r10d, %edi
    callq	_println
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc
