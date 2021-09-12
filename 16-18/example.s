    .section	__TEXT,__text,regular,pure_instructions

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
    movl	$0, %eax
    movl	%eax, -4(%rbp)
LBB0_1:
    movl	-4(%rbp), %r10d
    cmpl	$5, %r10d
    jge	LBB0_3
## bb.2
    movl	%eax, -8(%rbp)
    movl	%r10d, -12(%rbp)
    movl	%r11d, -16(%rbp)
    movl	%edi, -20(%rbp)
    movl	-4(%rbp), %edi
    callq	_println
    movl	-8(%rbp), %r10d
    movl	-12(%rbp), %r11d
    movl	-16(%rbp), %edi
    movl	-20(%rbp), %esi
    movl	-4(%rbp), %edi
    movl	-4(%rbp), %esi
    addl	$1, %edi
    movl	%edi, -4(%rbp)
    jmp	LBB0_1
LBB0_3:
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc
