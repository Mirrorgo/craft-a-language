    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    cmpl	%esi, %edi				#  cmpl	var1, var0
    jle	LBB0_2
## bb.1
    movl	%edi, %esi				#  movl	var0, var2
    addl	$5, %esi				#  addl	$5, var2
    movl	%esi, %eax				#  movl	var2, returnSlot
    jmp	LBB0_3
LBB0_2:
    movl	%edi, %esi				#  movl	var0, var3
    subl	$5, %esi				#  subl	$5, var3
    movl	%esi, %eax				#  movl	var3, returnSlot
LBB0_3:
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	$15, %edi
    movl	$10, %esi
    callq	_foo
    movl	%eax, %r10d				#  movl	returnSlot, var0
    movl	%r10d, %edi
    callq	_println
    movl	$10, %edi
    movl	$10, %esi
    callq	_foo
    movl	%eax, %r10d				#  movl	returnSlot, var1
    movl	%r10d, %edi
    callq	_println
    popq	%rbp
    retq
    .cfi_endproc
