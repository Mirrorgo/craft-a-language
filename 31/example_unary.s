    .section	__TEXT,__text,regular,pure_instructions

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
    movl	$10, %eax
    movl	%eax, -4(%rbp)
    movl	-4(%rbp), %r10d
    movl	-4(%rbp), %r11d
    addl	$1, %r10d
    movl	%r10d, -4(%rbp)
    addl	$1, %r11d
    movl	%r11d, -8(%rbp)
    movl	-4(%rbp), %r10d
    addl	$1, %r10d
    movl	%r10d, -4(%rbp)
    addl	$1, %r10d
    movl	%r10d, -12(%rbp)
    movl	$0, %edi
    subl	-4(%rbp), %edi
    movl	%edi, -16(%rbp)
    movl	%eax, -20(%rbp)
    movl	%r10d, -24(%rbp)
    movl	%r11d, -28(%rbp)
    movl	%edi, -32(%rbp)
    movl	-8(%rbp), %edi
    callq	_println
    movl	-20(%rbp), %r10d
    movl	-24(%rbp), %r11d
    movl	-28(%rbp), %edi
    movl	-32(%rbp), %esi
    movl	%r10d, -20(%rbp)
    movl	%r11d, -24(%rbp)
    movl	%edi, -28(%rbp)
    movl	%esi, -32(%rbp)
    movl	-12(%rbp), %edi
    callq	_println
    movl	-20(%rbp), %r10d
    movl	-24(%rbp), %r11d
    movl	-28(%rbp), %edi
    movl	-32(%rbp), %esi
    movl	%r10d, -20(%rbp)
    movl	%r11d, -24(%rbp)
    movl	%edi, -28(%rbp)
    movl	%esi, -32(%rbp)
    movl	-16(%rbp), %edi
    callq	_println
    movl	-20(%rbp), %r10d
    movl	-24(%rbp), %r11d
    movl	-28(%rbp), %edi
    movl	-32(%rbp), %esi
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc
