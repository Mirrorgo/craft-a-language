    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    cmpl	%esi, %edi				#  cmpl	var1, var0
    jge	LBB0_3
## bb.2
    movl	%edi, %r10d				#  movl	var0, var2
    addl	$5, %r10d				#  addl	$5, var2
    movl	%r10d, %eax				#  movl	var2, returnSlot
    jmp	LBB0_4
LBB0_3:
    movl	%edi, %r11d				#  movl	var0, var3
    subl	$5, %r11d				#  subl	$5, var3
    movl	%r11d, %eax				#  movl	var3, returnSlot
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
## bb.1
    movl	$15, %edi
    movl	$10, %esi
    callq	_foo
    movl	%eax, %r10d				#  movl	returnSlot, var0
    movl	%r10d, %edi
    callq	_println
    movl	$9, %edi
    movl	$10, %esi
    callq	_foo
    movl	%eax, %r11d				#  movl	returnSlot, var1
    movl	%r11d, %edi
    callq	_println
    popq	%rbp
    retq
    .cfi_endproc
