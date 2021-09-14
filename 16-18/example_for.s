    .section	__TEXT,__text,regular,pure_instructions

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$48, %rsp
    movl	$0, %eax
    movl	%eax, -4(%rbp)
    movl	$0, %r10d
    movl	%r10d, -8(%rbp)
LBB0_1:
    movl	-8(%rbp), %r11d
    cmpl	$10, %r11d
    jge	LBB0_3
## bb.2
    movl	-4(%rbp), %edi
    addl	-8(%rbp), %edi
    movl	-4(%rbp), %esi
    movl	%edi, %esi
    movl	%esi, -4(%rbp)
    movl	-8(%rbp), %edi
    movl	-8(%rbp), %edx
    addl	$1, %edi
    movl	%edi, -8(%rbp)
    jmp	LBB0_1
LBB0_3:
    movl	%eax, -12(%rbp)
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%edi, -24(%rbp)
    movl	%esi, -28(%rbp)
    movl	%edx, -32(%rbp)
    movl	-4(%rbp), %edi
    callq	_println
    movl	-12(%rbp), %r10d
    movl	-16(%rbp), %r11d
    movl	-20(%rbp), %edi
    movl	-24(%rbp), %esi
    movl	-28(%rbp), %edx
    movl	-32(%rbp), %ecx
    addq	$48, %rsp
    popq	%rbp
    retq
    .cfi_endproc
