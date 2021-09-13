    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, -4(%rbp)
    movl	%esi, -8(%rbp)
    movl	%edx, -12(%rbp)
    movl	%ecx, -16(%rbp)
    movl	%r8d, -20(%rbp)
    movl	%r9d, -24(%rbp)
    movl	-4(%rbp), %eax
    imull	-8(%rbp), %eax
    movl	%eax, -28(%rbp)
    movl	-12(%rbp), %r10d
    imull	-16(%rbp), %r10d
    movl	%r10d, -32(%rbp)
    movl	-28(%rbp), %r11d
    addl	-32(%rbp), %r11d
    movl	-20(%rbp), %edi
    imull	-24(%rbp), %edi
    addl	%edi, %r11d
    movl	16(%rbp), %edi
    imull	24(%rbp), %edi
    addl	%edi, %r11d
    movl	%r11d, %eax
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
    movl	$10, %eax
    movl	%eax, -4(%rbp)
    movl	$12, %r10d
    movl	%r10d, -8(%rbp)
    movl	%eax, -12(%rbp)
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	-8(%rbp), %edi
    movl	-4(%rbp), %esi
    movl	$3, %edx
    movl	$4, %ecx
    movl	$5, %r8d
    movl	$6, %r9d
    movl	$7, (%rsp)
    movl	$8, 8(%rsp)
    callq	_foo
    movl	-12(%rbp), %r10d
    movl	-16(%rbp), %r11d
    movl	-20(%rbp), %edi
    movl	%eax, %edi
    movl	%r10d, -12(%rbp)
    movl	%r11d, -16(%rbp)
    movl	%edi, -20(%rbp)
    callq	_println
    movl	-12(%rbp), %r10d
    movl	-16(%rbp), %r11d
    movl	-20(%rbp), %edi
    addq	$32, %rsp
    popq	%rbp
    retq
    .cfi_endproc
