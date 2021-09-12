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
    movl	-4(%rbp), %edi
    callq	_println
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc
