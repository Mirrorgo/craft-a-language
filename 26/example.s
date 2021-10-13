    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, %r10d				#  movl	var0, var1
    addl	$10, %r10d				#  addl	$10, var1
    movl	%r10d, %eax				#  movl	var1, returnSlot
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	$5, %edi
    callq	_foo
    movl	%eax, %r10d				#  movl	returnSlot, var0
    movl	%r10d, %edi
    callq	_println
    popq	%rbp
    retq
    .cfi_endproc
