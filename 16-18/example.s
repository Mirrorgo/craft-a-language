    .section	__TEXT,__text,regular,pure_instructions

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$32, %rsp
    movl	$10, %eax
    movl	%eax, -4(%rbp)
    movl	-4(%rbp), %r10d
    imull	$2, %r10d
    movl	%r10d, -8(%rbp)
    movl	-4(%rbp), %r11d
    addl	-8(%rbp), %r11d
    movl	%eax, -12(%rbp)
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%r11d, %edi
    callq	_println
    movl	-12(%rbp), %r10d
    movl	-16(%rbp), %r11d
    movl	-20(%rbp), %edi
    addq	$32, %rsp
    popq	%rbp
    retq
    .cfi_endproc
